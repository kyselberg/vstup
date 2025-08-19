#!/bin/bash

cd backend

pnpm install

pnpm run build

npx drizzle-kit generate --config ./drizzle.config.ts
npx drizzle-kit migrate --config ./drizzle.config.ts
npx drizzle-kit push --config ./drizzle.config.ts


cd ..
