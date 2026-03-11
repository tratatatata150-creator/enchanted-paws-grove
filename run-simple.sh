#!/bin/bash
# Ultra-simple startup - skip frontend build if dist exists

echo "🌿 Starting Enchanted Paws Grove..."

# Backend deps
cd backend && pip install --quiet -r requirements.txt && cd ..

# Try to build frontend if not exists
if [ ! -d "frontend/dist" ]; then
  echo "📦 Building frontend (first time only)..."
  cd frontend && npm install --silent && npm run build && cd ..
fi

# Start
echo "🚀 Server starting on port 3000..."
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 3000
