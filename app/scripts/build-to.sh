#!/usr/bin/env bash
#
# build-to-production.sh
#
# Copyright: (c) 2014 Development Gateway / Feedback Labs
# License: BSD, see LICENSE


set -o nounset
set -o errexit
set -o pipefail

# set up some useful variables
#
# the script should work given:
# * remote name (add it yourself)
# * build name (probably staging or production)
REMOTE_NAME=$1
BUILD_NAME=$2

TMP_REPO_DIR="local-${BUILD_NAME}"
REPO_LOCAL_REMOTE="local${BUILD_NAME}"
REPO_BRANCH="gh-pages-${BUILD_NAME}"


# helper functions
GO_COLOUR=$(echo -e '\e[1;32m')
OUTPUT_COLOUR=$(echo -e '\e[0;35m')
CREATE_COLOUR=$(echo -e '\e[0;32m')
MOD_COLOUR=$(echo -e '\e[0;33m')
DEL_COLOUR=$(echo -e '\e[0;31m')
BAD_COLOUR=$(echo -e '\e[0;31m')
END_COLOUR=$(echo -e '\e[m')
step() {
  echo -e $@ | sed "s/^/${GO_COLOUR}-->${END_COLOUR} /"
}
mute() {
  while read _; do true; done
}
rmmute() {
  sed "/^rm / d" | indent
}
indent() {
  sed "s/\s*\(.*\)/      ${OUTPUT_COLOUR}\1${END_COLOUR}/"
}
modindent() {
  sed -e "s/\(create\)\(.*\)/     ${CREATE_COLOUR}\1${OUTPUT_COLOUR}\2${END_COLOUR}/"\
      -e "s/\(rewrite\)\(.*\)/     ${MOD_COLOUR}\1${OUTPUT_COLOUR}\2${END_COLOUR}/"\
      -e "s/\(rename\)\(.*\)/     ${MOD_COLOUR}\1${OUTPUT_COLOUR}\2${END_COLOUR}/"\
      -e "s/\(delete\)\(.*\)/     ${DEL_COLOUR}\1${OUTPUT_COLOUR}\2${END_COLOUR}/"
}
err() {
  echo -e $@ | sed "s/\s*\(.*\)/${BAD_COLOUR}  ! \1${END_COLOUR}/"
  exit 1
}
getcode() {
  # return 0 and print the acutal code
  $@ && rc=$? || rc=$?  # be safe; don't errexit
  echo $rc
}
lines() {
  echo $($@ | sed 's/$/\\n/')
}


step "checking whether a site export is ready..."
# ensure that the site has been built
if [[ ! -d build ]]; then
  err "No compiled site found in build/\n"\
      "Make sure you build everything before running this script."
fi
if [[ ! -f build/CNAME ]]; then
  err "No CNAME found in build/\n"\
      "Make sure you build everything before running this script."
fi
# make sure we are starting from a clean master branch
currentbranch=$(git branch | grep -e '^* ' | sed 's/^* //')
if [[ $currentbranch != "master" ]]; then
  err "The build should be built from the master branch.\n"\
      "You are currently on branch: $currentbranch"
fi
cleancode=$(getcode git diff-index --quiet HEAD)
if [[ $cleancode -ne 0 ]]; then
  if [[ $cleancode -ne 1 ]]; then
    err "Unexpected git error when checking for unstaged changes, code: $cleancode"
  fi
  err "Unstaged changes in the working directory. Please commit or stash first.\n"\
  	  "$(lines git status)"
fi
untrackedcode=$(getcode git ls-files --other --error-unmatch . >/dev/null 2>&1)
if [[ $untrackedcode -ne 0 ]]; then
  if [[ $untrackedcode -ne 1 ]]; then
    err "Unexpected git error when checking for untracked files, code: $cleancode"
  fi
  echo -e "Warning: untracked files found in directory. You may want to commit them...\n"\
          "...continuing anyway."
fi

# get into gh-pages-whatev branch to start off
step "checking out and updating ${REMOTE_NAME}/gh-pages -> ${REPO_BRANCH}..."
git fetch $REMOTE_NAME -q | indent
if [[ ! $(git branch | grep "$REPO_BRANCH\$") ]]; then
  git checkout -b $REPO_BRANCH ${REMOTE_NAME}/gh-pages | indent
else
  git checkout $REPO_BRANCH | indent
fi
git pull $REMOTE_NAME gh-pages -q | mute

# try to set up a temporary local folder for a repo we can work in without risking screwing up our actual local repo
step "creating local working repo..."
if [[ ! -d $TMP_REPO_DIR ]]; then
  mkdir $TMP_REPO_DIR && cd $TMP_REPO_DIR
  git clone -o "local" .. . | indent
else
  cd $TMP_REPO_DIR
fi
git fetch | indent

step "cleaning the branch for the new build..."
git rm -r * | rmmute  # note -- this will not clean .hidden files./
step "copying in the new site..."
cp -r ../build/* .  # again, this will miss .hidden files.

step "committing the new version..."
git add --all . | indent
git commit -m "auto-commit $BUILD_NAME" | modindent  # todo -- parse last commit message from the master branch

# add the tmp local to the real local
cd ..
if [[ ! "$(git remote | grep -e '^'${REPO_LOCAL_REMOTE}'$')" ]]; then
  git remote add $REPO_LOCAL_REMOTE $TMP_REPO_DIR
fi
step "pulling changes from temporary repo to your git repo..."
git pull -q $REPO_LOCAL_REMOTE $REPO_BRANCH | mute

step "cleaning temporary repo..."
rm -fr $TMP_REPO_DIR
git remote rm $REPO_LOCAL_REMOTE

echo
step "Ready to push."
echo -e "You might want to test it one last time (python2 -m SimpleHTTPServer).\n"\
        "When ready, simply \`git push $REMOTE_NAME ${REPO_BRANCH}:gh-pages\`.\n"\
        "You are currently on the $REPO_BRANCH branch.\n"\
        "\$ \`git checkout master\` will bring you back to the source files." | indent
