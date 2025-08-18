#!/bin/bash

cd backend
npm run build
cd ..

cd frontend
npm run build
cd ..

pm2 start ecosystem.config.js

pm2 save