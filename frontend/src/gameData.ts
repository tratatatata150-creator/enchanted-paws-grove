import type {
  CreatureFamily,
  CreatureFamilyDef,
  BuildingDef,
  ShopItem,
  SubscriptionDef,
} from './types'

// ─── Creature Families ────────────────────────────────────────────────────────
export const CREATURE_FAMILIES: Record<CreatureFamily, CreatureFamilyDef> = {
  fairy_cat: {
    id: 'fairy_cat',
    levels: [
      { level: 1, nameEn: 'Fluffy Kit',        nameRu: 'Пушистый Котёнок',   emoji: '🐱', color: '#f9d4ff', glowColor: '#e879f9', production: { leaves: 1, dew: 0, berries: 0 }, intervalSec: 30,  unlockCost: { leaves: 0 } },
      { level: 2, nameEn: 'Star Kitten',        nameRu: 'Звёздный Котик',     emoji: '😸', color: '#f0abff', glowColor: '#d946ef', production: { leaves: 3, dew: 0, berries: 0 }, intervalSec: 30 },
      { level: 3, nameEn: 'Cosmic Cat',         nameRu: 'Космический Кот',    emoji: '😻', color: '#c084fc', glowColor: '#a855f7', production: { leaves: 8, dew: 1, berries: 0 }, intervalSec: 30 },
      { level: 4, nameEn: 'Celestial Feline',   nameRu: 'Небесная Кошка',    emoji: '🌸😸', color: '#a855f7', glowColor: '#7c3aed', production: { leaves: 20, dew: 3, berries: 0 }, intervalSec: 30 },
      { level: 5, nameEn: 'Divine Whisker',     nameRu: 'Божественный Мурр', emoji: '🌟😻', color: '#7c3aed', glowColor: '#4c1d95', production: { leaves: 50, dew: 8, berries: 1 }, intervalSec: 30 },
    ],
  },
  baby_dragon: {
    id: 'baby_dragon',
    levels: [
      { level: 1, nameEn: 'Ember Hatchling',   nameRu: 'Огненный Дракончик', emoji: '🐲', color: '#fde68a', glowColor: '#f59e0b', production: { leaves: 0, dew: 1, berries: 0 }, intervalSec: 40,  unlockCost: { leaves: 30 } },
      { level: 2, nameEn: 'Cuddle Drake',       nameRu: 'Обнимашка-Дракон',  emoji: '🐉', color: '#fcd34d', glowColor: '#d97706', production: { leaves: 0, dew: 3, berries: 0 }, intervalSec: 40 },
      { level: 3, nameEn: 'Azure Dragon',       nameRu: 'Лазурный Дракон',   emoji: '💙🐉', color: '#60a5fa', glowColor: '#2563eb', production: { leaves: 2, dew: 7, berries: 0 }, intervalSec: 40 },
      { level: 4, nameEn: 'Storm Wyrm',         nameRu: 'Грозовой Вирм',     emoji: '⚡🐉', color: '#3b82f6', glowColor: '#1d4ed8', production: { leaves: 5, dew: 18, berries: 0 }, intervalSec: 40 },
      { level: 5, nameEn: 'Eternal Dragon',     nameRu: 'Вечный Дракон',     emoji: '🌟🐉', color: '#1d4ed8', glowColor: '#1e3a8a', production: { leaves: 10, dew: 45, berries: 2 }, intervalSec: 40 },
    ],
  },
  mini_unicorn: {
    id: 'mini_unicorn',
    levels: [
      { level: 1, nameEn: 'Sparkle Foal',      nameRu: 'Искристый Жеребёнок', emoji: '🦄', color: '#fbcfe8', glowColor: '#ec4899', production: { leaves: 2, dew: 0, berries: 0 }, intervalSec: 35, unlockCost: { leaves: 20 } },
      { level: 2, nameEn: 'Rainbow Pony',       nameRu: 'Радужный Пони',       emoji: '🌈🦄', color: '#f9a8d4', glowColor: '#db2777', production: { leaves: 5, dew: 1, berries: 0 }, intervalSec: 35 },
      { level: 3, nameEn: 'Crystal Unicorn',    nameRu: 'Хрустальный Единорог',emoji: '💎🦄', color: '#93c5fd', glowColor: '#3b82f6', production: { leaves: 12, dew: 2, berries: 0 }, intervalSec: 35 },
      { level: 4, nameEn: 'Star Unicorn',       nameRu: 'Звёздный Единорог',   emoji: '⭐🦄', color: '#6ee7b7', glowColor: '#10b981', production: { leaves: 30, dew: 5, berries: 0 }, intervalSec: 35 },
      { level: 5, nameEn: 'Prismatic Alicorn',  nameRu: 'Призматический Аликорн', emoji: '🌟🦄', color: '#a7f3d0', glowColor: '#059669', production: { leaves: 70, dew: 12, berries: 2 }, intervalSec: 35 },
    ],
  },
  forest_fox: {
    id: 'forest_fox',
    levels: [
      { level: 1, nameEn: 'Dewdrop Fox',       nameRu: 'Росяная Лисичка',    emoji: '🦊', color: '#fed7aa', glowColor: '#f97316', production: { leaves: 1, dew: 1, berries: 0 }, intervalSec: 45, unlockCost: { leaves: 50, dew: 5 } },
      { level: 2, nameEn: 'Glow Fox',          nameRu: 'Светящаяся Лиса',    emoji: '✨🦊', color: '#fdba74', glowColor: '#ea580c', production: { leaves: 3, dew: 3, berries: 0 }, intervalSec: 45 },
      { level: 3, nameEn: 'Aurora Fox',        nameRu: 'Полярная Лиса',      emoji: '🌠🦊', color: '#fb923c', glowColor: '#c2410c', production: { leaves: 7, dew: 7, berries: 0 }, intervalSec: 45 },
      { level: 4, nameEn: 'Celestial Vixen',   nameRu: 'Небесная Лисица',    emoji: '💫🦊', color: '#ef4444', glowColor: '#b91c1c', production: { leaves: 15, dew: 15, berries: 1 }, intervalSec: 45 },
      { level: 5, nameEn: 'Divine Fox Spirit', nameRu: 'Дух Лисы',           emoji: '🌟🦊', color: '#dc2626', glowColor: '#7f1d1d', production: { leaves: 35, dew: 35, berries: 3 }, intervalSec: 45 },
    ],
  },
  mushroom_sprite: {
    id: 'mushroom_sprite',
    levels: [
      { level: 1, nameEn: 'Spore Sprite',      nameRu: 'Споровый Эльф',      emoji: '🍄', color: '#d1fae5', glowColor: '#10b981', production: { leaves: 3, dew: 0, berries: 0 }, intervalSec: 25, unlockCost: { leaves: 10 } },
      { level: 2, nameEn: 'Bloom Sprite',       nameRu: 'Цветочный Эльф',     emoji: '🌿🍄', color: '#a7f3d0', glowColor: '#059669', production: { leaves: 8, dew: 0, berries: 0 }, intervalSec: 25 },
      { level: 3, nameEn: 'Forest Guardian',    nameRu: 'Лесной Страж',       emoji: '🌸🍄', color: '#6ee7b7', glowColor: '#047857', production: { leaves: 20, dew: 2, berries: 0 }, intervalSec: 25 },
      { level: 4, nameEn: 'Ancient Keeper',     nameRu: 'Древний Хранитель',  emoji: '🌺🍄', color: '#34d399', glowColor: '#065f46', production: { leaves: 50, dew: 5, berries: 0 }, intervalSec: 25 },
      { level: 5, nameEn: 'Elder Spirit',       nameRu: 'Дух Старейшины',     emoji: '🌟🍄', color: '#10b981', glowColor: '#022c22', production: { leaves: 120, dew: 10, berries: 2 }, intervalSec: 25 },
    ],
  },
}

