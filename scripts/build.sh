#!/bin/bash

cd backend
npm run build
cd ..

cd frontend
npm run build
cd ..
