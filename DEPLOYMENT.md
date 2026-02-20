# 🌿 Enchanted Paws Grove — Complete Deployment Guide

## Overview

| Layer      | Tech          | Host              | Cost     |
|------------|---------------|-------------------|----------|
| Frontend   | React + Vite  | Vercel (free)     | Free     |
| Backend    | FastAPI       | Render (free)     | Free     |
| Database   | SQLite→PG     | Render (free)     | Free     |
| Bot        | PTB 20.x      | Render / Railway  | Free     |

---

## STEP 1 — Create Your Telegram Bot

1. Open Telegram, search **@BotFather**
2. Send `/newbot`
3. Name: `Enchanted Paws Grove`
4. Username: `EnchantedPawsGroveBot` (must end in "bot")
5. Copy the **bot token** → save it!

6. Send `/setmenubutton` → select your bot → set a menu button:
   ```
   Button text: 🌿 Play
   URL: https://your-app.vercel.app
   ```

7. Send `/setdomain` → select your bot → enter your Vercel domain
   (This allows the Mini App to run)

8. **Enable payments (Telegram Stars):**
   Send `/mybots` → select your bot → `Payments` → enable **Telegram Stars (XTR)**

---

## STEP 2 — Deploy Frontend (Vercel)

### Method A: GitHub + Vercel (Recommended)
```bash
# 1. Create a GitHub repo and push the project
cd enchanted-paws-grove
git init
git add .
git commit -m "Initial commit — Enchanted Paws Grove"
git remote add origin https://github.com/YOUR_USERNAME/enchanted-paws-grove.git
git push -u origin main

# 2. Go to vercel.com → New Project → import your GitHub repo
# 3. Set Root Directory to: frontend
# 4. Framework: Vite
# 5. Add Environment Variables:
#    VITE_API_URL = https://your-backend.onrender.com/api
#    VITE_BOT_USERNAME = EnchantedPawsGroveBot
# 6. Deploy!
```

### Method B: Vercel CLI
```bash
npm i -g vercel
cd enchanted-paws-grove/frontend
npm install
vercel --prod
# Follow prompts, set env vars in vercel.com dashboard
```

### Vercel Environment Variables:
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_BOT_USERNAME=EnchantedPawsGroveBot
```

---

## STEP 3 — Deploy Backend (Render)

1. Go to **render.com** → New → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3.11
4. Add Environment Variables:
   ```
   TELEGRAM_BOT_TOKEN     = your_bot_token
   TELEGRAM_BOT_USERNAME  = EnchantedPawsGroveBot
   SECRET_KEY             = your_random_32_char_secret
   FRONTEND_URL           = https://your-app.vercel.app
   DATABASE_URL           = sqlite:///./enchanted_paws.db
   ENVIRONMENT            = production
   DEBUG                  = false
   GROQ_API_KEY           = your_groq_key (optional)
   ```
5. Click **Create Web Service** — wait ~3 minutes

**Test your backend:**
```
curl https://your-backend.onrender.com/api/health
# Should return: {"status":"ok","game":"Enchanted Paws Grove"}
```

### Upgrading to PostgreSQL (when you need it):
1. Create a Postgres database on Render (free tier)
2. Copy the connection URL
3. Update `DATABASE_URL` env var to the postgres:// URL
4. Add `psycopg2-binary` to requirements.txt
5. Redeploy — SQLAlchemy handles the rest

---

## STEP 4 — Deploy Telegram Bot

The bot handles `/start`, payment webhooks, etc.

### Option A: Run on Render (as a Background Worker)
1. In your Render dashboard → New → **Background Worker**
2. Same repo, Root Directory: `bot`
3. Build: `pip install -r requirements.txt`
4. Start: `python bot.py`
5. Env vars:
   ```
   TELEGRAM_BOT_TOKEN = your_bot_token
   FRONTEND_URL       = https://your-app.vercel.app
   BACKEND_URL        = https://your-backend.onrender.com
   ```

### Option B: Run locally (for testing)
```bash
cd bot
cp .env.example .env
# Edit .env with your tokens
pip install -r requirements.txt
python bot.py
```

---

## STEP 5 — Register Payment Webhook (for Telegram Stars)

After backend is deployed, register the payment webhook:

```bash
curl -X POST \
  "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-backend.onrender.com/api/payments/webhook"}'
```

Response should be: `{"ok":true,"result":true}`

---

## STEP 6 — Connect Everything

1. Update BotFather with your Mini App URL:
   ```
   /setmenubutton → your bot → set URL to https://your-app.vercel.app
   ```

2. Test the full flow:
   - Open your bot in Telegram
   - Click the Menu button → Mini App opens
   - Auth happens automatically
   - Game loads! ✨

---

## STEP 7 — Add Groq AI Names (Optional, Very Cheap)

1. Go to **console.groq.com** → sign up free
2. Create API key
3. Add to backend env vars: `GROQ_API_KEY=your_key`
4. Now when creatures evolve, they get AI-generated names

Cost: ~$0.00 per 1000 names (llama3-8b is free tier on Groq)

---

## Database Schema

```sql
-- Users table (main save file)
CREATE TABLE users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id     INTEGER UNIQUE NOT NULL,      -- Telegram user ID
  username        TEXT,
  first_name      TEXT NOT NULL DEFAULT 'Player',
  language_code   TEXT DEFAULT 'en',
  photo_url       TEXT,
  game_state      TEXT NOT NULL DEFAULT '{}',   -- JSON game state
  subscription    TEXT DEFAULT 'none',          -- none/sprout/grove/enchanted
  subscription_expires INTEGER,                 -- Unix ms
  no_ads          BOOLEAN DEFAULT FALSE,
  referral_code   TEXT UNIQUE,                  -- 8-char code
  referred_by     INTEGER,                      -- Telegram ID of referrer
  referral_count  INTEGER DEFAULT 0,
  created_at      INTEGER NOT NULL,             -- Unix ms
  last_seen       INTEGER NOT NULL
);

