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

@app.route('/about/')
def about():
    return render_template('about.html')

@app.route('/schools.json')
def schools_geojson():
    geojson = {
        'type': 'FeatureCollection',
        'features': content['schools'],
    }
    return Response(json.dumps(geojson), mimetype='application/json')

@app.route('/kibera.json')
def kibera_geojson():
    kibera = {
        'type': 'FeatureCollection',
        'features': [d for d in content['schools'] if d['properties']['osm:location'] in ['kibera']],
    }
    return Response(json.dumps(kibera), mimetype='application/json')

@app.route('/mathare.json')
def mathare_geojson():
    mathare = {
        'type': 'FeatureCollection',
        'features': [d for d in content['schools'] if d['properties']['osm:location'] in ['mathare']],
    }
    return Response(json.dumps(mathare), mimetype='application/json')

@app.route('/app/schools.json')
def schools_appjson():
    schools = [dict(locations=s['geometry']['coordinates'], slug=s['slug'],
                    **s['properties']) for s in  content['schools']]
    return Response(json.dumps(schools), mimetype='application/json')


# @app.route('/app/fields.json')
# def fields_json():
#     return Response(json.dumps(content['fields']), mimetype='application/json')


@app.route('/schools/<path:slug>/')
def school(slug):
    this_school = indexed(content['schools'], 'slug').get(slug) or abort(404)
    has_kod = any(v.startswith('kenyaopendata:') for v in
                  this_school['properties'].keys())
    this_school['locations'] = this_school['geometry']['coordinates']

    groups = ('Basics', 'Population', 'Infrastructure', 'Programs')
    grouped_properties = {field['group']: []
        for field in content['mapping']['fields']}

    for field in content['mapping']['fields']:
        if this_school['properties'].get(field['osm']) is None:
          osm_value = '-'
        else :
          osm_value = this_school['properties'].get(field['osm'])

        if field.get('value') is not None and field['value'].get(osm_value) is not None:
          osm_value = field['value'][osm_value]
        
        if this_school['properties'].get(field['kenyaopendata']) is not None:
          odk_value =  this_school['properties'].get(field['kenyaopendata'])
        elif field.get('kenyaopendata2') is not None and this_school['properties'].get(field['kenyaopendata2']) is not None:
          odk_value =  this_school['properties'].get(field['kenyaopendata2'])
        elif field.get('default') is not None:
          odk_value = field.get('default')
        else :
          odk_value = '-'

        grouped_properties[field['group']].append({
            'name': field['name'],
            'osm': osm_value,
            'kod': odk_value,
        })

    return render_template('school-profile.html', school=this_school,
        has_kod=has_kod, groups=groups, grouped_properties=grouped_properties)


def school_url_generator():
    """Generate all the urls for schools for freezing"""
    for school in content['schools']:
        yield 'school', {'slug': school['slug']}


@app.route('/blog/')
def blog():
    return render_template('blog.html')


@app.route('/blog/<path:slug>/')
def blog_post(slug):
    this_post = indexed(content['blog'], 'slug').get(slug) or abort(404)
    return render_template('blog-post.html', post=this_post)


def blog_url_generator():
    """Generate all the blog post urls for freezing"""
    for post in content['blog']:
        yield 'blog_post', {'slug': post['slug']}


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
