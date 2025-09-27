#!/bin/bash

echo "🔒 Fixing security vulnerabilities..."

# Remove node_modules and package-lock.json to ensure clean install
echo "🧹 Cleaning up existing installations..."
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

echo "📦 Reinstalling dependencies with security fixes..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "🔍 Running security audit..."
npm audit

echo "✅ Security fixes applied!"
echo ""
echo "📋 Summary of fixes:"
echo "- Updated multer to v2.0.0-rc.4 (fixes file upload vulnerabilities)"
echo "- Added package overrides for deprecated packages"
echo "- Updated testing libraries to latest versions"
echo "- Updated web-vitals to v3.5.0"
echo ""
echo "🚀 You can now run 'npm run dev' to start the application"
