#!/bin/sh
set -eu

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running Prisma migrations…"
  npx prisma migrate deploy
fi

exec node server.js
