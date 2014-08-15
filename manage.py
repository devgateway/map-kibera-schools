#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
    manage
    ~~~~~~

    Open Schools Kenya management script

    Usage:
        build everything:       ./manage.py build all
        build templates:        ./manage.py build html
        build statics:          ./manage.py build static [type] [--no-filters]
                                    where type is one of css or js
        build map tile images:  ./manage.py build tiles
        clean up                ./manage.py clean
        build for a target:     ./manage.py build2 target
                                    where target is one of staging or production

       run a local preview:   ./manage.py preview

    :licence: BSD, see LICENSE
"""

from __future__ import print_function  # python2 compat

if 'FileNotFoundError' not in dir(__builtins__):
    # python2
    FileNotFoundError = OSError

import os
import shutil
import json


def get_config(_cached={}):
    if 'config' not in _cached:
        try:
            with open('config.json') as conf_file:
                try:
                    config = json.load(conf_file)
                except ValueError as e:
                    err_msg = e.args[0]
                    raise SystemExit('Error (config.json): {}'.format(err_msg))
        except FileNotFoundError:
            raise SystemExit('Error: config file (config.json) not found.')
        _cached['config'] = config
    return _cached['config']


def command(func, _func_cache={}):
    """Decorate functions to register them as commands."""

    # register the command
    func_name = func.__name__.lower()
    if func_name in _func_cache:
        raise Exception('Duplicate definition of command {}'.format(func_name))
    _func_cache[func_name] = func

    return func  # leave the functions so they are still importable and stuff


@command
def help():
    """Get usage information about this script"""
    print('\nUsage: {} [command]'.format(sys.argv[0]), end='\n\n')
    print('Available commands:')
    for name, func in command.__defaults__[0].items():  # from _func_cache
        print(' * {:16s} {}'.format(name, func.__doc__ or ''))
    raise SystemExit()


def build_html():
    from flask_frozen import Freezer
    from app import views
    views.app.config['FREEZER_DESTINATION'] = '../build'
    views.app.config['FREEZER_REMOVE_EXTRA_FILES'] = False
    views.app.testing = True
    freezer = Freezer(views.app, with_static_files=False)
    freezer.register_generator(views.school_url_generator)
    freezer.register_generator(views.blog_url_generator)
    freezer.freeze()


def get_file_contents(dir, filenames):
    """Iterateable file contents by file"""
    for filename in filenames:
        file_path = os.path.join(dir, filename)
        with open(file_path) as file_obj:
            contents = file_obj.read()
            yield contents


def apply_filters(filters, sources):
    from app import static
    filters = [getattr(static, f) for f in filters]
    for filter_func in filters:
        sources = filter_func(sources)
    return sources


def save_sources(type_name, prefix, sources):
    from hashlib import sha1
    full_prefix = os.path.join('build', prefix)
    try:
        shutil.rmtree(full_prefix)
    except FileNotFoundError:
        pass
    os.makedirs(full_prefix)
    filenames = []
    for source in sources:
        try:
            hashed = sha1(bytes(source, 'utf-8')).hexdigest()
        except TypeError:
            hashed = sha1(source).hexdigest()  # python2
        filename = '{}.{}'.format(hashed, type_name)
        file_path = os.path.join(prefix, filename)
        file_full_path = os.path.join('build', file_path)
        with open(file_full_path, 'w') as file_obj:
            file_obj.write(source)
        filenames.append(file_path)
    return filenames


def get_templates(base):
    """iterate through all template files"""
    for root, dirs, files in os.walk(base):
        for filename in files:
            file_path = os.path.join(root, filename)
            if os.path.splitext(filename)[1] == '.html':
                with open(file_path) as file_obj:
                    original_contents = file_obj.read()
                with open(file_path, 'w') as file_obj:
                    yield original_contents, file_obj


def template_inject(root, name, filenames=None):
    import re
    tag_marker = (r'<!-- tag\s+{name}\n'
                  r'\s*template=(?P<template>.*?\n)'
                  r'(\s*path=(?P<path>.*?)\n)?'
                  r'\s*-->\n?'.format(name=name))
    tag_end = r'<!--\s+endtag\s+{name}\s+-->'.format(name=name)
    tag_pattern = re.compile(tag_marker)
    end_pattern = re.compile(tag_end)
    for original_contents, file_obj in get_templates('build'):
        tag_marker = re.search(tag_pattern, original_contents)
        end_marker = re.search(end_pattern, original_contents)
        if tag_marker is not None and end_marker is not None:
            tag_info = tag_marker.groupdict()
            tag_template = tag_info['template']
            tags = ''
            if filenames is None and tag_info['path'] is not None:
                tags += tag_template.format(path=root + tag_info['path'])
            else:
                assert filenames is not None, 'lalala'
                for filename in filenames:
                    tags += tag_template.format(path=root + filename)
            new_stuff = '{}{}{}'.format(original_contents[:tag_marker.end()],
                                tags, original_contents[end_marker.start():])
            file_obj.write(new_stuff)


def build_static_thing(type_name, conf):
    print('building static: {}...'.format(type_name))
    thing_conf = conf[type_name]
    sources = get_file_contents(thing_conf['prefix'], thing_conf['files'])
    sources = apply_filters(thing_conf['filters'], sources)
    filenames = save_sources(type_name, thing_conf['prefix'], sources)
    template_inject('/', type_name, filenames)


def copy_static(foldername):
    print('copying static: {}'.format(foldername))
    src = os.path.join('static', foldername)
    dest = os.path.join('build', 'static', foldername)
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


def copy_rootstuff(conf):
    print('copying root stuff')
    cnamename = os.path.join('build', 'CNAME')
    with open(cnamename, 'w') as cnamefile:
        cnamefile.write(conf['cname'])
    robotsname = os.path.join('build', 'robots.txt')
    shutil.copyfile(conf['robots'], robotsname)


def build_static(what, for_):
    conf = get_config()['static']
    if what in ('all', 'css'):
        build_static_thing('css', conf)
    if what in ('all', 'js'):
        build_static_thing('js', conf)
    if what in ('all', 'img'):
        copy_static('img')
    if what in ('all', 'fonts'):
        copy_static('fonts')
    if what in ('all', 'tiles'):
        copy_static('tiles')
    if what in ('all', 'root'):
        if for_ is None:
            print('Skipping root files, no build target set')
            return
        build_conf = get_config()['build']
        assert for_ in build_conf, 'Invalid build target: {}'.format(for_)
        copy_rootstuff(build_conf[for_])


def build_images():
    src = os.path.join('content/images')
    dest = os.path.join('build', 'data/images')
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)

@command
def build(what, *args):
    # ensure the build folder exists
    if 'build' not in os.listdir('.'):
        os.makedirs('build')

    if what not in ('html', 'static'):
        raise SystemExit('no such build: {}'.format(what))

    if what in ('all', 'html'):
        build_html()
        build_images()

    if what in ('all', 'static'):
        static_args = list(args)
        for_ = None
        if len(static_args) == 0:
            static = 'all'
        else:
            static = static_args[0]
            if len(static_args) > 1:
                for_ = static_args[1]
            if static not in ('all', 'css', 'js', 'img', 'files', 'tiles', 'root'):
                raise SystemExit('unrecognized argument: {}'.format(static))
        build_static(static, for_)

    print('built {}.'.format(what))


@command
def clean():
    try:
        shutil.rmtree('build')
    except FileNotFoundError:  # python3 only, add ioerror, errno check for py2
        pass
    print('cleaned.')


if __name__ == '__main__':
    import sys
    # get the command or else help
    try:
        cmd, args = sys.argv[1].lower(), sys.argv[2:]
    except IndexError:
        cmd, args = 'help', []

    # run the command
    funcs = command.__defaults__[0]  # from _func_cache
    if cmd in funcs:
        funcs[cmd](*args)
    else:
        print('Command "{}" not found :('.format(cmd))
        help()
