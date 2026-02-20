"""
Telegram Stars payment integration.

Flow:
1. Frontend calls POST /payments/create-invoice → gets invoice URL
2. Frontend calls Telegram.WebApp.openInvoice(url) → user pays
3. Telegram sends pre_checkout_query to bot webhook → bot answers
4. Telegram sends successful_payment to bot webhook → bot notifies backend
5. Frontend calls POST /payments/verify to apply purchase effects
"""
import json
import time
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Purchase
from ..schemas import CreateInvoiceRequest, CreateInvoiceResponse, VerifyPaymentRequest
from ..config import get_settings
from ..telegram_auth import get_init_data_header, parse_user_from_init_data
from ..game_service import apply_stars_purchase
from ..game_data import SUBSCRIPTION_PRICES, SHOP_ITEMS

router = APIRouter(prefix="/payments", tags=["payments"])
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


@router.post("/create-invoice", response_model=CreateInvoiceResponse)
async def create_invoice(body: CreateInvoiceRequest, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)

    if not settings.telegram_bot_token:
        raise HTTPException(status_code=503, detail="Payments not configured")

    # Build Telegram Stars invoice via Bot API
    prices = [{"label": body.title, "amount": body.amount}]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.telegram.org/bot{settings.telegram_bot_token}/createInvoiceLink",
            json={
                "title": body.title[:32],
                "description": body.description[:255],
                "payload": json.dumps({"item_id": body.item_id, "user_id": user.telegram_id}),
                "currency": "XTR",          # Telegram Stars
                "prices": prices,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to create invoice")

    data = resp.json()
    if not data.get("ok"):
        raise HTTPException(status_code=500, detail=data.get("description", "Invoice error"))

    invoice_url = data["result"]
    return CreateInvoiceResponse(invoiceUrl=invoice_url)


@router.post("/verify")
def verify_payment(body: VerifyPaymentRequest, request: Request, db: Session = Depends(get_db)):
    """
    Called after Telegram confirms payment. Apply item to user account.
    In production, verify charge_id against Telegram's records.
    """
    user = get_current_user(request, db)

    # Record purchase
    purchase = Purchase(
        telegram_id=user.telegram_id,
        item_id=body.item_id,
        amount=0,  # filled from webhook in production
        currency="XTR",
        charge_id=body.charge_id,
        created_at=int(time.time() * 1000),
    )
    db.add(purchase)

    state = json.loads(user.game_state)

    # Handle subscription
    if body.item_id in SUBSCRIPTION_PRICES:
        tier = body.item_id
        user.subscription = tier
        # 30 days
        user.subscription_expires = int(time.time() * 1000) + 30 * 24 * 3600 * 1000
        state["subscription"] = tier
        if tier == "enchanted":
            user.no_ads = True
            state["noAds"] = True

    else:
        # Apply item effect
        state = apply_stars_purchase(state, body.item_id)
        if body.item_id == "no_ads":
            user.no_ads = True
            state["noAds"] = True

    user.game_state = json.dumps(state)
    db.commit()

    return {"applied": True}


@router.post("/webhook")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Receive Telegram Bot updates (payments) via webhook.
    Register with: POST https://api.telegram.org/bot<TOKEN>/setWebhook
    Body: {"url": "https://your-backend.com/api/payments/webhook"}
    """
    body = await request.json()

    message = body.get("message", {})
    successful_payment = message.get("successful_payment")
    pre_checkout_query = body.get("pre_checkout_query")

    if pre_checkout_query:
        # Always approve pre-checkout (validate stock, limits here if needed)
        query_id = pre_checkout_query["id"]
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{settings.telegram_bot_token}/answerPreCheckoutQuery",
                json={"pre_checkout_query_id": query_id, "ok": True},
            )
        return {"ok": True}

    if successful_payment:
        payload_str = successful_payment.get("invoice_payload", "{}")
        try:
            payload = json.loads(payload_str)
        except Exception:
            return {"ok": True}

        item_id = payload.get("item_id")
        user_id = payload.get("user_id") or message.get("from", {}).get("id")
        charge_id = successful_payment.get("telegram_payment_charge_id", "")

        if item_id and user_id:
            user = db.query(User).filter(User.telegram_id == user_id).first()
            if user:
                purchase = Purchase(
                    telegram_id=user_id,
                    item_id=item_id,
                    amount=successful_payment.get("total_amount", 0),
                    currency="XTR",
                    charge_id=charge_id,
                    created_at=int(time.time() * 1000),
                )
                db.add(purchase)

                state = json.loads(user.game_state)
                if item_id in SUBSCRIPTION_PRICES:
                    user.subscription = item_id
                    user.subscription_expires = int(time.time() * 1000) + 30 * 24 * 3600 * 1000
                    state["subscription"] = item_id
                else:
                    state = apply_stars_purchase(state, item_id)

                user.game_state = json.dumps(state)
                db.commit()

    return {"ok": True}
