#!/usr/bin/env bash
#
# stage.sh
#
# Put generated content on the gh-pages branch for staging or production.
#
# This script will be run by the `manage.py` script at the project root.
# Please do not run it manually.
#
# Copyright: 2014 Development Gateway / Feedback Labs
# License: BSD, see LICENSE
#

set -u
set -e

TARGET=$1;  # should be one of staging or production

# clean up anything from before
if [[ -d $TARGET ]]; then
  rm -fr $TARGET
fi

# get into position...
mkdir $TARGET && cd $TARGET

# copy the git repo here so we can do git stuff without worrying
git clone .. $TARGET

# make sure we have everything
git fetch --all

# 

