// ─── Telegram WebApp types ───────────────────────────────────────────────────
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    auth_date: number
    hash: string
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  ready: () => void
  expand: () => void
  close: () => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback: (ok: boolean) => void) => void
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  openInvoice: (url: string, callback?: (status: string) => void) => void
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
  }
}

// ─── Game data types ──────────────────────────────────────────────────────────
export type ResourceKey = 'leaves' | 'dew' | 'berries'
export type CreatureFamily = 'fairy_cat' | 'baby_dragon' | 'mini_unicorn' | 'forest_fox' | 'mushroom_sprite'
export type SubscriptionTier = 'none' | 'sprout' | 'grove' | 'enchanted'

export interface Resources {
  leaves: number
  dew: number
  berries: number
}

export interface CreatureLevelDef {
  level: number
  nameEn: string
  nameRu: string
  emoji: string
  color: string
  glowColor: string
  production: Resources
  intervalSec: number   // produce every N seconds
  unlockCost?: Partial<Resources>
}

export interface CreatureFamilyDef {
  id: CreatureFamily
  levels: CreatureLevelDef[]
}

export interface GridCreature {
  id: string            // uuid
  family: CreatureFamily
  level: number
  lastCollected: number // unix timestamp ms
  pendingResources: Resources
  isCollecting: boolean
}

export interface BuildingDef {
  id: string
  nameEn: string
  nameRu: string
  emoji: string
  descEn: string
  descRu: string
  cost: Partial<Resources>
  bonus: string
}

export interface OwnedBuilding {
  id: string
  defId: string
  placedAt: number
}

export interface Quest {
  id: string
  type: 'merge' | 'collect' | 'login' | 'collect_type'
  targetFamily?: CreatureFamily
  targetResource?: ResourceKey
  targetAmount: number
  currentAmount: number
  rewardLeaves: number
  rewardDew: number
  rewardBerries: number
  rewardCreatureFamily?: CreatureFamily
  completed: boolean
  claimedAt?: number
}

export interface CollectionEntry {
  family: CreatureFamily
  level: number
  discoveredAt: number
  totalMerged: number
}

export interface ShopItem {
  id: string
  category: 'creature' | 'slot' | 'cosmetic' | 'booster'
  nameEn: string
  nameRu: string
  descEn: string
  descRu: string
  emoji: string
  costLeaves?: number
  costDew?: number
  costBerries?: number
  costStars?: number
  creatureFamily?: CreatureFamily
  creatureLevel?: number
  slotCount?: number
}

export interface SubscriptionDef {
  id: SubscriptionTier
  nameEn: string
  nameRu: string
  emoji: string
  priceStars: number
  benefits: string[]
  benefitsRu: string[]
}

export interface GameState {
  // Core
  grid: (GridCreature | null)[]      // 40 slots
  unlockedSlots: number              // default 15
  resources: Resources
  // Meta
  level: number
  experience: number
  // Timestamps
  lastOnline: number                 // ms timestamp
  catchupBonus: Resources
  // Progress
  discoveredCreatures: CollectionEntry[]
  buildings: OwnedBuilding[]
  // Quests
  dailyQuests: Quest[]
  questLastReset: number
  totalMerges: number
  // Social
  referralCode: string
  referredBy?: number
  referralCount: number
  // Monetization
  subscription: SubscriptionTier
  subscriptionExpires?: number
  noAds: boolean
}

export interface UserProfile {
  telegramId: number
  username: string
  firstName: string
  languageCode: string
  photoUrl?: string
  createdAt: number
  lastSeen: number
  gameState: GameState
}

export interface ApiResponse<T> {
  ok: boolean
  data?: T
  error?: string
}

// ─── UI types ─────────────────────────────────────────────────────────────────
export type Screen = 'grove' | 'shop' | 'quests' | 'collection' | 'profile'

export interface MergeAnimation {
  fromIndex: number
  toIndex: number
  family: CreatureFamily
  level: number
}
