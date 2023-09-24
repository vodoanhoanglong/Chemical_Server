#!/bin/bash

set -eo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
ENV_FILE=".env"

# export all the env vars
export $(cat $ENV_FILE | grep -v '#' | awk '/=/ {print $1}')

DATA_HOST="${SCHEME}://${DATA_DOMAIN}"

hasura seed apply --insecure-skip-tls-verify --database-name thchemical --endpoint $DATA_HOST --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET --project ./services/data
hasura seed apply --insecure-skip-tls-verify --database-name geo --endpoint $DATA_HOST --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET --project ./services/data