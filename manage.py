#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
    manage
    ~~~~~~

    Command-line utilities for the Kibera School Project static site.

    :author: Philip Schleihauf
    :copyright: © 2014 by Feedback Labs
    :license: BSD, see LICENSE for more details.
"""

from flask.ext.script import Manager
from flask_frozen import Freezer
from flask import render_template
from app import app

manager = Manager(app)
freezer = Freezer(app) #, with_static_files=False)  # manually do static assets


@manager.command
def build_static():
    """Export the static assets to 'output'."""


@manager.command
def build():
    """Export the static site to 'output'."""
    app.config.update(FREEZING=True)  # que for static stuff to build
    freezer.freeze()
    build_static()


@manager.command
def preview():
    """Run a local dev server to check out the exported static site."""
    build()
    freezer.serve()


@manager.command
def commit(confirm=True):
    """Build the site and commit it to the gh-pages branch."""
    # build
    # branch ? pass : create
    # checkout
    # apply new version
    # anything changed ? continue : abort
    # confirm ? prompt with change summary : pass
    # commit changes
    # go back to original branch
    print('hello')


if __name__ == '__main__':
    manager.run()
