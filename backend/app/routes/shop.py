import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import BuyRequest, BuyResponse
from ..config import get_settings
from ..telegram_auth import get_init_data_header, parse_user_from_init_data
from ..game_service import perform_buy
from ..game_data import SHOP_ITEMS

router = APIRouter(prefix="/shop", tags=["shop"])
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


@router.get("/items")
def get_items():
    """Return shop items in a format the frontend can use."""
    items = []
    for item_id, item in SHOP_ITEMS.items():
        items.append({"id": item_id, **item})
    return items


@router.post("/buy", response_model=BuyResponse)
def buy_item(body: BuyRequest, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    state = json.loads(user.game_state)

    try:
        new_state, result = perform_buy(state, body.item_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user.game_state = json.dumps(new_state)
    db.commit()

    return BuyResponse(
        success=result.get("success", False),
        newCreatureId=result.get("newCreatureId"),
        message=result.get("message", ""),
    )
