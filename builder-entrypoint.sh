#!/bin/bash

cd apps/builder
node -e "const { configureRuntimeEnv } = require('next-runtime-env/build/configure'); configureRuntimeEnv();"
cd ../..

./node_modules/.bin/prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma --config=packages/prisma/prisma.config.ts

export NODE_OPTIONS="--no-node-snapshot --max-old-space-size=384"
export HOSTNAME="0.0.0.0"
export PORT="${PORT:-10000}"

exec node apps/builder/server.js
