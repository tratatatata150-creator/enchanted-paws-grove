#!/bin/bash
# Fast deployment - uses pre-built frontend

echo "🚀 Fast deployment - using pre-built frontend"

# Install backend dependencies only
echo "📦 Installing backend dependencies..."
cd backend
pip install --quiet -r requirements.txt
cd ..

echo "✅ Ready! Starting server..."
cd backend
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
