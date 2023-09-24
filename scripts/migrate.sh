#!/bin/bash

set -eo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
ENV_FILE=".env"

# export all the env vars
export $(cat $ENV_FILE | grep -v '#' | awk '/=/ {print $1}')

DATA_HOST="${SCHEME}://${DATA_DOMAIN}"

hasura migrate apply --skip-update-check --insecure-skip-tls-verify --all-databases --endpoint $DATA_HOST --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET --project ./services/data

hasura metadata apply --skip-update-check --insecure-skip-tls-verify --endpoint $DATA_HOST --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET --project ./services/data
hasura metadata reload --skip-update-check --insecure-skip-tls-verify --endpoint $DATA_HOST --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET --project ./services/data