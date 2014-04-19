# -*- coding: utf-8 -*-
"""
    app.static
    ~~~~~~~~~~

    Manage the static assets for the Kibera School Project.

    This module injects the right css and javascript for templates.

    :author: Philip Schleihauf
    :copyright: © 2014 by Feedback Labs
    :license: 
"""

import os
import urllib
import requests
from hashlib import sha1
from cssmin import cssmin
from flask import Markup
from . import app


ASSETS = {
    'css': {
        'tag_template': '<link rel="stylesheet" href="/static/{}" />',
        'sources': [
            # static/ is implied at the beginning
            'css/normalize.css',
            'css/base.css',
            'css/helpers.css',
            'css/layout.css',
            'css/style.css',
        ],
        'build_filters': [
            'concatenate',
            # cssmin,
        ],
    },
    'js': {
        'tag_template': '<script src="/static/{}"></script>',
        'sources': [
            'js/plugins/log-safety.js',
            'js/main.js',
        ],
        'build_filters': [
            'concatenate',
        ],
    },
}


def link(media_type, config):
    paths = config['sources']
    if not app.config.get('FREEZING') is True:
        if config.get('built_paths') is None:
            for build_filter in config['build_filters']:
                pass  # apply filters here
            config['built_paths'] = paths
        else:
            # we have already compiled them, get the cached version
            paths = config['built_paths']

    tag_template = config['tag_template']
    links = map(tag_template.format, paths)
    html = Markup('\n'.join(links))
    return html


@app.context_processor
def inject_static():
    return {media: lambda m=media: link(m, ASSETS[m]) for media in ASSETS}
