"""
Vercel Serverless entry point for FastAPI backend
"""
from app.main import app

# Vercel expects a variable named 'app' or a handler function
# FastAPI app can be used directly with ASGI
handler = app
