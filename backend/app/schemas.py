from pydantic import BaseModel
from typing import Optional, Any


# ─── Auth ─────────────────────────────────────────────────────────────────────
class AuthRequest(BaseModel):
    start_param: Optional[str] = None


class AuthResponse(BaseModel):
    telegramId: int
    username: str
    firstName: str
    languageCode: str
    photoUrl: Optional[str] = None
    gameState: dict
    isNewUser: bool
    referralCode: str
    createdAt: int
    lastSeen: int


# ─── Game ─────────────────────────────────────────────────────────────────────
class SaveStateRequest(BaseModel):
    state: dict


class MergeRequest(BaseModel):
    from_id: str
    to_id: str


class CollectRequest(BaseModel):
    creature_id: str


class MergeResponse(BaseModel):
    newCreatureId: str
    newLevel: int
    xpGained: int
    aiName: Optional[str] = None


# ─── Shop ─────────────────────────────────────────────────────────────────────
class BuyRequest(BaseModel):
    item_id: str


class BuyResponse(BaseModel):
    success: bool
    newCreatureId: Optional[str] = None
    newSlots: Optional[int] = None
    message: str


# ─── Quests ───────────────────────────────────────────────────────────────────
class ClaimQuestRequest(BaseModel):
    quest_id: str


class ClaimQuestResponse(BaseModel):
    rewards: dict


# ─── Payments ─────────────────────────────────────────────────────────────────
class CreateInvoiceRequest(BaseModel):
    item_id: str
    title: str
    description: str
    amount: int   # Stars


class CreateInvoiceResponse(BaseModel):
    invoiceUrl: str


class VerifyPaymentRequest(BaseModel):
    charge_id: str
    item_id: str


# ─── Referral ─────────────────────────────────────────────────────────────────
class ApplyReferralRequest(BaseModel):
    code: str


class ApplyReferralResponse(BaseModel):
    reward: dict
