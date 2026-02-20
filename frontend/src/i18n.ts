// ─── Translations ─────────────────────────────────────────────────────────────

type Lang = 'en' | 'ru'

const translations = {
  en: {
    // App
    appName: 'Enchanted Paws Grove',
    loading: 'Loading your grove…',
    error: 'Something went wrong. Please restart.',

    // Nav
    nav_grove: 'Grove',
    nav_shop: 'Shop',
    nav_quests: 'Quests',
    nav_collection: 'Bestiary',
    nav_profile: 'Profile',

    // Resources
    res_leaves: 'Magic Leaves',
    res_dew: 'Star Dew',
    res_berries: 'Crystal Berries',
    res_stars: 'Telegram Stars',

    // Grove / Game board
    grove_title: '✨ Your Enchanted Grove',
    grove_slots: 'Merge Slots',
    grove_tap_collect: 'Tap to collect!',
    grove_select_hint: 'Tap a creature to select, then tap another to merge!',
    grove_merge_success: '✨ Merged into {name}!',
    grove_no_empty: 'No empty slots! Merge or remove creatures first.',
    grove_cant_merge: 'Only same creatures can merge!',
    grove_max_level: 'Already at max level!',
    grove_offline_bonus: '🌙 Welcome back! Offline bonus: {leaves} Leaves, {dew} Dew',

    // Shop
    shop_title: '🛍 Enchanted Shop',
    shop_tab_creatures: 'Creatures',
    shop_tab_boosters: 'Boosters',
    shop_tab_premium: 'Premium',
    shop_tab_subscriptions: 'Passes',
    shop_buy: 'Buy',
    shop_buy_stars: 'Buy ({stars} ⭐)',
    shop_not_enough: 'Not enough resources!',
    shop_bought: 'Added to your grove!',
    shop_no_slot: 'No free slot! Merge first.',

    // Quests
    quests_title: '📜 Daily Quests',
    quests_reset: 'Resets in {time}',
    quests_claim: 'Claim!',
    quests_claimed: 'Claimed ✓',
    quests_progress: '{current}/{target}',
    quest_merge_desc: 'Merge {target} creatures',
    quest_collect_desc: 'Collect {target} {resource}',
    quest_collect_type_desc: 'Collect {target} {resource} from {creature}',

    // Collection
    collection_title: '📖 Creature Bestiary',
    collection_discovered: '{count} discovered',
    collection_locked: '???',
    collection_total_merged: 'Merged {count}×',
    collection_first_seen: 'First seen: {date}',

    // Profile
    profile_title: '🌟 Your Profile',
    profile_level: 'Level {level}',
    profile_xp: '{current} / {next} XP',
    profile_merges: 'Total merges: {count}',
    profile_referral_title: '🤝 Invite Friends',
    profile_referral_desc: 'Share your code! Both you and your friend get a free Fluffy Kit!',
    profile_referral_code: 'Your code: {code}',
    profile_referral_share: 'Share Invite',
    profile_referral_count: 'Friends invited: {count}',
    profile_subscription: 'Current pass: {tier}',
    profile_subscription_none: 'No active pass',
    profile_subscription_expires: 'Expires: {date}',

    // Subscription tiers
    sub_none: 'Explorer',
    sub_sprout: 'Sprout',
    sub_grove: 'Grove',
    sub_enchanted: 'Enchanted',

    // Merge feedback
    merge_animation_text: '✨ MERGE! ✨',

    // Confirm dialogs
    confirm_buy: 'Buy {name} for {cost}?',
    confirm_yes: 'Yes!',
    confirm_no: 'Cancel',

    // Errors
    err_auth: 'Authentication failed. Open via Telegram.',
    err_network: 'Network error. Check your connection.',
    err_server: 'Server error. Try again later.',

    // Onboarding
    onboard_welcome: 'Welcome to Enchanted Paws Grove! 🌿',
    onboard_desc: 'Merge cute magical creatures to make them evolve! Tap a creature to select it, then tap another of the same kind to merge them!',
    onboard_start: 'Start Playing! 🐱',

    // Time
    time_hour: '{n}h',
    time_min: '{n}m',
    time_sec: '{n}s',
  },

  ru: {
    // App
    appName: 'Волшебная Роща Пушистиков',
    loading: 'Загружаем твою рощу…',
    error: 'Что-то пошло не так. Перезапусти приложение.',

    // Nav
    nav_grove: 'Роща',
    nav_shop: 'Магазин',
    nav_quests: 'Задания',
    nav_collection: 'Бестиарий',
    nav_profile: 'Профиль',

    // Resources
    res_leaves: 'Волшебные Листья',
    res_dew: 'Звёздная Роса',
    res_berries: 'Хрустальные Ягоды',
    res_stars: 'Telegram Stars',

    // Grove / Game board
    grove_title: '✨ Твоя Волшебная Роща',
    grove_slots: 'Слоты слияния',
    grove_tap_collect: 'Нажми, чтобы собрать!',
    grove_select_hint: 'Выбери зверька, затем нажми на такого же, чтобы слить!',
    grove_merge_success: '✨ Слито! Получил {name}!',
    grove_no_empty: 'Нет свободных слотов! Сначала слей или убери зверьков.',
    grove_cant_merge: 'Сливать можно только одинаковых зверьков!',
    grove_max_level: 'Уже максимальный уровень!',
    grove_offline_bonus: '🌙 С возвращением! Оффлайн-бонус: {leaves} Листьев, {dew} Росы',

    // Shop
    shop_title: '🛍 Волшебный Магазин',
    shop_tab_creatures: 'Зверьки',
    shop_tab_boosters: 'Усилители',
    shop_tab_premium: 'Премиум',
    shop_tab_subscriptions: 'Пропуска',
    shop_buy: 'Купить',
    shop_buy_stars: 'Купить ({stars} ⭐)',
    shop_not_enough: 'Недостаточно ресурсов!',
    shop_bought: 'Добавлено в рощу!',
    shop_no_slot: 'Нет свободного слота! Сначала слей зверьков.',

    // Quests
    quests_title: '📜 Ежедневные задания',
    quests_reset: 'Сбрасываются через {time}',
    quests_claim: 'Забрать!',
    quests_claimed: 'Получено ✓',
    quests_progress: '{current}/{target}',
    quest_merge_desc: 'Слей {target} зверьков',
    quest_collect_desc: 'Собери {target} {resource}',
    quest_collect_type_desc: 'Собери {target} {resource} от {creature}',

    // Collection
    collection_title: '📖 Бестиарий',
    collection_discovered: 'Открыто: {count}',
    collection_locked: '???',
    collection_total_merged: 'Слито {count}×',
    collection_first_seen: 'Впервые встречен: {date}',

    // Profile
    profile_title: '🌟 Твой Профиль',
    profile_level: 'Уровень {level}',
    profile_xp: '{current} / {next} XP',
    profile_merges: 'Всего слияний: {count}',
    profile_referral_title: '🤝 Пригласи друзей',
    profile_referral_desc: 'Поделись кодом! Вы оба получите бесплатного Пушистого Котёнка!',
    profile_referral_code: 'Твой код: {code}',
    profile_referral_share: 'Поделиться',
    profile_referral_count: 'Приглашено друзей: {count}',
    profile_subscription: 'Текущий пропуск: {tier}',
    profile_subscription_none: 'Нет активного пропуска',
    profile_subscription_expires: 'Истекает: {date}',

    // Subscription tiers
    sub_none: 'Исследователь',
    sub_sprout: 'Росточек',
    sub_grove: 'Роща',
    sub_enchanted: 'Волшебный',

    // Merge feedback
    merge_animation_text: '✨ СЛИЯНИЕ! ✨',

    // Confirm dialogs
    confirm_buy: 'Купить {name} за {cost}?',
    confirm_yes: 'Да!',
    confirm_no: 'Отмена',

    // Errors
    err_auth: 'Ошибка авторизации. Открой через Telegram.',
    err_network: 'Ошибка сети. Проверь подключение.',
    err_server: 'Ошибка сервера. Попробуй позже.',

    // Onboarding
    onboard_welcome: 'Добро пожаловать в Волшебную Рощу Пушистиков! 🌿',
    onboard_desc: 'Сливай волшебных зверьков, чтобы они эволюционировали! Нажми на зверька, чтобы выбрать его, затем нажми на такого же, чтобы слить!',
    onboard_start: 'Начать играть! 🐱',

    // Time
    time_hour: '{n}ч',
    time_min: '{n}м',
    time_sec: '{n}с',
  },
} as const

type TranslationKey = keyof typeof translations.en

let currentLang: Lang = 'en'

export function setLang(lang: string) {
  currentLang = lang.startsWith('ru') ? 'ru' : 'en'
}

export function getLang(): Lang {
  return currentLang
}

export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
  const dict = translations[currentLang] as Record<string, string>
  let str = dict[key] ?? (translations.en as Record<string, string>)[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v))
    }
  }
  return str
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return Math.floor(n).toString()
}

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric', month: 'short'
  })
}

export function formatTimeRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return t('time_hour', { n: h }) + ' ' + t('time_min', { n: m })
  if (m > 0) return t('time_min', { n: m }) + ' ' + t('time_sec', { n: s })
  return t('time_sec', { n: s })
}
