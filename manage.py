#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
    manage
    ~~~~~~

    Command-line utilities for the Kibera School Project static site.

"""

import os
import errno
import shutil
from flask.ext.script import Manager
from flask_frozen import Freezer
from flask import render_template
from app import app
from app import views


manager = Manager(app)
freezer = Freezer(app, with_static_files=False)  # manually do static assets


def copy_static():
    ignore_folders = {'css', 'js'}  # unfiltered sources
    src_folder = os.path.join(app.root_path, 'static')
    dest_folder = os.path.join(app.root_path, app.config['BUILD_OUTPUT'])
    stuff = set(os.listdir(src_folder))
    for thing in stuff - ignore_folders:
        src_path = os.path.join(src_folder, thing)
        dest_path = os.path.join(dest_folder, thing)
        try:
            shutil.copytree(src_path, dest_path)
        except OSError as e:
            if e.errno == errno.ENOTDIR:
                shutil.copy2(src_path, dest_path)
            else:
                raise


@manager.command
def build():
    """Export the static site to 'output'."""
    app.config.update(FREEZING=True)  # cue for static stuff to build
    app.testing = True
    freezer.register_generator(views.school_url_generator)
    freezer.freeze()
    copy_static()


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
