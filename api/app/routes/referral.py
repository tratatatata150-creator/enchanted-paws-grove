import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, ReferralReward
from ..schemas import ApplyReferralRequest, ApplyReferralResponse
from ..config import get_settings
from ..telegram_auth import get_init_data_header, parse_user_from_init_data
from ..game_service import apply_referral_reward, apply_referrer_reward

router = APIRouter(prefix="/referral", tags=["referral"])
settings = get_settings()


def get_current_user(request: Request, db: Session) -> User:
    init_data = get_init_data_header(request)
    allow_dev = not settings.telegram_bot_token or settings.environment == "development"
    parsed = parse_user_from_init_data(init_data, settings.telegram_bot_token, allow_dev=allow_dev)
    tg_id = parsed["user"]["id"]
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/apply", response_model=ApplyReferralResponse)
def apply_referral(body: ApplyReferralRequest, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)

    # Already referred?
    already = db.query(ReferralReward).filter(
        ReferralReward.referred_id == user.telegram_id
    ).first()
    if already:
        raise HTTPException(status_code=400, detail="Already used a referral code")

    referrer = db.query(User).filter(User.referral_code == body.code).first()
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    if referrer.telegram_id == user.telegram_id:
        raise HTTPException(status_code=400, detail="Cannot use your own referral code")

    # Record
    reward_record = ReferralReward(
        referrer_id=referrer.telegram_id,
        referred_id=user.telegram_id,
        reward_given=True,
    )
    db.add(reward_record)

    # Reward both
    user_state = json.loads(user.game_state)
    user_state = apply_referral_reward(user_state)
    user_state["referredBy"] = referrer.telegram_id
    user.game_state = json.dumps(user_state)
    user.referred_by = referrer.telegram_id

    referrer_state = json.loads(referrer.game_state)
    referrer_state = apply_referrer_reward(referrer_state)
    referrer.game_state = json.dumps(referrer_state)
    referrer.referral_count = (referrer.referral_count or 0) + 1

    db.commit()

    return ApplyReferralResponse(reward={"leaves": 50, "creature": "fairy_cat"})
