import json
import time
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, ReferralReward
from ..schemas import AuthRequest, AuthResponse
from ..config import get_settings
from ..telegram_auth import get_init_data_header, parse_user_from_init_data
from ..game_service import (
    default_game_state, make_referral_code,
    apply_referral_reward, apply_referrer_reward,
    refresh_quests_if_needed,
)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


@router.post("/telegram", response_model=AuthResponse)
def auth_telegram(body: AuthRequest, request: Request, db: Session = Depends(get_db)):
    init_data = get_init_data_header(request)

    # Allow dev mode (no bot token set)
    allow_dev = not settings.telegram_bot_token or settings.environment == "development"
    parsed = parse_user_from_init_data(init_data, settings.telegram_bot_token, allow_dev=allow_dev)
    tg_user = parsed["user"]

    telegram_id = tg_user.get("id")
    if not telegram_id:
        raise HTTPException(status_code=401, detail="No user ID in init data")

    now_ms = int(time.time() * 1000)
    is_new_user = False

    # Find or create user
    user: User = db.query(User).filter(User.telegram_id == telegram_id).first()

    if not user:
        is_new_user = True
        referral_code = make_referral_code()

        # Build initial game state
        state = default_game_state(tg_user.get("language_code", "en"))
        state["referralCode"] = referral_code

        user = User(
            telegram_id=telegram_id,
            username=tg_user.get("username", ""),
            first_name=tg_user.get("first_name", "Player"),
            language_code=tg_user.get("language_code", "en"),
            photo_url=tg_user.get("photo_url"),
            referral_code=referral_code,
            game_state=json.dumps(state),
            created_at=now_ms,
            last_seen=now_ms,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    else:
        # Update last seen
        user.last_seen = now_ms
        user.first_name = tg_user.get("first_name", user.first_name)
        user.username = tg_user.get("username", user.username)
        if tg_user.get("photo_url"):
            user.photo_url = tg_user["photo_url"]
        db.commit()

    # Handle referral from start_param
    if body.start_param and is_new_user:
        referrer = db.query(User).filter(User.referral_code == body.start_param).first()
        if referrer and referrer.telegram_id != telegram_id:
            # Check not already referred
            existing_reward = db.query(ReferralReward).filter(
                ReferralReward.referred_id == telegram_id
            ).first()
            if not existing_reward:
                reward = ReferralReward(
                    referrer_id=referrer.telegram_id,
                    referred_id=telegram_id,
                    reward_given=True,
                )
                db.add(reward)

                # Apply rewards
                new_user_state = json.loads(user.game_state)
                new_user_state = apply_referral_reward(new_user_state)
                new_user_state["referredBy"] = referrer.telegram_id
                user.game_state = json.dumps(new_user_state)
                user.referred_by = referrer.telegram_id

                referrer_state = json.loads(referrer.game_state)
                referrer_state = apply_referrer_reward(referrer_state)
                referrer.game_state = json.dumps(referrer_state)
                referrer.referral_count = (referrer.referral_count or 0) + 1

                db.commit()
                db.refresh(user)

    # Parse and refresh quests if needed
    state = json.loads(user.game_state)
    state = refresh_quests_if_needed(state)
    state["referralCode"] = user.referral_code or ""
    state["subscription"] = user.subscription or "none"
    state["noAds"] = user.no_ads or False

    # Save if quests refreshed
    user.game_state = json.dumps(state)
    db.commit()

    return AuthResponse(
        telegramId=user.telegram_id,
        username=user.username or "",
        firstName=user.first_name,
        languageCode=user.language_code or "en",
        photoUrl=user.photo_url,
        gameState=state,
        isNewUser=is_new_user,
        referralCode=user.referral_code or "",
        createdAt=user.created_at,
        lastSeen=user.last_seen,
    )
