#!/bin/bash

echo "🔨 Building Enchanted Paws Grove for Replit..."

# Install frontend dependencies and build
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install Python dependencies (without uv)
echo "🐍 Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "✅ Build complete!"
