#!/bin/bash

echo "🌿 Starting Enchanted Paws Grove on Replit..."

# Install dependencies if needed
if [ ! -d "backend/venv" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend && pip install -r requirements.txt && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

# Start backend in background
echo "🐍 Starting backend on port 8000..."
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "⚛️ Starting frontend on port 5173..."
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173

# When frontend stops, kill backend too
kill $BACKEND_PID
