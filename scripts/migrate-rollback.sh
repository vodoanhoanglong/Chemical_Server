#!/bin/bash

set -eo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
ENV_FILE=".env"

# export all the env vars
export $(cat $ENV_FILE | grep -v '#' | awk '/=/ {print $1}')

DATA_HOST="${SCHEME}://${DATA_DOMAIN}"
FILE_PATH=$(ls ./services/data/migrations/thchemical | sort -n | tail -n 1)
VERSION=$(echo $FILE_PATH | cut -d'_' -f1)
echo "Rolling back to version $VERSION"

hasura migrate apply --version $VERSION --type down --skip-update-check --insecure-skip-tls-verify --database-name thchemical --endpoint $DATA_HOST --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET --project ./services/data
