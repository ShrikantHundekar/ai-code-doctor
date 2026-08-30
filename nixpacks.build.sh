#!/bin/bash
# Railway Nixpacks build script
# Builds the React frontend and installs Python backend dependencies

echo "=== Installing frontend dependencies ==="
npm install

echo "=== Building React frontend ==="
npm run build

echo "=== Installing Python backend dependencies ==="
cd backend
pip install -r requirements.txt
cd ..

echo "=== Build complete ==="
