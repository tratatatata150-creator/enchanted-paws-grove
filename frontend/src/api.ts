import type { GameState, ApiResponse, Quest, ShopItem } from './types'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

let _initData = ''

export function setInitData(initData: string) {
  _initData = initData
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': _initData,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
      return { ok: false, error: err.detail ?? 'Server error' }
    }
    const data = await res.json()
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: 'Network error' }
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  telegramId: number
  username: string
  firstName: string
  languageCode: string
  photoUrl?: string
  gameState: GameState
  isNewUser: boolean
  referralCode: string
}

export async function authTelegram(startParam?: string): Promise<ApiResponse<AuthResponse>> {
  return request('POST', '/auth/telegram', { start_param: startParam })
}

// ─── Game State ───────────────────────────────────────────────────────────────
export async function fetchGameState(): Promise<ApiResponse<GameState>> {
  return request('GET', '/game/state')
}

export async function saveGameState(state: GameState): Promise<ApiResponse<{ saved: true }>> {
  return request('POST', '/game/save', { state })
}

// ─── Actions (server-side validation) ────────────────────────────────────────
export interface MergeResult {
  newCreatureId: string
  newLevel: number
  xpGained: number
  aiName?: string
  questProgress?: Partial<Record<string, number>>
}

export async function doMerge(
  fromId: string,
  toId: string
): Promise<ApiResponse<MergeResult>> {
  return request('POST', '/game/merge', { from_id: fromId, to_id: toId })
}

export interface CollectResult {
  resources: { leaves: number; dew: number; berries: number }
  questProgress?: Partial<Record<string, number>>
}

export async function doCollect(creatureId: string): Promise<ApiResponse<CollectResult>> {
  return request('POST', '/game/collect', { creature_id: creatureId })
}

// ─── Shop ─────────────────────────────────────────────────────────────────────
export async function fetchShopItems(): Promise<ApiResponse<ShopItem[]>> {
  return request('GET', '/shop/items')
}

export interface BuyResult {
  success: boolean
  newCreatureId?: string
  newSlots?: number
  message: string
}

export async function buyItem(itemId: string): Promise<ApiResponse<BuyResult>> {
  return request('POST', '/shop/buy', { item_id: itemId })
}

// ─── Quests ───────────────────────────────────────────────────────────────────
export async function fetchDailyQuests(): Promise<ApiResponse<Quest[]>> {
  return request('GET', '/quests/daily')
}

export async function claimQuest(questId: string): Promise<ApiResponse<{ rewards: { leaves: number; dew: number; berries: number } }>> {
  return request('POST', '/quests/claim', { quest_id: questId })
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export interface InvoiceResponse {
  invoiceUrl: string
}

export async function createStarsInvoice(
  itemId: string,
  title: string,
  description: string,
  amount: number
): Promise<ApiResponse<InvoiceResponse>> {
  return request('POST', '/payments/create-invoice', {
    item_id: itemId,
    title,
    description,
    amount,
  })
}

export async function verifyPayment(chargeId: string, itemId: string): Promise<ApiResponse<{ applied: true }>> {
  return request('POST', '/payments/verify', { charge_id: chargeId, item_id: itemId })
}

// ─── Referral ─────────────────────────────────────────────────────────────────
export async function applyReferral(code: string): Promise<ApiResponse<{ reward: { leaves: number } }>> {
  return request('POST', '/referral/apply', { code })
}

export async function generateShareLink(referralCode: string): Promise<string> {
  const botUsername = import.meta.env.VITE_BOT_USERNAME || 'EnchantedPawsBot'
  return `https://t.me/${botUsername}?start=${referralCode}`
}
