#!/bin/bash

echo "🔨 Building Enchanted Paws Grove..."

# Install frontend dependencies and build
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install Python dependencies with uv
echo "🐍 Installing Python dependencies..."
cd api
uv pip install --system -r requirements.txt
cd ..

echo "✅ Build complete!"
