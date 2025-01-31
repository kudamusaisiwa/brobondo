#!/bin/bash

# Ensure we're in the project directory
cd "$(dirname "$0")"

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

# Deploy to Netlify
echo "Deploying to Netlify..."
npx netlify deploy --prod
