Kibera School Project
=====================

The source files and compiled static site for Feedback Labs' [Map Kibera Schools](http://schools.mapkibera.org/) are hosted on github under two repositories:

 * [Map Kibera production/content repo](https://github.com/mapkibera/map-kibera-schools)
 * [Development Gateway app staging repo](https://github.com/devgateway/map-kibera-schools)

Each has an orphaned `gh-pages` branch for hosting production and staging, respectively. Updates to the data and content may be performed entirely on the Map Kibera repository, while application updates by Development Gateway will be first staged on that repository. Several shell scripts are included to help manage this setup. Synchronizing the two repositories is the responsibility of devs at DG.


Overview
--------

Map Kibera Schools consists of a python static site generating framework built partly on [Flask](http://flask.pocoo.org/), with a custom second-stage templating step for static assets and deploy-specific details like the `CNAME` file.


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


### For content and data updates (targeted at Ground Truth maintainers)

 1. Update the content
 2. Build the new site
 	 * currently requires `build html`; `build static css`; `build static js`; ...
 3. Test locally
 4. Commit the changes to the source files on the `master` branch
 5. Use the production deploy script to commit the updated site to the `gh-pages` branch.
 6. Push `gh-pages` to make it live.


### For application development (targeted at DG developers)

Set up a second remote for the DG staging repository:

```
$ git remote add staging git@github.com:devgateway/map-kibera-schools.git
```

Pull the staging gh-pages branch to a local branch called gh-pages-staging