export const FAMILIES_ORDER: CreatureFamily[] = [
  'fairy_cat', 'mushroom_sprite', 'mini_unicorn', 'baby_dragon', 'forest_fox',
]

export function getCreatureDef(family: CreatureFamily, level: number) {
  return CREATURE_FAMILIES[family].levels.find(l => l.level === level)!
}

export const MAX_LEVEL = 5

// ─── Buildings ────────────────────────────────────────────────────────────────
export const BUILDINGS: BuildingDef[] = [
  {
    id: 'cozy_cottage',
    nameEn: 'Cozy Cottage',
    nameRu: 'Уютный Домик',
    emoji: '🏡',
    descEn: '+10% Leaf production from all creatures',
    descRu: '+10% к производству Листьев',
    cost: { leaves: 200 },
    bonus: 'leaves_10pct',
  },
  {
    id: 'mushroom_hut',
    nameEn: 'Mushroom Hut',
    nameRu: 'Грибной Домик',
    emoji: '🍄🏠',
    descEn: '+1 extra resource drop per collection',
    descRu: '+1 бонусный ресурс при сборе',
    cost: { leaves: 150, dew: 20 },
    bonus: 'extra_drop',
  },
  {
    id: 'crystal_tower',
    nameEn: 'Crystal Tower',
    nameRu: 'Хрустальная Башня',
    emoji: '💎🏰',
    descEn: '+15% Star Dew from all creatures',
    descRu: '+15% к производству Звёздной Росы',
    cost: { leaves: 500, dew: 80 },
    bonus: 'dew_15pct',
  },
  {
    id: 'starlight_gazebo',
    nameEn: 'Starlight Gazebo',
    nameRu: 'Беседка Звёздного Света',
    emoji: '✨🌿',
    descEn: 'Offline bonus lasts 50% longer',
    descRu: 'Оффлайн-бонус длится на 50% дольше',
    cost: { leaves: 300, dew: 50, berries: 5 },
    bonus: 'offline_bonus',
  },
  {
    id: 'ancient_tree',
    nameEn: 'Ancient Grove Tree',
    nameRu: 'Древнее Дерево Рощи',
    emoji: '🌳',
    descEn: '+1 merge slot unlocked permanently',
    descRu: '+1 слот для слияния навсегда',
    cost: { leaves: 1000, dew: 200, berries: 20 },
    bonus: 'extra_slot',
  },
]

