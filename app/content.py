# -*- coding: utf-8 -*-
"""
    app.content
    ~~~~~~~~~~~

    Load raw content for generating pages

    Content comes from folders in the `content` folder. It is expected that
    these subfolders each represent a sort of type of content, with all data
    contained being of the same type.

    One function should be written for each folder, decorated by
    `load(type_name)`. It should return some kind of object representing all
    of the content of that type.

    That object will be keyed by `type_name` into an importable dict in this
    module, called `content`.

    At present, all content is loaded at import time.

"""

import os
import re
import json
import unicodedata
from datetime import date
from markdown import markdown, Markdown  # quick-use, extensions-able
from flask import Markup
from app import app


content = {}
content_path = os.path.join(app.root_path, app.config['CONTENT_FOLDER'])


meta_converters = {
    'noop': lambda x: x,
    'iso-date': lambda x: [date(*map(int, t.split('-'))) for t in x],
    'float': lambda x: map(float, x),
    'slugify': lambda x: [s.lowercase().replace(' ', '-') for s in x],
    'one': lambda x: x[0],
}


def slugify(value):
    """Converts to lowerase, removes non-word characters, spaces to hyphens

    Borrowed from django -- http://djangoproject.org -- BSD? licensed
    """
    value = unicodedata.normalize('NFKD', value).\
                        encode('ascii', 'ignore').\
                        decode('ascii')
    value = re.sub('[^\w\s-]', '', value).strip().lower()
    value = re.sub('[-\s]+', '-', value)
    return value


class MetaError(ValueError):
    """Errors arising from reading metadata"""
    def apply_context(self, **context):
        contextualized_message = self.message.format(**context)
        self.__init__(contextualized_message)


def apply_field_constraints(field_val, required, filters):
    if field_val is None:
        if required is True:
            raise KeyError('The blog {filename} is missing metadata: {field}')
        return None
    else:
        filtered = field_val
        for filter_name in reversed(filters):
            try:
                filtered = meta_converters[filter_name](filtered)
            except Exception as e:
                raise MetaError('Metadata {{field}} for blog post {{filename}}'
                                ' has issues:\n{}'.format(e))
        return filtered


def get_file_pairs(folder_path):
    """Provide (file_object, filename) pairs for all files in a given path.

    This is a generator, you can iterate it.
    """
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        try:
            with open(file_path) as file_object:
                yield file_object, filename
        except IOError as e:
            raise e  # todo: handle these nicely and make nice error messages


def load(type_name):
    """Wrap the loading procedure of each folder/type of content.

    This decorator handles file I/O and object storage for the decorated
    functions.

    The wrapped function should take a single parameter which must match the
    name of the folder.

    Its return value must represent all of the content for that content type.

    The decorated function will be called once, and will be passed an iterable
    of tuples of `(fileObj, filename)` pairs, one for each file present in its
    folder.
    """

    assert type_name not in content, 'Content loader collision: {} already '\
                                     'has a loader'.format(type_name)

    def loader_decorator(loader_func):
        path = os.path.join(content_path, type_name)
        assert os.path.isdir(path), '{} does not seem to be a folder in {}'\
                                    .format(type_name, content_path)
        file_pairs = get_file_pairs(path)

        content[type_name] = loader_func(file_pairs)

        return loader_func  # probably never used since it's called above
                            # ...kind of an abuse of decorators, I know...
    return loader_decorator


@load('blog')
def load_blog(blogs):
    """Load a blog post and its metadata for each file.

    Blog posts are expected to be markdown files with metadata at the top. The
    following metadata is required:

      * Title
      * Date -- use iso format: yyyy-mm-dd)
      * Authors -- if more than one, add a line-break and indent for each. eg:
            
            Authors: Llanco Talamantes
                     Mikel Maron

    These metadata fields are optional:

      * Modified -- iso format like Data

    The filename is used as the URL slug, minus the extension.

    Imported blog posts are thrown onto a big list in dictionaries that look
    like this:

        {
            'body': <html string>,
            'title': <string>,
            'slug': <string>,
            'authors': <list of strings>,
            'date': <datetime.Date>,
            'modified': <datetime.Date or None>,
        }
    """
    meta = {
        'title':    (True, ('one',)),
        'authors':  (True, ('noop',)),
        'date':     (True, ('one', 'iso-date')),
        'modified': (False, ('one', 'iso-date')),
    }
    markdowner = Markdown(extensions=['meta'], output_format='html5')
    posts = []

    for blog_file, filename in blogs:
        post = {}
        html = markdowner.convert(blog_file.read())  # also loads metadata
        post['body'] = Markup(html)
        post['slug'] = os.path.splitext(filename)[0]

        for field, (required, filters) in meta.items():
            field_val = markdowner.Meta.get(field)
            try:
                val = apply_field_constraints(field_val, required, filters)
            except MetaError as e:
                e.apply_context(filename=filename, field=field)
                raise e
            post[field] = val

        posts.append(post)
        markdowner.reset()

    posts.sort(key=lambda post: post['date'], reverse=True)

    return posts



@load('schools')
def load_schools(school_stuff):
    """Load many schools' data from each (and likely only one) geojson file.

    Transforms the data to a dict of these:

        {
            'name': '<string>',
            'lat': '<float>',
            'lon': '<float',
        }

    keyed by slug
    """
    schools = []
    seen_slugs = set()
    for school_file, filename in school_stuff:
        school_data = json.load(school_file)
        for school_geojson in school_data['features']:
            assert school_geojson['geometry']['type'] == 'Point',\
                'Expected point geometry for schools in {}'.format(filename)

            school = {}
            school['name'] = school_geojson['properties']['official_name']
            school['lat'] = float(school_geojson['geometry']['coordinates'][1])
            school['lon'] = float(school_geojson['geometry']['coordinates'][0])
            slug = slugify(school['name'])
            assert slug not in seen_slugs, 'duplicate school slug {} from {}'\
                                           .format(slug, filename)
            seen_slugs.add(slug)
            school['slug'] = slug
            schools.append(school)

    return schools


# @load('stories')
# def load_stories(stories):
#     pass



