Open Schools Kenya
==================

The source files and compiled static site for Feedback Labs' [Open Schools Kenya](http://schools.mapkibera.org/) are hosted on github under two repositories:

 * [Map Kibera production/content repo](https://github.com/mapkibera/map-kibera-schools)
 * [Development Gateway app staging repo](https://github.com/devgateway/map-kibera-schools)

Each has an orphaned `gh-pages` branch for hosting production and staging, respectively. Updates to the data and content may be performed entirely on the Map Kibera repository, while application updates by Development Gateway will be first staged on that repository. Several shell scripts are included to help manage this setup. Synchronizing the two repositories is the responsibility of devs at DG.


Overview
--------

Open Schools Kenya consists of a python static site generating framework built partly on [Flask](http://flask.pocoo.org/), with a custom second-stage templating step for static assets and deploy-specific details like the `CNAME` file.


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

And then you are set to go!


Building the static site
------------------------

Site builds are broken into two steps -- one for HTML, and one for the static assets, like javascript, css, and images. There is a script called [`manage.py`](manage.py) in the root of the project intended to streamline these steps. However, some tasks are not wrapped in that script yet and require other commands to be run.


### Build HTML

```bash
$ ./manage.py build html
```

This should create a folder called `build`, containing all of the rendered HTML files.

Links to css and javascript files are re-injected into these rendered files, so you don't need to re-build the HTML every time (unless content or markup has changed).


### Build Static Stufff

```bash
$ ./manage.py build static <type> [<target>]
```
where `type` is one of `all`, `css`, `js`, `img`, `tiles`, or `root`.

`root` (and consequently `all`) takes an extra parameter -- `target`. It should be one of `staging` or `production`.

So to build all of the static assets for **staging**, simply run

```bash
$ ./manage.py build static all staging
```

You can substitude `production` for `staging` to build for production.


### Previewing the build

Currently this functionality is not wrapped by the `manage.py` script, but it's a one-liner with python's built-in HTTP server:

```bash
$ cd build/
$ python2 -m SimpleHTTPServer
```

You should now be able to preview the site in a web browser by loading `http://localhost:8000`.


Committing and Deploying
------------------------

There is a helper script, [`build-to.sh`](app/scripts/build-to.sh) in `app/scripts/` to aid with this step. Since we have two remote repositories (one the devgateway staging and the mapkibera production repos), this script helps take care of the branching and other git stuff required to manage that.

Note that `build-to.sh` will be wrapped by `manage.py` soon, but it may be run manually.

These steps assume that you have cloned the [mapkibera production repository](https://github.com/mapkibera/map-kibera-schools), which by default will cause it to be named "origin" locally. You can use

```bash
$ git remote -v
````
to check.


 1. Commit any changes to the `master` branch, and check out the master branch. `build-to.sh` will refuse to commit the site if any changes are not committed or if you are trying to commit a build from a branch other than `master`.

 2. Build the site (follow the steps from the previous section). It is _required_ that you build `root` and provide the correct target ("staging" or "production") when building `static`. This sets up the `CNAME` and `robots.txt` files. `build-to` will refuse to commit if the `CNAME` file is missing, however it cannot tell if it is the right wrong `CNAME` file, so take care.

 3. Commit the sitewith `build-to.sh`:
    ```bash
    $ ./app/scripts/build-to.sh origin production
    ```
    You should see a bunch of activity while the script does its job. At the end it will instruct you on the exact command you need to use to deploy your commit to the live site.

 4. Deploy! The exact `push` command should be listed in the output of `build-to`. In most cases if you originally cloned the code from the mapkibera repository, it should be
    ```bash
    $ git push origin gh-pages-production:production
    ```

### Staging

The [devgateway staging repository](https://github.com/devgateway/map-kibera-schools) has its own `gh-pages` branch, intended for hosting the latest changes to the _application_ before it is pushed to production. Updates to the data and content are expected to be pushed directly to production (after being tested locally of course!).

It is recommended that you still clone initially from the [mapkibera production repository](https://github.com/mapkibera/map-kibera-schools). After that, add the devgateway repository as another remote:

```bash
$ git remote add staging git@github.com:devgateway/map-kibera-schools.git
```

Deploying staging is similar to deploying production. The differences are noted:

 * Build the site (make sure to target `staging` and not `production`)

 * `build-to.sh`'s two parameters are the name of the remote (called "staging" in this example to match the name assigned to it when running `git remote add...` above), and another name to distinguish its purpose (you should use `staging` or `production` unless you are doing something tricky).

 So the command for building staging is probably:

 ```bash
 $ ./app/scripts/build-to.sh staging staging
 ```


Rolling Back
------------

To re-deploy a previous version of the production site (the example will be similar for staging):

Find out which branch to use with

```bash
$ git branch --all -vv
```

If you followed the Deploying steps previously, you should have a branch called `gh-pages-production`. Check it out with

```bash
$ git checkout gh-pages-production
```

Roll back to the commit before with

```bash
$ git reset --hard HEAD~1
```

and then force-push to update the live site

```bash
$ git push origin gh-pages-production:gh-pages --force
```

The previous version should now be live.

