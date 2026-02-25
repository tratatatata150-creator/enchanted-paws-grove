#!/bin/bash
set -e  # Exit on any error

echo "════════════════════════════════════════════════════"
echo "🌿 Enchanted Paws Grove - Replit Deployment"
echo "════════════════════════════════════════════════════"
echo ""

# 1. Backend dependencies
echo "📦 Step 1/4: Installing Python dependencies..."
cd backend
pip install --quiet -r requirements.txt || {
    echo "❌ Failed to install Python dependencies"
    exit 1
}
cd ..
echo "✅ Python dependencies installed"
echo ""

# 2. Frontend dependencies
echo "📦 Step 2/4: Installing Node.js dependencies..."
cd frontend
npm install --silent || {
    echo "❌ Failed to install Node.js dependencies"
    exit 1
}
echo "✅ Node.js dependencies installed"
echo ""

# 3. Build frontend
echo "🔨 Step 3/4: Building frontend..."
npm run build || {
    echo "❌ Frontend build failed!"
    echo ""
    echo "Showing last 20 lines of error:"
    npm run build 2>&1 | tail -20
    exit 1
}
cd ..
echo "✅ Frontend built successfully"
echo ""

# 4. Verify build
echo "🔍 Step 4/4: Verifying build..."
if [ -f "frontend/dist/index.html" ]; then
    echo "✅ frontend/dist/index.html exists"
else
    echo "❌ frontend/dist/index.html NOT FOUND"
    exit 1
fi

if [ -d "frontend/dist/assets" ]; then
    echo "✅ frontend/dist/assets/ exists"
else
    echo "❌ frontend/dist/assets/ NOT FOUND"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "✅ Build complete! Starting server..."
echo "════════════════════════════════════════════════════"
echo ""
echo "   🌐 Frontend: /"
echo "   🔌 API:      /api/*"
echo "   📚 Docs:     /api/docs"
echo ""

# 5. Start server
cd backend
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
