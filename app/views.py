# -*- coding: utf-8 -*-
"""
    app.views
    ~~~~~~~~~

    The endpoints and stuff

"""

import re
from flask import Flask, render_template, json, Response, abort
from .content import content


app = Flask(__name__, static_folder='../static')


@app.context_processor
def inject_content():
    """Inject content for templates"""
    return {'content': content}


@app.template_filter('humandata')
def humanize_data(data):
    """Make data a little nicer"""
    recomma = r'\s?,\s?', ', '
    respace = r'_', ' '
    humanized = str(data)
    humanized = re.sub(*recomma, string=humanized)
    humanized = re.sub(*respace, string=humanized)
    return humanized


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


@app.route('/data/')
def data_overview():
    return render_template('data.html')


@app.route('/schools.geojson')
def schools_geojson():
    geojson = {
        'type': 'FeatureCollection',
        'features': content['schools'],
    }
    return Response(json.dumps(geojson), mimetype='application/octet-stream')


@app.route('/schools/<path:slug>/')
def school(slug):
    this_school = indexed(content['schools'], 'slug').get(slug) or abort(404)
    has_kod = any(v.startswith('kenyaopendata:') for v in
                  this_school['properties'].keys())
    return render_template('school-profile.html',
                           school=this_school, has_kod=has_kod)


def school_url_generator():
    """Generate all the urls for schools for freezing"""
    for school in content['schools']:
        yield 'school', {'slug': school['slug']}


@app.route('/robots.txt')
def robots():
    """Allow everything"""
    return Response('User-agent: *\nDisallow:', mimetype='text/plain')


@app.route('/404.html')
@app.errorhandler(404)
def not_found(err=None):
    """GitHub Pages not-found template."""
    code = 404 if err else 200  # frozen-flask doesn't like not-200 responses
    return render_template('404.html'), code
