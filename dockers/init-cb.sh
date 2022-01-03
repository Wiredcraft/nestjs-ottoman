#!/bin/bash
set -ev

# Environment variables.
NODE_ENV=${NODE_ENV:-development}
COUCHBASE_USER=${COUCHBASE_USER:-Administrator}
COUCHBASE_PASS=${COUCHBASE_PASS:-password}

docker-compose run --rm --entrypoint=/opt/couchbase/bin/couchbase-cli couchbase \
               cluster-init -c couchbase:8091 \
               --cluster-username=$COUCHBASE_USER --cluster-password=$COUCHBASE_PASS \
               --cluster-ramsize=512 --cluster-index-ramsize=256 --cluster-fts-ramsize=256 \
               --services=data,index,query,fts

docker-compose run --rm --entrypoint=/opt/couchbase/bin/couchbase-cli couchbase \
               bucket-create -c couchbase:8091 -u $COUCHBASE_USER -p $COUCHBASE_PASS \
               --bucket=test_bucket --bucket-type=couchbase \
               --bucket-ramsize=128 --bucket-replica=0 --enable-flush=1 --wait
