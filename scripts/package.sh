#!/bin/bash
set -e

echo "Install package ..."

ROOT=`pwd`;

# setup hook gits
npm ci

cd $ROOT/services/shared
rm -rf node_modules
npm ci
npm run build

install(){
  echo "==============project $1================="
  cd $ROOT/services/$1
  rm -rf node_modules
  npm ci
}

install events
install background
