#!/usr/bin/env bash

#
# Map Kibera Schools configuration
#
# Though implemented as a bash script, this file will be sourced by other
# scripts to specify their behavior, it is not directly useful on its own.
#
# Some configuration is specific to your local environment, and must be
# exported as environment variables instead of tracked in this file.
#
# See readme.md for full usage information.
#
# BSD Licensed, see LICENCE
#


####  Static Sources  ####

# Filtering requires an internet connection to use the closure compiler API --
# https://developers.google.com/closure/compiler/
export JS_PREFIX='static/js/'
export JS_FILES='plugins/log-safety.js,leaflet.js,main.js'
export JS_FILTERS='concat,closure'

# Filtering requires the cssmin python package --
# https://github.com/zacharyvoase/cssmin
export CSS_PREFIX='static/css/'
export CSS_FILES='leaflet.css,normalize.css,helpers.css,base.css,layout.css,style.css,print.css'
export CSS_FILTERS='concat,cssmin'

export THEME_IMG_PREFIX='static/img/'
export THEME_IMG_FILES='*'
export THEME_IMG_FILTERS=

export BLOG_IMG_PREFIX='content/images/'
export BLOG_IMG_FILES='*'
export BLOG_IMG_FILTERS=


####  Servers and Deployment  ####

# the path must match the production repository name if it does not have a
# specific domain CNAMEed to it
export PATH='/'

export STAGING_CNAME='kibera-schools.dgstg.org'
export STAGING_ROBOTS='root-static/robots-goaway.txt'

export PRODUCTION_CNAME='mapkibera.github.io'
export PRODUCTION_ROBOTS='root-static/robots-welcome.txt'
