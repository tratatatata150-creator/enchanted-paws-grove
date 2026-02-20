from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


@app.get("/")
def root():
    return {"message": "Enchanted Paws Grove Backend 🌿"}
