#!/bin/bash

set -ev
# Environment variables.
# NODE_ENV=${NODE_ENV:-development}
# COUCHBASE=$1
# COUCHBASE_USER=${COUCHBASE_USER:-Administrator}
# COUCHBASE_PASS=${COUCHBASE_PASS:-password}

pushd `dirname $0`
docker-compose up -d --build

STATUS=""
until [[ ${STATUS} = "healthy" ]]; do
    STATUS=`docker inspect --format='{{.State.Health.Status}}' couchbase`
    echo "status: ${STATUS}"
    sleep 5
done

# Initialize couchbase cluster, bucket
exec ./init-cb.sh

popd
