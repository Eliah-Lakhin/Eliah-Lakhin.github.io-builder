#!/bin/bash
#

git submodule init
git submodule update
npm install
cd www
git checkout master
cd ../source
git checkout master
cd ..
grunt compile

