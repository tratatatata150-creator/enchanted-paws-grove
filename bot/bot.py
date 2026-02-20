"""
Enchanted Paws Grove — Telegram Bot
Handles: /start, Mini App launch button, payment webhooks, admin commands.

Install: pip install python-telegram-bot==20.7
Run: python bot.py
"""
import os
import sys
import json
import asyncio
import logging
from typing import Optional

from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup,
    WebAppInfo, LabeledPrice,
)
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    PreCheckoutQueryHandler, ContextTypes, filters,
)
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

BOT_TOKEN   = os.getenv("TELEGRAM_BOT_TOKEN", "")
APP_URL     = os.getenv("FRONTEND_URL", "https://your-app.vercel.app")
BACKEND_URL = os.getenv("BACKEND_URL", "https://your-backend.onrender.com")

if not BOT_TOKEN:
    logger.error("TELEGRAM_BOT_TOKEN not set!")
    sys.exit(1)

# ─── Messages ─────────────────────────────────────────────────────────────────
WELCOME_EN = """
🌿 *Welcome to Enchanted Paws Grove!*

A cozy magical forest where adorable creatures live and merge into something even more magical! ✨

🐱 Merge fluffy fairy-cats
🐲 Raise baby dragons that love hugs
🦄 Collect sparkling mini-unicorns
🦊 Discover glowing forest foxes
🍄 Meet mushroom sprites

*How to play:*
• Tap a creature → tap another of the same kind → *MERGE!* ✨
• Creatures produce magic resources even while you're away
• Build cozy cottages and earn bonuses
• Complete daily quests for rewards

No pay-to-win. Just pure cozy fun! 🌟
"""

WELCOME_RU = """
🌿 *Добро пожаловать в Волшебную Рощу Пушистиков!*

Уютный волшебный лес, где живут очаровательные зверьки, которых можно объединять в нечто ещё более волшебное! ✨

🐱 Сливай пушистых волшебных кошек
🐲 Воспитывай малышей-дракончиков, которые любят обниматься
🦄 Коллекционируй сверкающих мини-единорогов
🦊 Открывай светящихся лесных лис
🍄 Знакомься с грибными эльфами

*Как играть:*
• Нажми на зверька → нажми на такого же → *СЛИЯНИЕ!* ✨
• Зверьки производят волшебные ресурсы, пока ты офлайн
• Строй уютные домики и получай бонусы
• Выполняй ежедневные задания за награды

Без доната. Только уютное веселье! 🌟
"""


def get_welcome(lang: Optional[str]) -> str:
    return WELCOME_RU if lang and lang.startswith("ru") else WELCOME_EN


def get_play_button_text(lang: Optional[str]) -> str:
    return "🌿 Играть!" if lang and lang.startswith("ru") else "🌿 Play Now!"


# ─── Handlers ─────────────────────────────────────────────────────────────────
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    lang = user.language_code if user else None

    # start_param for referral
    start_param = context.args[0] if context.args else None
    app_url = APP_URL
    if start_param:
        app_url = f"{APP_URL}?tgWebAppStartParam={start_param}"

    keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton(
            get_play_button_text(lang),
            web_app=WebAppInfo(url=app_url),
        )
    ]])

    await update.message.reply_text(
        get_welcome(lang),
        parse_mode="Markdown",
        reply_markup=keyboard,
    )


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    lang = user.language_code if user else None

    if lang and lang.startswith("ru"):
        text = (
            "🌿 *Волшебная Роща Пушистиков — Помощь*\n\n"
            "/start — Запустить игру\n"
            "/help — Показать эту справку\n"
            "/referral — Показать твой реферальный код\n\n"
            "По вопросам: обратись в поддержку"
        )
    else:
        text = (
            "🌿 *Enchanted Paws Grove — Help*\n\n"
            "/start — Launch the game\n"
            "/help — Show this help\n"
            "/referral — Show your referral code\n\n"
            "For support, contact us in the game"
        )

    await update.message.reply_text(text, parse_mode="Markdown")


async def referral_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    lang = user.language_code if user else None

    # In production, fetch referral code from backend
    # For now just show instructions
    if lang and lang.startswith("ru"):
        text = (
            "🤝 *Твой реферальный код*\n\n"
            "Открой игру, перейди в Профиль и нажми «Поделиться» — "
            "твой уникальный код будет в ссылке!\n\n"
            "Каждый приглашённый друг даст вам обоим бесплатного зверька 🐱"
        )
    else:
        text = (
            "🤝 *Your Referral Code*\n\n"
            "Open the game, go to Profile and tap 'Share Invite' — "
            "your unique code will be in the link!\n\n"
            "Each invited friend gives you both a free creature 🐱"
        )

    keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton(
            get_play_button_text(lang),
            web_app=WebAppInfo(url=APP_URL),
        )
    ]])

    await update.message.reply_text(text, parse_mode="Markdown", reply_markup=keyboard)


# ─── Payment handlers ─────────────────────────────────────────────────────────
async def pre_checkout_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Always approve — validation happens in game logic."""
    query = update.pre_checkout_query
    await query.answer(ok=True)


async def successful_payment_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Notify user after successful payment."""
    payment = update.message.successful_payment
    user = update.effective_user
    lang = user.language_code if user else None

    try:
        payload = json.loads(payment.invoice_payload)
        item_id = payload.get("item_id", "")
    except Exception:
        item_id = ""

    if lang and lang.startswith("ru"):
        msg = f"✅ Оплата прошла успешно! Предмет `{item_id}` добавлен в твою игру. Открой игру, чтобы увидеть!"
    else:
        msg = f"✅ Payment successful! Item `{item_id}` has been added to your game. Open the game to see it!"

    await update.message.reply_text(msg, parse_mode="Markdown")


# ─── Unknown message ───────────────────────────────────────────────────────────
async def unknown(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    lang = user.language_code if user else None

    keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton(
            get_play_button_text(lang),
            web_app=WebAppInfo(url=APP_URL),
        )
    ]])

    msg = "🌿 Нажми кнопку ниже, чтобы открыть игру!" if (lang and lang.startswith("ru")) else "🌿 Tap the button below to open the game!"
    await update.message.reply_text(msg, reply_markup=keyboard)


# ─── Main ─────────────────────────────────────────────────────────────────────
def main() -> None:
    logger.info("Starting Enchanted Paws Grove bot...")

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start",    start))
    app.add_handler(CommandHandler("help",     help_cmd))
    app.add_handler(CommandHandler("referral", referral_cmd))
    app.add_handler(PreCheckoutQueryHandler(pre_checkout_handler))
    app.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, unknown))

    logger.info("Bot is running! Press Ctrl+C to stop.")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
