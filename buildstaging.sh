#!/bin/bash

# fail fast
set e

python manage.py build

git stash
git checkout staging

ls -a | egrep -v '(\.\.?|output|\.git)' | xargs rm -r
mv output/* .
rm -r output

git add --all .
git commit -m "auto-commit"
git checkout master

