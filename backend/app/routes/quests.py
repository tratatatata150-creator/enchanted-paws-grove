import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import ClaimQuestRequest, ClaimQuestResponse
from ..config import get_settings
from ..telegram_auth import get_init_data_header, parse_user_from_init_data
from ..game_service import claim_quest as svc_claim_quest, refresh_quests_if_needed

router = APIRouter(prefix="/quests", tags=["quests"])
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


@router.get("/daily")
def get_daily_quests(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    state = json.loads(user.game_state)
    state = refresh_quests_if_needed(state)
    user.game_state = json.dumps(state)
    db.commit()
    return state.get("dailyQuests", [])


@router.post("/claim")
def claim_quest(body: ClaimQuestRequest, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    state = json.loads(user.game_state)

    try:
        new_state, reward = svc_claim_quest(state, body.quest_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user.game_state = json.dumps(new_state)
    db.commit()

    return ClaimQuestResponse(rewards=reward)
