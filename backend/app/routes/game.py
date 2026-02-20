import json
import time
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import SaveStateRequest, MergeRequest, CollectRequest
from ..config import get_settings
from ..telegram_auth import get_init_data_header, parse_user_from_init_data
from ..game_service import perform_merge, perform_collect
from ..ai_service import generate_creature_name

router = APIRouter(prefix="/game", tags=["game"])
settings = get_settings()


def get_current_user(request: Request, db: Session) -> User:
    init_data = get_init_data_header(request)
    allow_dev = not settings.telegram_bot_token or settings.environment == "development"
    parsed = parse_user_from_init_data(init_data, settings.telegram_bot_token, allow_dev=allow_dev)
    tg_id = parsed["user"]["id"]
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Auth first.")
    return user


@router.get("/state")
def get_state(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    state = json.loads(user.game_state)
    state["referralCode"] = user.referral_code or ""
    state["subscription"] = user.subscription or "none"
    state["noAds"] = user.no_ads or False
    return state


@router.post("/save")
def save_state(body: SaveStateRequest, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)

    # Basic sanity — don't accept nonsense
    state = body.state
    if not isinstance(state.get("grid"), list):
        raise HTTPException(status_code=400, detail="Invalid state")

    # Preserve server-side values
    state["referralCode"] = user.referral_code or ""
    state["subscription"] = user.subscription or "none"
    state["noAds"] = user.no_ads or False
    state["lastOnline"] = int(time.time() * 1000)

    user.game_state = json.dumps(state)
    user.last_seen = int(time.time() * 1000)
    db.commit()
    return {"saved": True}


@router.post("/merge")
async def merge(body: MergeRequest, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    state = json.loads(user.game_state)

    try:
        new_state, result = perform_merge(state, body.from_id, body.to_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Try to get AI name (non-blocking)
    ai_name = None
    try:
        ai_name = await generate_creature_name(
            # Find the merged creature family from from_id's original
            next(c["family"] for c in state["grid"] if c and c["id"] == body.from_id),
            result["newLevel"],
            user.language_code or "en",
        )
    except Exception:
        pass

    new_state["lastOnline"] = int(time.time() * 1000)
    user.game_state = json.dumps(new_state)
    db.commit()

    return {**result, "aiName": ai_name}


@router.post("/collect")
def collect(body: CollectRequest, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    state = json.loads(user.game_state)

    try:
        new_state, earned = perform_collect(state, body.creature_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    new_state["lastOnline"] = int(time.time() * 1000)
    user.game_state = json.dumps(new_state)
    db.commit()

    return {"resources": earned}
