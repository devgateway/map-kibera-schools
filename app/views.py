# -*- coding: utf-8 -*-
"""
    app.views
    ~~~~~~~~~

    The endpoints and stuff

    :author: Philip Schleihauf
    :copyright: © 2014 by Feedback Labs
    :license: 
"""

from flask import render_template, Markup, abort
from . import app
from .content import content


@app.context_processor
def inject_static():
    """Inject content for templates"""
    return {'content': content}


@app.route('/')
def home():
    # get all the pieces
    return render_template('home.html')


@app.route('/schools')
def list_schools():
    return str(content['schools'])


@app.route('/schools/<school_slug>')
def school(school_slug):
    this_school = content['schools'].get(school_slug) or abort(404)
    return render_template('school-profile.html', school=this_school)


@app.route('/blog/<slug>')
def blog(slug):
    post = None
    for some_post in content['blog']:
        if some_post['slug'] == slug:
            post = some_post
            break
    if post is None:
        abort(404)
    return render_template('blog-post.html', post=post)


@app.route('/404.html')
@app.errorhandler(404)
def not_found(err=None):
    """GitHub Pages not-found template."""
    code = 404 if err else 200  # frozen-flask doesn't like not-200 responses
    return render_template('404.html'), code