// ─── Shop Items ───────────────────────────────────────────────────────────────
export const SHOP_ITEMS: ShopItem[] = [
  // Buy creatures with leaves
  {
    id: 'buy_fairy_cat_1',
    category: 'creature',
    nameEn: 'Fluffy Kit',
    nameRu: 'Пушистый Котёнок',
    descEn: 'Start your fairy cat collection!',
    descRu: 'Начни коллекцию волшебных кошек!',
    emoji: '🐱',
    costLeaves: 0,
    creatureFamily: 'fairy_cat',
    creatureLevel: 1,
  },
  {
    id: 'buy_mushroom_1',
    category: 'creature',
    nameEn: 'Spore Sprite',
    nameRu: 'Споровый Эльф',
    descEn: 'Great leaf producer!',
    descRu: 'Отличный производитель листьев!',
    emoji: '🍄',
    costLeaves: 10,
    creatureFamily: 'mushroom_sprite',
    creatureLevel: 1,
  },
  {
    id: 'buy_unicorn_1',
    category: 'creature',
    nameEn: 'Sparkle Foal',
    nameRu: 'Искристый Жеребёнок',
    descEn: 'A magical little unicorn!',
    descRu: 'Волшебный единорожек!',
    emoji: '🦄',
    costLeaves: 20,
    creatureFamily: 'mini_unicorn',
    creatureLevel: 1,
  },
  {
    id: 'buy_dragon_1',
    category: 'creature',
    nameEn: 'Ember Hatchling',
    nameRu: 'Огненный Дракончик',
    descEn: 'Produces Star Dew!',
    descRu: 'Производит Звёздную Росу!',
    emoji: '🐲',
    costLeaves: 30,
    creatureFamily: 'baby_dragon',
    creatureLevel: 1,
  },
  {
    id: 'buy_fox_1',
    category: 'creature',
    nameEn: 'Dewdrop Fox',
    nameRu: 'Росяная Лисичка',
    descEn: 'Balanced resource producer!',
    descRu: 'Сбалансированный производитель!',
    emoji: '🦊',
    costLeaves: 50,
    costDew: 5,
    creatureFamily: 'forest_fox',
    creatureLevel: 1,
  },
  // Boosters
  {
    id: 'boost_2x_60',
    category: 'booster',
    nameEn: '2× Production (1hr)',
    nameRu: '2× Производство (1 час)',
    descEn: 'Double all resource production for 1 hour',
    descRu: 'Удвой производство ресурсов на 1 час',
    emoji: '⚡',
    costDew: 50,
  },
  // Star-based items
  {
    id: 'extra_slots_5',
    category: 'slot',
    nameEn: '+5 Merge Slots',
    nameRu: '+5 Слотов для Слияния',
    descEn: 'Permanently unlock 5 more merge slots',
    descRu: 'Разблокируй 5 дополнительных слотов навсегда',
    emoji: '🔓',
    costStars: 50,
    slotCount: 5,
  },
  {
    id: 'no_ads',
    category: 'cosmetic',
    nameEn: 'No Ads Forever',
    nameRu: 'Без Рекламы Навсегда',
    descEn: 'Remove all ads permanently',
    descRu: 'Убери всю рекламу навсегда',
    emoji: '🚫📺',
    costStars: 75,
  },
  {
    id: 'cosmetic_pack_moon',
    category: 'cosmetic',
    nameEn: 'Moon Grove Theme',
    nameRu: 'Тема Лунной Рощи',
    descEn: 'Beautiful moonlit forest theme!',
    descRu: 'Красивая тема лунного леса!',
    emoji: '🌙',
    costStars: 100,
  },
]

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const SUBSCRIPTIONS: SubscriptionDef[] = [
  {
    id: 'sprout',
    nameEn: '🌱 Sprout Pass',
    nameRu: '🌱 Пропуск Росточка',
    emoji: '🌱',
    priceStars: 150,
    benefits: ['+20% all resources', 'Daily bonus creature', 'Exclusive sprout badge'],
    benefitsRu: ['+20% всех ресурсов', 'Ежедневный бонусный зверёк', 'Эксклюзивный значок ростка'],
  },
  {
    id: 'grove',
    nameEn: '🌳 Grove Pass',
    nameRu: '🌳 Пропуск Рощи',
    emoji: '🌳',
    priceStars: 300,
    benefits: ['+50% all resources', 'Daily 2 bonus creatures', 'Extra 5 merge slots', 'Exclusive grove badge'],
    benefitsRu: ['+50% всех ресурсов', 'Ежедневно 2 бонусных зверька', '+5 слотов для слияния', 'Значок рощи'],
  },
  {
    id: 'enchanted',
    nameEn: '✨ Enchanted Pass',
    nameRu: '✨ Волшебный Пропуск',
    emoji: '✨',
    priceStars: 500,
    benefits: ['+100% all resources', 'Daily 5 bonus creatures', 'Extra 10 merge slots', 'No ads included', 'Exclusive enchanted badge'],
    benefitsRu: ['+100% всех ресурсов', 'Ежедневно 5 зверьков', '+10 слотов', 'Без рекламы', 'Волшебный значок'],
  },
]

