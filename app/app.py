# -*- coding: utf-8 -*-
"""
    app
    ~~~

    Static site generator for the Kibera School Project by Feedback Labs

    :author: Philip Schleihauf
    :copyright: © 2014 by Feedback Labs
    :license: BSD, see LICENSE for more details.
"""

import os
import md5
import urllib
import requests
from cssmin import cssmin
from flask import Flask, render_template, Markup

app = Flask(__name__, static_url_path='/static')
app.config['BUILD_OUTPUT'] = 'output'
app.config['FREEZER_DESTINATION'] = app.config['BUILD_OUTPUT']


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/schools/<school_id>')
def school(school_id):
    # get data about this school or 404
    # build the templating context
    return render_template('school-profile.html')


@app.route('/blog/<slug>')
def blog(slug):
    # open file or abort 404
    # run it through markdown
    # build the templating context
    return render_template('blog-post.html')


@app.route('/404.html')
@app.errorhandler(404)
def not_found(err=None):
    """GitHub Pages not-found template."""
    return render_template('404.html'), 404 if err else 200


def closure_compile(source):
    closure_api_url = 'http://closure-compiler.appspot.com/compile'
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    data = urllib.urlencode([
        ('js_code', source),
        ('compilation_level', 'ADVANCED_OPTIMIZATIONS'),
        ('output_info', 'compiled_code'),
        ('output_format', 'json'),
    ])
    result = requests.post(closure_api_url, data=data, headers=headers)
    assert result.ok, 'compiling javascript with closure failed'
    stuff = result.json()
    return stuff['compiledCode']


@app.context_processor
def inject_static(_cache={}):
    tag_templates = {
        'css': '<link rel="stylesheet" href="/static/{}" />',
        'js': '<script src="/static/{}"></script>',
    }
    production_filters = {
        'css': cssmin,
        'js': closure_compile,
    }

    def concatenated(file_paths):
        source = ''
        for path in file_paths:
            with open(os.path.join(app.root_path, 'static', path)) as f:
                source += f.read()
        return source

    def save_compiled(source_hash, source, media_type):
        filepath = '{}/static/{}.{}'.format(app.config['BUILD_OUTPUT'], contents_hash, media_type)
        with open(filepath, 'w') as f:
            f.write(source_hash)
        return filepath[len('static/'):]

    def cache_compile(media_type, file_paths):
        cache_key = frozenset([media_type] + file_paths)
        if cache_key not in _cache:
            source_hash, source = concatenated(file_paths)
            contents = production_filters[media_type](source)
            out_path = save_compiled(contents, media_type)
            _cache[cache_key] = out_path
        return _cache[cache_key]

    def static(media_type, file_paths):
        if app.debug:
            tags = '\n'.join(map(tag_templates[media_type].format, file_paths))
        else:
            out_path = cache_compile(media_type, file_paths)
            tags = tag_templates[media_type].format(out_path)
        return Markup(tags)

    return dict(static=static)
