#!/bin/sh
set -e

# With object storage configured, restore the database if the volume is empty (e.g. a fresh
# volume) and keep streaming every change to the bucket while the server runs.
if [ -n "$BUCKET_NAME" ] && [ "$LITESTREAM_ENABLED" != "false" ]; then
  litestream restore -config /app/litestream.yml -if-db-not-exists -if-replica-exists "$DATA_DIR/shop.db"
  exec litestream replicate -config /app/litestream.yml -exec "bun server/index.js"
fi

exec bun server/index.js
