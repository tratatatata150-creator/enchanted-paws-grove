# 🚀 Инструкции по деплою твоего бота

## Информация о твоем боте:
- **Токен**: `8275381007:AAFglLgFTNPrcJontwKlC2TcMc72bgEmolM`
- **Bot ID**: `8275381007`

⚠️ **ВАЖНО**: Этот токен — секретный! Никогда не публикуй его в открытом виде!

---

## 📋 Пошаговый деплой

### 1. Создай GitHub репозиторий

1. Зайди на https://github.com
2. Нажми **New repository** (зелёная кнопка справа вверху)
3. Название: `enchanted-paws-grove` (или любое другое)
4. Поставь **Private** (чтобы токен не утек)
5. НЕ добавляй README, .gitignore (они уже есть)
6. Нажми **Create repository**
7. **Скопируй URL** репозитория (будет показан на экране)

---

### 2. Залей код на GitHub

Открой Git Bash или PowerShell в папке проекта:

```bash
cd C:\Users\Administrator\enchanted-paws-grove

# Инициализируй git (если еще не сделал)
git init

# Добавь все файлы
git add .

# Сделай коммит
git commit -m "🌿 Enchanted Paws Grove - Initial commit"

# Подключи свой GitHub репозиторий
# ЗАМЕНИ на свой URL!
git remote add origin https://github.com/ТВОЙ_USERNAME/enchanted-paws-grove.git

# Запуш код
git branch -M main
git push -u origin main
```

Код залит! ✅

---

### 3. Деплой Backend на Render

1. Зайди на **https://render.com**
2. Зарегистрируйся через GitHub
3. Нажми **New +** → **Web Service**
4. Подключи свой репозиторий `enchanted-paws-grove`
5. Настройки:
   - **Name**: `enchanted-paws-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

6. **Environment Variables** (нажми Add Environment Variable):
   ```
   TELEGRAM_BOT_TOKEN = 8275381007:AAFglLgFTNPrcJontwKlC2TcMc72bgEmolM
   SECRET_KEY = (нажми Generate — Render сгенерирует случайный ключ)
   FRONTEND_URL = https://твой-проект.vercel.app  (заполнишь после шага 4)
   DATABASE_URL = sqlite:///./enchanted_paws.db
   ENVIRONMENT = production
   DEBUG = false
   ```

7. Нажми **Create Web Service**
8. Подожди 3-5 минут, пока деплоится
9. **Скопируй URL** бэкенда (будет вида `https://enchanted-paws-backend.onrender.com`)

✅ Backend задеплоен!

---

### 4. Деплой Frontend на Vercel

1. Зайди на **https://vercel.com**
2. Зарегистрируйся через GitHub
3. Нажми **Add New...** → **Project**
4. Выбери свой репозиторий `enchanted-paws-grove`
5. Настройки:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. **Environment Variables**:
   ```
   VITE_API_URL = https://enchanted-paws-backend.onrender.com/api
   VITE_BOT_USERNAME = (имя твоего бота, узнай через @BotFather командой /mybots)
   ```

7. Нажми **Deploy**
8. Подожди 2-3 минуты
9. **Скопируй URL** фронтенда (будет вида `https://enchanted-paws-grove.vercel.app`)

✅ Frontend задеплоен!

---

### 5. Обнови переменные

**В Render (backend)**:
- Зайди в Dashboard → твой backend сервис
- Settings → Environment Variables
- Обнови `FRONTEND_URL` на свой Vercel URL
- Нажми **Save Changes** → сервис автоматически перезапустится

---

### 6. Настрой бота через BotFather

Открой Telegram, найди **@BotFather**, отправь команды:

```
/setdomain
→ выбери своего бота
→ введи: https://enchanted-paws-grove.vercel.app

/setmenubutton
→ выбери своего бота
→ Button text: 🌿 Играть
→ URL: https://enchanted-paws-grove.vercel.app

/mybots
→ выбери своего бота
→ Bot Settings → Menu Button → Configure menu button
→ URL: https://enchanted-paws-grove.vercel.app
```

✅ Бот настроен!

---

### 7. Деплой бота (для платежей)

1. В Render: **New +** → **Background Worker**
2. Выбери тот же репозиторий
3. Настройки:
   - **Name**: `enchanted-paws-bot`
   - **Root Directory**: `bot`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python bot.py`

4. **Environment Variables**:
   ```
   TELEGRAM_BOT_TOKEN = 8275381007:AAFglLgFTNPrcJontwKlC2TcMc72bgEmolM
   FRONTEND_URL = https://enchanted-paws-grove.vercel.app
   BACKEND_URL = https://enchanted-paws-backend.onrender.com
   ```

5. Нажми **Create Background Worker**

✅ Бот запущен!

---

### 8. Включи Telegram Stars платежи

1. Открой @BotFather
2. `/mybots` → выбери своего бота → **Payments**
3. Выбери **Telegram Stars (XTR)**
4. Включи платежи

Затем зарегистрируй webhook для платежей:

```bash
curl -X POST "https://api.telegram.org/bot8275381007:AAFglLgFTNPrcJontwKlC2TcMc72bgEmolM/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://enchanted-paws-backend.onrender.com/api/payments/webhook"}'
```

Должен вернуть: `{"ok":true,"result":true}`

✅ Платежи настроены!

---

### 9. ТЕСТ! 🎮

1. Открой Telegram
2. Найди своего бота
3. Нажми кнопку **🌿 Играть** или команду `/start`
4. Игра должна загрузиться!
5. Попробуй слить двух зверьков

**Если что-то не работает:**
- Открой DevTools (F12) в Mini App → Console → пришли скрин ошибок
- Проверь логи в Render Dashboard

---

## 🎉 Готово!

Твоя игра запущена и доступна в Telegram!

**Полезные ссылки:**
- Backend: https://enchanted-paws-backend.onrender.com/api/health
- Frontend: https://твой-проект.vercel.app
- Бот: https://t.me/твой_бот

---

## 🔧 Что дальше?

### Добавить AI имена для зверьков (опционально):
1. Зайди на https://console.groq.com
2. Зарегистрируйся (бесплатно)
3. Создай API ключ
4. В Render → backend → Environment Variables:
   ```
   GROQ_API_KEY = твой_groq_ключ
   ```
5. Теперь зверьки получат AI-генерированные имена при слиянии!

### Перейти на PostgreSQL (когда >10k пользователей):
1. В Render → Create → PostgreSQL
2. Скопируй Database URL
3. В backend Environment Variables:
   ```
   DATABASE_URL = postgresql://user:pass@host/dbname
   ```
4. В `requirements.txt` добавь `psycopg2-binary`
5. Redeploy

---

**Удачи! Если что-то сломается — пиши!** 🌿✨
