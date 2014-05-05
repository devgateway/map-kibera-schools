#!/usr/bin/env bash
#
# stage-setup.sh
#
# This script should set up your local filesystem with the right remotes for
# staging and production.
#
# Copyright: 2014 Development Gateway / Feedback Labs
# License: BSD, see LICENSE
#

set -o nounset
set -o errexit

TARGET=$1
REMOTE=$2

# add a remote by the name of the target or fail hard
git remote add $TARGET $REMOTE


# create a staging branch locally that points to gh pages on the remote

# first learn everything
git fetch --all
# now see if there is a remote gh-pages branch yet
TRACKING=$(git branch --all | grep ${TARGET}/gh-pages) || true

# if there is not a remote gh-pages, create it
if [[ ! $TARGET ]]; then
  mkdir setup-${TARGET} && cd setup-${TARGET}
  git init
  git checkout -b gh-pages
  echo "hello" > index.html
  git add index.html
  git commit -m "first commit to new gh-pages branch on $TARGET"
  git remote add $TARGET $REMOTE
  git push $TARGET gh-pages:gh-pages
fi

# create the branch  
git branch --orphan $TARGET ${TRACKING}

git checkout $TARGET


