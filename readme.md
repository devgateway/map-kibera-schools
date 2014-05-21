Kibera School Project
=====================

The source files and compiled static site for Feedback Labs' [Map Kibera Schools](http://schools.mapkibera.org/) are hosted on github under two repositories:

 * [Map Kibera production/content repo](https://github.com/mapkibera/map-kibera-schools)
 * [Development Gateway app staging repo](https://github.com/devgateway/map-kibera-schools)

Each has an orphaned `gh-pages` branch for hosting production and staging, respectively. Updates to the data and content may be performed entirely on the Map Kibera repository, while application updates by Development Gateway will be first staged on that repository. Several shell scripts are included to help manage this setup. Synchronizing the two repositories is the responsibility of devs at DG.


Overview
--------

Map Kibera Schools consists of a python static site generating framework built partly on [Flask](http://flask.pocoo.org/), with a custom second-stage templating step for static assets and deploy-specific details.


### Why not just data and front-end JavaScript?

While updates to the content with a javascript-powered front-end could conceivably be as easy as merging a pull-request the main geojson file, that approach requires contendin with several issues:

 1. Accessibility: it is more difficult to make javascript apps robustly accessible, and users choosing to browse the web with no javascript at all would not be able to access any content.

 2. Search Visibility: Presenting indexble content to web crawlers for search engines is difficult without having script-less web pages available.

 3. Speed: While a javascript app can be very fast, especially for page transitions, simple flat html pages linked together will almost always be fast.


### Issue Tracking

Please report bugs, feature requests, etc. to the [Development Gateway repo's issue tracker](https://github.com/devgateway/map-kibera-schools/issues).


Local Installation
------------------

First, clone the repository:

```bash
$ git clone git@github.com:mapkibera/map-kibera-schools.git
```

 * A python runtime is required (either 2.7 or 3.3+). Most unix-based operating systems ship with a recent python.
 * Setuptools/pip are strongly recommended.
 * Setting up virtualenv is recommended.

The python dependencies are defined in [requirements.txt](requirements.txt). If you have pip installed, you can simply run:

```bash
$ pip install -r requirements.txt
```


### For application development

Set up a second remote for the DG staging repository:

```
$ git remote add staging git@github.com:devgateway/map-kibera-schools.git
```

Pull the staging gh-pages branch to a local branch called gh-pages-staging


Usage
-----

build html

build css

build js

test

build target

commit to gh-pages branch

push

