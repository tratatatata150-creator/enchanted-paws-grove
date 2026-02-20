import time
from sqlalchemy import Column, Integer, String, Boolean, Text, Float
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    telegram_id = Column(Integer, unique=True, nullable=False, index=True)
    username = Column(String(64), nullable=True)
    first_name = Column(String(128), nullable=False, default="Player")
    language_code = Column(String(8), default="en")
    photo_url = Column(String(512), nullable=True)

    # Game state stored as JSON blob for flexibility
    game_state = Column(Text, nullable=False, default="{}")

    # Monetisation
    subscription = Column(String(20), default="none")
    subscription_expires = Column(Integer, nullable=True)  # unix ms
    no_ads = Column(Boolean, default=False)

    # Social
    referral_code = Column(String(16), unique=True, nullable=True)
    referred_by = Column(Integer, nullable=True)  # telegram_id
    referral_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(Integer, nullable=False, default=lambda: int(time.time() * 1000))
    last_seen = Column(Integer, nullable=False, default=lambda: int(time.time() * 1000))


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    telegram_id = Column(Integer, nullable=False, index=True)
    item_id = Column(String(64), nullable=False)
    amount = Column(Integer, nullable=False)       # Stars amount
    currency = Column(String(8), default="XTR")   # XTR = Telegram Stars
    charge_id = Column(String(256), nullable=True) # from Telegram payment
    created_at = Column(Integer, nullable=False, default=lambda: int(time.time() * 1000))


class ReferralReward(Base):
    __tablename__ = "referral_rewards"

    id = Column(Integer, primary_key=True, autoincrement=True)
    referrer_id = Column(Integer, nullable=False)   # telegram_id
    referred_id = Column(Integer, nullable=False)   # telegram_id
    reward_given = Column(Boolean, default=False)
    created_at = Column(Integer, nullable=False, default=lambda: int(time.time() * 1000))
