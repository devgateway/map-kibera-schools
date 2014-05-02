# -*- coding: utf-8 -*-
"""
    app.filters
    ~~~~~~~~~~~

    Filter functions for static files.
"""

import os
try:
    from urllib.parse import urlencode
    from http import client
except ImportError:  # python2
    from urllib import urlencode
    import httplib as client
from cssmin import cssmin as cssmin_func


JS_TAG = '<script src="{}"><script>'
CSS_TAG = '<link rel="stylesheet" href="{}" />'


def concat(sources):
    combined = '\n'.join(sources)
    return [combined]


def cssmin(sources):
    return map(cssmin_func, sources)


def closure(sources):
    closure_domain = 'closure-compiler.appspot.com'
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    raw_params = [
        ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
        ('output_format', 'text'),
        ('output_info', 'compiled_code'),
    ]
    filtered = []
    conn = client.HTTPConnection(closure_domain)
    for source in sources:
        print('sending {} bytes to closure api...'.format(len(source)))
        raw_params.append(('js_code', source))
        params = urlencode(raw_params)
        conn.request('POST', '/compile', params, headers)
        response = conn.getresponse()
        filtered_source_bytes = response.read()
        filtered_source = str(filtered_source_bytes, 'utf-8')
        filtered.append(filtered_source)
    conn.close()
    return filtered
