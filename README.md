# 🌿 Enchanted Paws Grove
### Волшебная Роща Пушистиков

> A cozy magical forest Telegram Mini App where players merge super-cute mythical creatures!

[![Telegram Mini App](https://img.shields.io/badge/Telegram-Mini%20App-blue?logo=telegram)](https://t.me/YourBot)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20+%20Vite-blue)](https://vitejs.dev)

---

## ✨ Features

- 🐱 **5 creature families** × **5 evolution levels** = 25 unique creatures
- 🔀 **Drag-to-select merge** system (mobile optimised)
- 💤 **Idle resource generation** with 8h offline catch-up bonus
- 🌟 **Telegram Stars** subscriptions + one-time purchases
- 🏡 **5 buildings** with gameplay bonuses
- 📜 **4 daily quests** that reset every 24h
- 📖 **Creature collection bestiary**
- 🤝 **Referral system** (both players get a free creature)
- 🌍 **English + Russian** (auto-detect from Telegram)
- 🤖 **Groq AI** creature name generation (with fallback list)
- 🎨 Beautiful dark purple/pastel theme with glow animations

## 🏗 Architecture

```
enchanted-paws-grove/
├── frontend/           React + Vite + Zustand + TypeScript
│   └── src/
│       ├── types.ts           All TypeScript types
│       ├── gameData.ts        Creatures, buildings, shop items
│       ├── store.ts           Zustand game state
│       ├── i18n.ts            EN + RU translations
│       ├── api.ts             Backend API client
│       └── components/        React UI components
├── backend/            FastAPI + SQLAlchemy + SQLite
│   └── app/
│       ├── main.py            FastAPI app + CORS
│       ├── models.py          SQLAlchemy models
│       ├── game_service.py    Core game logic
│       ├── ai_service.py      Groq name generation
│       └── routes/            Auth, game, shop, quests, payments
└── bot/                Telegram Bot (python-telegram-bot 20.x)
    └── bot.py               /start, payments, referrals
```

## 🚀 Quick Start

```bash
# Clone / use this folder
cd enchanted-paws-grove

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Bot (new terminal — optional for local)
cd bot
pip install -r requirements.txt
python bot.py
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full production deployment guide.

## 💰 Monetisation (non-pay-to-win)

| Item                | Price     | Description                           |
|---------------------|-----------|---------------------------------------|
| Sprout Pass/month   | 150 ⭐    | +20% resources, daily bonus creature  |
| Grove Pass/month    | 300 ⭐    | +50% resources, +5 slots, daily 2 creatures |
| Enchanted Pass/month| 500 ⭐    | 2× resources, +10 slots, no ads, 5 daily creatures |
| Extra 5 Slots       | 50 ⭐     | Permanent slot unlock                 |
| No Ads Forever      | 75 ⭐     | Permanent no-ads                      |
| Moon Grove Theme    | 100 ⭐    | Cosmetic forest theme                 |

All game content achievable for free. Stars = cosmetics & convenience only.

## 🦎 Creature Evolution Chart

| Family          | Lv1              | Lv2              | Lv3              | Lv4              | Lv5              |
|-----------------|------------------|------------------|------------------|------------------|------------------|
| 🐱 Fairy Cat    | Fluffy Kit       | Star Kitten      | Cosmic Cat       | Celestial Feline | Divine Whisker   |
| 🐲 Baby Dragon  | Ember Hatchling  | Cuddle Drake     | Azure Dragon     | Storm Wyrm       | Eternal Dragon   |
| 🦄 Mini Unicorn | Sparkle Foal     | Rainbow Pony     | Crystal Unicorn  | Star Unicorn     | Prismatic Alicorn|
| 🦊 Forest Fox   | Dewdrop Fox      | Glow Fox         | Aurora Fox       | Celestial Vixen  | Divine Fox Spirit|
| 🍄 Mush Sprite  | Spore Sprite     | Bloom Sprite     | Forest Guardian  | Ancient Keeper   | Elder Spirit     |

## 📱 Screenshots

The game features:
- Dark enchanted forest theme with star-field background
- Pastel glowing creatures with floating animations
- 5×8 merge grid with tap-select mechanic
- Resource bar (Magic Leaves 🍃, Star Dew 💧, Crystal Berries 🍇)
- Smooth merge animations with haptic feedback
- 5-tab navigation: Grove, Shop, Quests, Bestiary, Profile

## 🔧 Adding New Content

**Add a new creature family** → edit `frontend/src/gameData.ts` + `backend/app/game_data.py`

**Add a new building** → same files, `BUILDINGS` array

**Add a new shop item** → same files, `SHOP_ITEMS` dict

**Add new quest types** → `backend/app/game_service.py` `QUEST_TEMPLATES` + frontend quest rendering

**Add a new biome** → extend grid size in `game_data.py` + CSS grid columns

## 📄 License

MIT — free to use, modify and ship!

---

Made with ✨ for the Telegram Mini App ecosystem
