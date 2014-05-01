#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
    manage
    ~~~~~~

    Map Kibera Schools management script

    Usage:
       build everything:      ./manage.py build
                              ./manage.py build all
       build templates:       ./manage.py build html
       build statics:         ./manage.py build static [type] [--no-filters]
                                  where type is one of css or js
       build map tile images: ./manage.py build tiles
       build for a target:    ./manage.py build2 target
                                  where target is one of staging or production

       run a local preview:   ./manage.py preview

    :licence: BSD, see LICENSE
"""

from __future__ import print_function
import sys


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


@command
def build(what='all'):
    # 1. ensure the build folder exists
    # figure out what target we want
    #
    print('hello world')


@command
def build2(target):
    print('buildit yo')

if __name__ == '__main__':
    # get the command or else help
    if len(sys.argv) < 2:
        cmd, args = 'help', []
    else:
        cmd, args = sys.argv[1].lower(), sys.argv[2:]

    # run the command
    funcs = command.__defaults__[0]  # from _func_cache
    try:
        funcs[cmd](*args)
    except KeyError:
        print('Command "{}" not found :('.format(cmd))
        help()
