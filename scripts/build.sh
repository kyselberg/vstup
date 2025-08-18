#!/bin/bash

cd backend
pnpm install
pnpm run build
cd ..

cd frontend
pnpm install
pnpm run build
cd ..