-- Purchases (Stars payments)
CREATE TABLE purchases (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id INTEGER NOT NULL,
  item_id     TEXT NOT NULL,
  amount      INTEGER NOT NULL,                 -- Stars amount
  currency    TEXT DEFAULT 'XTR',
  charge_id   TEXT,                             -- Telegram charge ID
  created_at  INTEGER NOT NULL
);

-- Referral tracking
CREATE TABLE referral_rewards (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id INTEGER NOT NULL,
  referred_id INTEGER NOT NULL,
  reward_given BOOLEAN DEFAULT FALSE,
  created_at  INTEGER NOT NULL
);
```

### Game State JSON Structure:
```json
{
  "grid": [                          // 40 slots, null or creature
    {
      "id": "c_abc123_98765",
      "family": "fairy_cat",
      "level": 2,
      "lastCollected": 1700000000000,
      "pendingResources": {"leaves":0,"dew":0,"berries":0},
      "isCollecting": false
    },
    null
  ],
  "unlockedSlots": 15,
  "resources": {"leaves": 150, "dew": 20, "berries": 2},
  "level": 3,
  "experience": 450,
  "lastOnline": 1700000000000,
  "catchupBonus": {"leaves": 0, "dew": 0, "berries": 0},
  "discoveredCreatures": [
    {"family":"fairy_cat","level":1,"discoveredAt":1700000000000,"totalMerged":5}
  ],
  "buildings": [],
  "dailyQuests": [],
  "questLastReset": 1700000000000,
  "totalMerges": 42,
  "referralCode": "ABC12345",
  "referralCount": 3,
  "subscription": "grove",
  "noAds": false
}
```

---

## Telegram Stars Payment Flow

```
User taps "Buy" in shop
    ↓
Frontend: POST /api/payments/create-invoice
    ↓
Backend: calls Telegram Bot API createInvoiceLink
    ↓
Frontend: calls Telegram.WebApp.openInvoice(url)
    ↓
Telegram: shows Stars payment UI to user
    ↓
User confirms → Telegram sends pre_checkout_query to bot webhook
    ↓
Bot answers: answerPreCheckoutQuery(ok=True)
    ↓
Telegram sends successful_payment to bot webhook
    ↓
Backend: records purchase, applies item to game state
    ↓
Frontend: receives "paid" status → calls POST /api/payments/verify
    ↓
Item appears in game ✨
```

---

## Local Development

### Frontend:
```bash
cd frontend
npm install
cp ../.env.example .env.local
# Set VITE_API_URL=http://localhost:8000/api
npm run dev
# Opens at http://localhost:5173
```

### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — you can leave TELEGRAM_BOT_TOKEN empty for dev mode
uvicorn app.main:app --reload --port 8000
```

**Dev Mode:** When `TELEGRAM_BOT_TOKEN` is empty or `ENVIRONMENT=development`,
the backend uses a mock user (id=12345678) for auth. Perfect for local testing!

### Bot:
```bash
cd bot
pip install -r requirements.txt
cp .env.example .env
# Add your bot token
python bot.py
```

---

## Quick Launch Checklist

- [ ] Bot created via @BotFather, token saved
- [ ] Frontend deployed to Vercel with env vars set
- [ ] Backend deployed to Render with all env vars
- [ ] Bot deployed as background worker
- [ ] Webhook registered for payments
- [ ] Mini App URL set in BotFather
- [ ] Tested: open bot → click play → game loads
- [ ] Tested: merge two creatures
- [ ] Tested: Stars purchase (use test Stars in BotFather)
- [ ] Groq API key added for AI names (optional)

**Estimated launch time: 2-4 hours** ⏱️

---

## Production Checklist

- [ ] Change `SECRET_KEY` to a random 64-char string
- [ ] Set `DEBUG=false`
- [ ] Set `ENVIRONMENT=production`
- [ ] Enable HTTPS on all services (Vercel + Render do this automatically)
- [ ] Set up Render alerts for downtime
- [ ] Test referral system end-to-end
- [ ] Monitor database size (SQLite, migrate to PG at ~100k users)

---

## Support & Monetisation Tips

- **Non-pay-to-win**: All progression available for free, Stars only for cosmetics/convenience
- **Rewarded ads**: Integrate Unity Ads or AdMob via Telegram Mini App (future)
- **Weekly events**: Add special creatures on weekends (add to game_data.py)
- **Leaderboards**: Add a scores table when you have 1000+ users
