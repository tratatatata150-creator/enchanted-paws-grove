# ⚡ Quick Start Guide — Get Playing in 10 Minutes!

## 1️⃣ Create Your Telegram Bot (2 min)

```
Open Telegram → @BotFather

/newbot
  Name: Enchanted Paws Grove
  Username: YourBot  (must end in "bot")

Copy the token → save it!

/setdomain → your bot → https://your-app.vercel.app (will set later)
/setmenubutton → your bot → set button text "🌿 Play"
```

## 2️⃣ Deploy Frontend to Vercel (3 min)

```bash
# Push to GitHub
cd enchanted-paws-grove
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOURUSERNAME/enchanted-paws-grove.git
git push -u origin main

# Go to vercel.com → New Project → Import your repo
# Settings:
Root Directory: frontend
Framework: Vite

# Environment Variables (add these in Vercel dashboard):
VITE_API_URL=https://enchanted-paws-backend.onrender.com/api
VITE_BOT_USERNAME=YourBotUsername

# Deploy! ✅
```

Copy your Vercel URL: `https://your-app.vercel.app`

## 3️⃣ Deploy Backend to Render (3 min)

```
Go to render.com → New → Web Service
Connect your GitHub repo

Settings:
  Root Directory: backend
  Build: pip install -r requirements.txt
  Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
  Environment: Python 3.11

Environment Variables:
  TELEGRAM_BOT_TOKEN = your_bot_token_from_botfather
  TELEGRAM_BOT_USERNAME = YourBotUsername
  SECRET_KEY = random_string_at_least_32_chars  (auto-generate in Render)
  FRONTEND_URL = https://your-app.vercel.app
  DATABASE_URL = sqlite:///./enchanted_paws.db
  ENVIRONMENT = production
  DEBUG = false

Create Web Service → wait 2-3 min ✅
```

Copy your backend URL: `https://enchanted-paws-backend.onrender.com`

## 4️⃣ Update Frontend API URL (1 min)

Go to Vercel → your project → Settings → Environment Variables
Update `VITE_API_URL` to: `https://your-backend.onrender.com/api`
Redeploy frontend

## 5️⃣ Connect Bot to Mini App (1 min)

```
Back to @BotFather:

/setdomain → your bot → https://your-app.vercel.app
/setmenubutton → your bot →
  Button text: 🌿 Play
  URL: https://your-app.vercel.app
```

## 6️⃣ (Optional) Deploy Bot for Payments

```
render.com → New → Background Worker
Same repo, Root Directory: bot
Build: pip install -r requirements.txt
Start: python bot.py

Environment Variables:
  TELEGRAM_BOT_TOKEN = your_token
  FRONTEND_URL = https://your-app.vercel.app
  BACKEND_URL = https://your-backend.onrender.com
```

## 7️⃣ Play! 🎮

Open Telegram → find your bot → click "🌿 Play"
Game loads → start merging creatures! ✨

---

## Local Development (optional)

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env — leave TELEGRAM_BOT_TOKEN empty for dev mode
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8000/api
npm run dev
# Opens at http://localhost:5173
```

**Bot (optional):**
```bash
cd bot
pip install -r requirements.txt
cp .env.example .env
# Add your bot token
python bot.py
```

---

## Troubleshooting

**Mini App won't load:**
- Check BotFather: `/setdomain` must match your Vercel URL exactly
- Open browser DevTools → Console — check for errors
- Verify backend is running: `curl https://your-backend.onrender.com/api/health`

**Auth error:**
- Make sure `TELEGRAM_BOT_TOKEN` is set correctly in backend
- Check that `SECRET_KEY` is at least 32 characters

**Creatures not showing:**
- Check browser Console for API errors
- Backend logs in Render dashboard might show errors
- Try refreshing the Mini App

**Stars payments not working:**
- Enable Stars in BotFather: `/mybots` → your bot → Payments → enable XTR
- Register webhook: see DEPLOYMENT.md Step 5

---

## What's Next?

✅ Add Groq API key for AI creature names (see DEPLOYMENT.md)
✅ Enable Telegram Stars payments (see DEPLOYMENT.md)
✅ Invite friends with referral codes
✅ Upgrade to PostgreSQL when you have 10k+ users
✅ Add custom creatures in `gameData.ts`

🎉 **Your cozy merge-idle game is LIVE!**
