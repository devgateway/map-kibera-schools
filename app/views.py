# -*- coding: utf-8 -*-
"""
    app.views
    ~~~~~~~~~

    The endpoints and stuff

"""

from flask import render_template, abort
from . import app
from .static import static
from .content import content


@app.context_processor
def inject_static():
    return {'static': static}


@app.context_processor
def inject_content():
    """Inject content for templates"""
    return {'content': content}


def indexed(list_of_stuff, key):
    """Create a mapping to elements of a list of dicts by a property.

    The dict is not copied, so while it does have to iterate the whole list,
    the resulting structure should be very small.
    """
    indexed = {}
    for thing in list_of_stuff:
        assert key in thing, 'key {} not found in thing {}'.format(key, thing)
        assert thing[key] not in indexed,\
            'duplicate index key {}: {}'.format(key, thing[key])
        indexed[thing[key]] = thing
    return indexed


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/schools.geojson')
def schools_geojson():
    with open('content/schools/schools.geojson') as f:
        return f.read()


@app.route('/schools/<slug>/')
def school(slug):
    this_school = indexed(content['schools'], 'slug').get(slug) or abort(404)
    return render_template('school-profile.html', school=this_school)


def school_url_generator():
    """Generate all the urls for schools for freezing"""
    for school in content['schools']:
        yield 'school', {'slug': school['slug']}


@app.route('/blog/<slug>/')
def blog(slug):
    post = indexed(content['blog'], 'slug').get(slug) or abort(404)
    return render_template('blog-post.html', post=post)


@app.route('/404.html')
@app.errorhandler(404)
def not_found(err=None):
    """GitHub Pages not-found template."""
    code = 404 if err else 200  # frozen-flask doesn't like not-200 responses
    return render_template('404.html'), code
