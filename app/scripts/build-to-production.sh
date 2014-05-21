#!/usr/bin/env bash
#
# build-to-production.sh
#
# Copyright: (c) 2014 Development Gateway / Feedback Labs
# License: BSD, see LICENSE


set -o nounset
set -o errexit

# try to set up a temporary local folder for a repo we can work in without risking screwing up our actual local repo
mkdir local-production-repo || true  # it might already exist
cd local-production-repo
git clone .. .
git fetch --all

# go the the gh-pages branch and clean up
git checkout gh-pages
git rm -r *

# copy in the newly-built site
cp ../build/* .

# commit!
git add .
git commit -m "auto-commit production branch"

# add the tmp local to the real local
cd ..
git remote add localproduction local-production-repo
git fetch -v local-production-repo

# checkout the stuff
git checkout gh-pages


echo "Ready to push."
echo "You might want to test it one last time (python2 -m SimpleHTTPServer)."
echo "When ready, simply `git push origin gh-pages`."
echo "You are currently on the gh-pages branch."
echo "`git checkout master` will bring you back to the source files."