// ─── Quest templates ──────────────────────────────────────────────────────────
export const QUEST_TEMPLATES = [
  { type: 'merge',        targetAmount: 3,   rewardLeaves: 50,   rewardDew: 5,   rewardBerries: 0 },
  { type: 'merge',        targetAmount: 5,   rewardLeaves: 80,   rewardDew: 8,   rewardBerries: 0 },
  { type: 'merge',        targetAmount: 10,  rewardLeaves: 150,  rewardDew: 15,  rewardBerries: 1 },
  { type: 'collect',      targetAmount: 100, rewardLeaves: 100,  rewardDew: 10,  rewardBerries: 0, targetResource: 'leaves' as const },
  { type: 'collect',      targetAmount: 50,  rewardLeaves: 0,    rewardDew: 50,  rewardBerries: 0, targetResource: 'dew' as const },
  { type: 'collect_type', targetAmount: 30,  rewardLeaves: 120,  rewardDew: 12,  rewardBerries: 0, targetResource: 'leaves' as const, targetFamily: 'fairy_cat' as const },
  { type: 'collect_type', targetAmount: 20,  rewardLeaves: 0,    rewardDew: 30,  rewardBerries: 0, targetResource: 'dew' as const,   targetFamily: 'baby_dragon' as const },
] as const

// ─── Level/XP system ─────────────────────────────────────────────────────────
export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.4, level - 1))
}

export function xpForMerge(resultLevel: number): number {
  return resultLevel * 10
}

// ─── Offline catch-up bonus cap ───────────────────────────────────────────────
// Max 8 hours of production saved offline
export const MAX_OFFLINE_HOURS = 8
