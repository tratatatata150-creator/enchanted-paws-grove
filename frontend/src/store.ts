import { create } from 'zustand'
import type {
  GameState,
  GridCreature,
  Resources,
  CreatureFamily,
  CollectionEntry,
  Quest,
  Screen,
  UserProfile,
} from './types'
import {
  getCreatureDef,
  MAX_LEVEL,
  getXpForLevel,
  xpForMerge,
  MAX_OFFLINE_HOURS,
  CREATURE_FAMILIES,
} from './gameData'
import * as api from './api'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeId(): string {
  // Simple UUID without external dep
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  }) + '-' + Date.now().toString(36)
}

function emptyResources(): Resources {
  return { leaves: 0, dew: 0, berries: 0 }
}

function addResources(a: Resources, b: Resources): Resources {
  return { leaves: a.leaves + b.leaves, dew: a.dew + b.dew, berries: a.berries + b.berries }
}

function subtractResources(a: Resources, b: Partial<Resources>): Resources {
  return {
    leaves: a.leaves - (b.leaves ?? 0),
    dew: a.dew - (b.dew ?? 0),
    berries: a.berries - (b.berries ?? 0),
  }
}

function canAfford(resources: Resources, cost: Partial<Resources>): boolean {
  return (
    resources.leaves >= (cost.leaves ?? 0) &&
    resources.dew >= (cost.dew ?? 0) &&
    resources.berries >= (cost.berries ?? 0)
  )
}

function newCreature(family: CreatureFamily, level = 1): GridCreature {
  return {
    id: makeId(),
    family,
    level,
    lastCollected: Date.now(),
    pendingResources: emptyResources(),
    isCollecting: false,
  }
}

function defaultGameState(): GameState {
  const grid: (GridCreature | null)[] = Array(40).fill(null)
  // Give starter creatures
  grid[0] = newCreature('fairy_cat', 1)
  grid[1] = newCreature('fairy_cat', 1)
  grid[2] = newCreature('mushroom_sprite', 1)

  return {
    grid,
    unlockedSlots: 15,
    resources: { leaves: 10, dew: 0, berries: 0 },
    level: 1,
    experience: 0,
    lastOnline: Date.now(),
    catchupBonus: emptyResources(),
    discoveredCreatures: [
      { family: 'fairy_cat', level: 1, discoveredAt: Date.now(), totalMerged: 0 },
      { family: 'mushroom_sprite', level: 1, discoveredAt: Date.now(), totalMerged: 0 },
    ],
    buildings: [],
    dailyQuests: [],
    questLastReset: 0,
    totalMerges: 0,
    referralCode: '',
    referralCount: 0,
    subscription: 'none',
    noAds: false,
  }
}

// ─── Store Interface ──────────────────────────────────────────────────────────
interface AppStore {
  // Auth
  profile: UserProfile | null
  isLoading: boolean
  loadError: string | null
  isNewUser: boolean

  // UI
  activeScreen: Screen
  selectedCell: number | null
  mergeAnimating: boolean
  toastMessage: string | null
  showOnboarding: boolean

  // Game state (derived from profile.gameState but kept in sync)
  gameState: GameState

  // Actions
  initialize: (initData: string, startParam?: string) => Promise<void>
  selectCell: (index: number) => void
  clearSelection: () => void
  collectCreature: (index: number) => void
  buyCreature: (family: CreatureFamily, level: number, cost: Partial<Resources>) => void
  buyStarsItem: (itemId: string, priceStars: number, title: string, desc: string) => void
  claimQuest: (questId: string) => void
  setScreen: (screen: Screen) => void
  setToast: (msg: string | null) => void
  dismissOnboarding: () => void
  tickProduction: () => void
  applyOfflineBonus: () => void
  completeOnboardingAndStart: () => void
}

