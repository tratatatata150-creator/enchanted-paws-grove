"""
Telegram WebApp initData HMAC-SHA256 verification.
Spec: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
"""
import hashlib
import hmac
import json
import time
from urllib.parse import unquote, parse_qsl
from typing import Optional
from fastapi import Request, HTTPException


def verify_telegram_init_data(init_data: str, bot_token: str) -> dict:
    """
    Verify Telegram WebApp initData and return the parsed user dict.
    Raises HTTPException(401) if invalid.
    """
    if not init_data:
        raise HTTPException(status_code=401, detail="Missing Telegram init data")

    try:
        params = dict(parse_qsl(unquote(init_data), keep_blank_values=True))
    except Exception:
        raise HTTPException(status_code=401, detail="Malformed init data")

    received_hash = params.pop("hash", None)
    if not received_hash:
        raise HTTPException(status_code=401, detail="Missing hash in init data")

    # Build data-check string
    data_check = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))

    # HMAC-SHA256
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    expected_hash = hmac.new(secret_key, data_check.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        raise HTTPException(status_code=401, detail="Invalid init data signature")

    # Check auth_date freshness (allow 1 hour)
    auth_date = int(params.get("auth_date", 0))
    if time.time() - auth_date > 3600:
        raise HTTPException(status_code=401, detail="Init data expired")

    # Parse user
    user_str = params.get("user", "{}")
    try:
        user = json.loads(user_str)
    except json.JSONDecodeError:
        raise HTTPException(status_code=401, detail="Invalid user data")

    return {"user": user, "params": params}


def get_init_data_header(request: Request) -> str:
    return request.headers.get("X-Telegram-Init-Data", "")


def parse_user_from_init_data(init_data: str, bot_token: str, allow_dev: bool = False) -> dict:
    """
    In development mode (no token configured), return a mock user.
    """
    if allow_dev and (not bot_token or bot_token == ""):
        return {
            "user": {
                "id": 12345678,
                "first_name": "Dev",
                "username": "devuser",
                "language_code": "en",
            },
            "params": {"auth_date": str(int(time.time()))},
        }
    return verify_telegram_init_data(init_data, bot_token)
