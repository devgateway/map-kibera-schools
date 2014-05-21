#!/usr/bin/env bash
#
# build-to-production.sh
#
# Copyright: (c) 2014 Development Gateway / Feedback Labs
# License: BSD, see LICENSE


set -o nounset
set -o errexit

# get into gh-pages to start off
echo "checking out gh-pages..."
git fetch -v
git checkout gh-pages
git pull

# try to set up a temporary local folder for a repo we can work in without risking screwing up our actual local repo
echo "creating local working repo..."
mkdir local-production-repo
cd local-production-repo
git clone .. .
git fetch -v

# go the the gh-pages branch and clean up
git rm -r *

# copy in the newly-built site
cp -r ../build/* .

# commit!
git add --all .
git commit -m "auto-commit production branch"

# add the tmp local to the real local
cd ..
git remote add localproduction local-production-repo
git pull localproduction gh-pages


echo "Ready to push."
echo "You might want to test it one last time (python2 -m SimpleHTTPServer)."
echo "When ready, simply \`git push origin gh-pages\`."
echo "You are currently on the gh-pages branch."
echo "\`git checkout master\` will bring you back to the source files."
