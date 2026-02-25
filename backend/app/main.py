from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from .config import get_settings
from .database import init_db
from .routes import auth, game, shop, quests, payments, referral

settings = get_settings()

app = FastAPI(
    title="Enchanted Paws Grove API",
    description="Backend for the Enchanted Paws Grove Telegram Mini App",
    version="1.0.0",
    docs_url="/api/docs" if settings.debug else None,
    redoc_url=None,
)

# CORS — allow Telegram Mini App origin
# Note: When serving frontend from same domain, CORS is not needed for those requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "https://web.telegram.org",
        "https://t.me",
        # Dev origins
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers (all under /api prefix)
app.include_router(auth.router,     prefix="/api")
app.include_router(game.router,     prefix="/api")
app.include_router(shop.router,     prefix="/api")
app.include_router(quests.router,   prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(referral.router, prefix="/api")


@app.on_event("startup")
def startup():
    init_db()
    print("✅ Enchanted Paws Grove backend started!")
    print(f"   Environment: {settings.environment}")
    print(f"   Frontend URL: {settings.frontend_url}")


@app.get("/api/health")
def health():
    return {"status": "ok", "game": "Enchanted Paws Grove", "version": "1.0.0"}


# Serve static files from frontend/dist (production build)
FRONTEND_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    # Mount static assets
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/")
    def root():
        """Serve the React app"""
        return FileResponse(FRONTEND_DIST / "index.html")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        """Catch-all route to serve React app for client-side routing"""
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        # Fallback to index.html for SPA routing
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {"message": "Enchanted Paws Grove Backend 🌿", "note": "Frontend not built. Run: cd frontend && npm run build"}
