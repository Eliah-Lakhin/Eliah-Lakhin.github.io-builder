#!/bin/bash
#

git submodule init
git submodule update

# papa-carlo js/demo
cd external/papa-carlo
sbt js-demo/optimizeJS
cd -

npm install
cd www
git checkout master
cd ../source
git checkout master
cd ..
grunt compile

