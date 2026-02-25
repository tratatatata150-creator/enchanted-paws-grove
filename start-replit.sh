#!/bin/bash

echo "🌿 Starting Enchanted Paws Grove on Replit..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies and BUILD
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🔨 Building frontend for production..."
npm run build
cd ..

# Start backend (which will serve the built frontend)
echo "🚀 Starting server on port 8000..."
echo "   Backend API: /api/*"
echo "   Frontend app: /"
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