// Save to backend debounced
let saveTimer: ReturnType<typeof setTimeout> | null = null
function scheduleSave(state: GameState) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    api.saveGameState(state).catch(() => {})
  }, 3000)
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create<AppStore>((set, get) => ({
  profile: null,
  isLoading: true,
  loadError: null,
  isNewUser: false,
  activeScreen: 'grove',
  selectedCell: null,
  mergeAnimating: false,
  toastMessage: null,
  showOnboarding: false,
  gameState: defaultGameState(),

  // ─── initialize ─────────────────────────────────────────────────────────────
  initialize: async (initData: string, startParam?: string) => {
    api.setInitData(initData)
    set({ isLoading: true, loadError: null })

    const res = await api.authTelegram(startParam)
    if (!res.ok || !res.data) {
      set({ isLoading: false, loadError: res.error ?? 'Auth failed' })
      return
    }

    const { gameState, isNewUser, referralCode, ...profileData } = res.data
    const fullState: GameState = { ...gameState, referralCode }

    // Restore grid creatures (they come serialised from backend)
    const restoredGrid = fullState.grid.map(cell =>
      cell ? { ...cell, isCollecting: false, pendingResources: emptyResources() } : null
    )
    fullState.grid = restoredGrid

    // Calculate offline bonus
    const now = Date.now()
    const offlineMs = Math.min(now - fullState.lastOnline, MAX_OFFLINE_HOURS * 3600 * 1000)
    if (offlineMs > 30_000 && !isNewUser) {
      const bonus = calcOfflineBonus(fullState, offlineMs)
      fullState.catchupBonus = bonus
      fullState.resources = addResources(fullState.resources, bonus)
    }
    fullState.lastOnline = now

    const profile: UserProfile = {
      ...profileData,
      gameState: fullState,
    }

    set({
      profile,
      gameState: fullState,
      isLoading: false,
      isNewUser,
      showOnboarding: isNewUser,
    })
  },

  // ─── selectCell ─────────────────────────────────────────────────────────────
  selectCell: (index: number) => {
    const { selectedCell, gameState } = get()
    const grid = gameState.grid
    const target = grid[index]

    if (index >= gameState.unlockedSlots) return

    // Nothing selected yet
    if (selectedCell === null) {
      if (!target) return
      set({ selectedCell: index })
      return
    }

    // Clicking same cell → deselect
    if (selectedCell === index) {
      set({ selectedCell: null })
      return
    }

    const source = grid[selectedCell]

    // Source was removed somehow
    if (!source) {
      set({ selectedCell: target ? index : null })
      return
    }

    // Target is empty → move creature
    if (!target) {
      const newGrid = [...grid]
      newGrid[index] = source
      newGrid[selectedCell] = null
      set({ selectedCell: null, gameState: { ...gameState, grid: newGrid } })
      scheduleSave({ ...gameState, grid: newGrid })
      return
    }

    // Both occupied — try merge
    if (source.family === target.family && source.level === target.level) {
      if (source.level >= MAX_LEVEL) {
        get().setToast(source.level >= MAX_LEVEL ? '✨ Already max level!' : '')
        set({ selectedCell: null })
        return
      }
      // Perform merge
      const newLevel = source.level + 1
      const merged = newCreature(source.family, newLevel)
      const newGrid = [...grid]
      newGrid[index] = merged
      newGrid[selectedCell] = null

      // XP
      const xp = xpForMerge(newLevel)
      let { experience, level } = gameState
      experience += xp
      while (experience >= getXpForLevel(level + 1)) {
        experience -= getXpForLevel(level + 1)
        level += 1
      }

      // Collection
      const disc = [...gameState.discoveredCreatures]
      const existing = disc.find(d => d.family === source.family && d.level === newLevel)
      if (!existing) {
        disc.push({ family: source.family, level: newLevel, discoveredAt: Date.now(), totalMerged: 1 })
      } else {
        existing.totalMerged += 1
      }

      // Quest progress (merges)
      const quests = updateQuestProgress(gameState.dailyQuests, 'merge', 1)

      const newState: GameState = {
        ...gameState,
        grid: newGrid,
        experience,
        level,
        totalMerges: gameState.totalMerges + 1,
        discoveredCreatures: disc,
        dailyQuests: quests,
      }

      const def = getCreatureDef(source.family, newLevel)
      get().setToast(`✨ ${def.nameEn} appeared!`)

      set({ selectedCell: null, mergeAnimating: true, gameState: newState })
      setTimeout(() => set({ mergeAnimating: false }), 800)
      scheduleSave(newState)
    } else {
      // Different types — swap
      const newGrid = [...grid]
      newGrid[index] = source
      newGrid[selectedCell] = target
      set({ selectedCell: null, gameState: { ...gameState, grid: newGrid } })
      scheduleSave({ ...gameState, grid: newGrid })
    }
  },

  clearSelection: () => set({ selectedCell: null }),

  // ─── collectCreature ────────────────────────────────────────────────────────
  collectCreature: (index: number) => {
    const { gameState } = get()
    const creature = gameState.grid[index]
    if (!creature) return

    const def = getCreatureDef(creature.family, creature.level)
    const now = Date.now()
    const elapsedSec = (now - creature.lastCollected) / 1000
    const ticks = Math.floor(elapsedSec / def.intervalSec)
    if (ticks === 0) return

    const earned: Resources = {
      leaves: def.production.leaves * ticks,
      dew: def.production.dew * ticks,
      berries: def.production.berries * ticks,
    }

    // Subscription multiplier
    const mult = subscriptionMultiplier(gameState.subscription)
    earned.leaves = Math.floor(earned.leaves * mult)
    earned.dew = Math.floor(earned.dew * mult)
    earned.berries = Math.floor(earned.berries * mult)

    const newResources = addResources(gameState.resources, earned)

    // Update creature
    const newGrid = [...gameState.grid]
    newGrid[index] = { ...creature, lastCollected: now }

    // Quest progress
    const quests = updateQuestProgress(gameState.dailyQuests, 'collect', earned.leaves + earned.dew, creature.family, earned)

    const newState: GameState = {
      ...gameState,
      grid: newGrid,
      resources: newResources,
      dailyQuests: quests,
    }

    set({ gameState: newState })
    scheduleSave(newState)
  },

  // ─── buyCreature ────────────────────────────────────────────────────────────
  buyCreature: (family: CreatureFamily, level: number, cost: Partial<Resources>) => {
    const { gameState } = get()
    if (!canAfford(gameState.resources, cost)) {
      get().setToast('Not enough resources!')
      return
    }

    // Find empty slot
    const emptySlot = gameState.grid.findIndex(
      (c, i) => c === null && i < gameState.unlockedSlots
    )
    if (emptySlot === -1) {
      get().setToast('No free slot! Merge first.')
      return
    }

    const creature = newCreature(family, level)
    const newGrid = [...gameState.grid]
    newGrid[emptySlot] = creature

    const newResources = subtractResources(gameState.resources, cost)

    // Collection
    const disc = [...gameState.discoveredCreatures]
    if (!disc.find(d => d.family === family && d.level === level)) {
      disc.push({ family, level, discoveredAt: Date.now(), totalMerged: 0 })
    }

    const newState: GameState = {
      ...gameState,
      grid: newGrid,
      resources: newResources,
      discoveredCreatures: disc,
    }

    set({ gameState: newState })
    get().setToast('Added to your grove! 🌿')
    scheduleSave(newState)
  },

  // ─── buyStarsItem ────────────────────────────────────────────────────────────
  buyStarsItem: async (itemId: string, priceStars: number, title: string, desc: string) => {
    const res = await api.createStarsInvoice(itemId, title, desc, priceStars)
    if (!res.ok || !res.data) {
      get().setToast('Payment error. Try again.')
      return
    }
    const twa = window.Telegram?.WebApp
    if (twa) {
      twa.openInvoice(res.data.invoiceUrl, async (status) => {
        if (status === 'paid') {
          const verify = await api.verifyPayment(itemId, itemId)
          if (verify.ok) {
            get().setToast('Purchase successful! ✨')
            // Refresh game state
            const stateRes = await api.fetchGameState()
            if (stateRes.ok && stateRes.data) {
              set({ gameState: stateRes.data })
            }
          }
        }
      })
    }
  },

  // ─── claimQuest ─────────────────────────────────────────────────────────────
  claimQuest: async (questId: string) => {
    const { gameState } = get()
    const quest = gameState.dailyQuests.find(q => q.id === questId)
    if (!quest || !quest.completed || quest.claimedAt) return

    const res = await api.claimQuest(questId)
    if (!res.ok) return

    const reward = res.data?.rewards ?? { leaves: quest.rewardLeaves, dew: quest.rewardDew, berries: quest.rewardBerries }
    const newResources = addResources(gameState.resources, {
      leaves: reward.leaves,
      dew: reward.dew,
      berries: reward.berries,
    })

    const newQuests = gameState.dailyQuests.map(q =>
      q.id === questId ? { ...q, claimedAt: Date.now() } : q
    )

    const newState: GameState = { ...gameState, resources: newResources, dailyQuests: newQuests }
    set({ gameState: newState })
    get().setToast(`+${reward.leaves} 🍃 +${reward.dew} 💧`)
    scheduleSave(newState)
  },

  setScreen: (screen: Screen) => set({ activeScreen: screen, selectedCell: null }),
  setToast: (msg: string | null) => {
    set({ toastMessage: msg })
    if (msg) setTimeout(() => set({ toastMessage: null }), 2500)
  },
  dismissOnboarding: () => set({ showOnboarding: false }),
  completeOnboardingAndStart: () => set({ showOnboarding: false }),

  // ─── tickProduction ─────────────────────────────────────────────────────────
  tickProduction: () => {
    const { gameState } = get()
    const now = Date.now()
    const newGrid = gameState.grid.map(creature => {
      if (!creature) return null
      const def = getCreatureDef(creature.family, creature.level)
      const elapsedSec = (now - creature.lastCollected) / 1000
      const ticks = Math.floor(elapsedSec / def.intervalSec)
      if (ticks === 0) return creature
      // Mark as ready to collect (glow)
      return { ...creature, isCollecting: true }
    })

    set({ gameState: { ...gameState, grid: newGrid } })
  },

  applyOfflineBonus: () => {
    const { gameState } = get()
    if (
      gameState.catchupBonus.leaves === 0 &&
      gameState.catchupBonus.dew === 0 &&
      gameState.catchupBonus.berries === 0
    ) return
    set({
      gameState: {
        ...gameState,
        catchupBonus: emptyResources(),
      },
    })
  },
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcOfflineBonus(state: GameState, offlineMs: number): Resources {
  const offlineSec = offlineMs / 1000
  const mult = subscriptionMultiplier(state.subscription)
  let leaves = 0, dew = 0, berries = 0

  for (const creature of state.grid) {
    if (!creature) continue
    const def = getCreatureDef(creature.family, creature.level)
    const ticks = Math.floor(offlineSec / def.intervalSec)
    leaves += def.production.leaves * ticks
    dew += def.production.dew * ticks
    berries += def.production.berries * ticks
  }

  return {
    leaves: Math.floor(leaves * mult),
    dew: Math.floor(dew * mult),
    berries: Math.floor(berries * mult),
  }
}

function subscriptionMultiplier(tier: string): number {
  if (tier === 'enchanted') return 2.0
  if (tier === 'grove') return 1.5
  if (tier === 'sprout') return 1.2
  return 1.0
}

function updateQuestProgress(
  quests: Quest[],
  type: string,
  amount: number,
  family?: CreatureFamily,
  resources?: Resources
): Quest[] {
  return quests.map(q => {
    if (q.completed || q.claimedAt) return q
    if (q.type === 'merge' && type === 'merge') {
      const current = Math.min(q.currentAmount + amount, q.targetAmount)
      return { ...q, currentAmount: current, completed: current >= q.targetAmount }
    }
    if (q.type === 'collect' && type === 'collect' && resources) {
      const earned = q.targetResource === 'leaves' ? (resources.leaves ?? 0)
        : q.targetResource === 'dew' ? (resources.dew ?? 0)
        : (resources.berries ?? 0)
      const current = Math.min(q.currentAmount + earned, q.targetAmount)
      return { ...q, currentAmount: current, completed: current >= q.targetAmount }
    }
    if (q.type === 'collect_type' && type === 'collect' && resources && family === q.targetFamily) {
      const earned = q.targetResource === 'leaves' ? (resources.leaves ?? 0)
        : q.targetResource === 'dew' ? (resources.dew ?? 0)
        : (resources.berries ?? 0)
      const current = Math.min(q.currentAmount + earned, q.targetAmount)
      return { ...q, currentAmount: current, completed: current >= q.targetAmount }
    }
    return q
  })
}
