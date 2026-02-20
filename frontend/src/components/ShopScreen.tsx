import { useState } from 'react'
import { useStore } from '../store'
import { t, formatNumber, getLang } from '../i18n'
import { SHOP_ITEMS, SUBSCRIPTIONS, BUILDINGS } from '../gameData'
import { createStarsInvoice } from '../api'
import type { ShopItem } from '../types'

type Tab = 'creatures' | 'buildings' | 'boosters' | 'subscriptions'

export default function ShopScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('creatures')
  const { gameState, buyCreature, buyStarsItem, setToast } = useStore(s => ({
    gameState: s.gameState,
    buyCreature: s.buyCreature,
    buyStarsItem: s.buyStarsItem,
    setToast: s.setToast,
  }))

  const tabs: { id: Tab; label: string }[] = [
    { id: 'creatures',     label: t('shop_tab_creatures')     },
    { id: 'buildings',     label: '🏡 ' + (getLang() === 'ru' ? 'Здания' : 'Buildings') },
    { id: 'boosters',      label: t('shop_tab_boosters')      },
    { id: 'subscriptions', label: t('shop_tab_subscriptions') },
  ]

  function handleBuyItem(item: ShopItem) {
    if (item.costStars) {
      buyStarsItem(item.id, item.costStars, item.nameEn, item.descEn)
      return
    }
    if (item.category === 'creature' && item.creatureFamily) {
      const cost = {
        leaves: item.costLeaves ?? 0,
        dew: item.costDew ?? 0,
        berries: item.costBerries ?? 0,
      }
      buyCreature(item.creatureFamily, item.creatureLevel ?? 1, cost)
    }
  }

  function handleBuyBuilding(building: typeof BUILDINGS[0]) {
    const canAfford =
      gameState.resources.leaves >= (building.cost.leaves ?? 0) &&
      gameState.resources.dew >= (building.cost.dew ?? 0) &&
      gameState.resources.berries >= (building.cost.berries ?? 0)

    if (!canAfford) {
      setToast(t('shop_not_enough'))
      return
    }
    // Buildings are handled the same as items but stored differently
    // For now, show purchased feedback (full implementation via backend)
    setToast(getLang() === 'ru' ? 'Здание построено! 🏡' : 'Building constructed! 🏡')
  }

  const creatureItems = SHOP_ITEMS.filter(i => i.category === 'creature')
  const boosterItems = SHOP_ITEMS.filter(i => i.category === 'booster' || i.category === 'slot' || i.category === 'cosmetic')

  return (
    <div className="screen-container">
      <h2 className="screen-title">{t('shop_title')}</h2>

      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="shop-grid">
        {activeTab === 'creatures' && creatureItems.map(item => (
          <ShopCard
            key={item.id}
            emoji={item.emoji}
            name={getLang() === 'ru' ? item.nameRu : item.nameEn}
            desc={getLang() === 'ru' ? item.descRu : item.descEn}
            costLabel={formatCost(item)}
            onBuy={() => handleBuyItem(item)}
            canAfford={checkCanAfford(gameState.resources, item)}
          />
        ))}

        {activeTab === 'buildings' && BUILDINGS.map(b => (
          <ShopCard
            key={b.id}
            emoji={b.emoji}
            name={getLang() === 'ru' ? b.nameRu : b.nameEn}
            desc={getLang() === 'ru' ? b.descRu : b.descEn}
            costLabel={formatBuildingCost(b.cost)}
            onBuy={() => handleBuyBuilding(b)}
            canAfford={
              gameState.resources.leaves >= (b.cost.leaves ?? 0) &&
              gameState.resources.dew >= (b.cost.dew ?? 0) &&
              gameState.resources.berries >= (b.cost.berries ?? 0)
            }
          />
        ))}

        {activeTab === 'boosters' && boosterItems.map(item => (
          <ShopCard
            key={item.id}
            emoji={item.emoji}
            name={getLang() === 'ru' ? item.nameRu : item.nameEn}
            desc={getLang() === 'ru' ? item.descRu : item.descEn}
            costLabel={item.costStars ? `${item.costStars} ⭐` : formatCost(item)}
            onBuy={() => handleBuyItem(item)}
            canAfford={checkCanAfford(gameState.resources, item)}
            isStars={!!item.costStars}
          />
        ))}

        {activeTab === 'subscriptions' && SUBSCRIPTIONS.map(sub => (
          <div key={sub.id} className="subscription-card">
            <div className="sub-header">
              <span className="sub-emoji">{sub.emoji}</span>
              <div>
                <div className="sub-name">{getLang() === 'ru' ? sub.nameRu : sub.nameEn}</div>
                <div className="sub-price">{sub.priceStars} ⭐ / month</div>
              </div>
            </div>
            <ul className="sub-benefits">
              {(getLang() === 'ru' ? sub.benefitsRu : sub.benefits).map((b, i) => (
                <li key={i}>✓ {b}</li>
              ))}
            </ul>
            <button
              className="btn btn--stars"
              onClick={() => buyStarsItem(sub.id, sub.priceStars,
                getLang() === 'ru' ? sub.nameRu : sub.nameEn,
                (getLang() === 'ru' ? sub.benefitsRu : sub.benefits).join(', ')
              )}
            >
              {t('shop_buy_stars', { stars: sub.priceStars })}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
interface ShopCardProps {
  emoji: string
  name: string
  desc: string
  costLabel: string
  onBuy: () => void
  canAfford: boolean
  isStars?: boolean
}

function ShopCard({ emoji, name, desc, costLabel, onBuy, canAfford, isStars }: ShopCardProps) {
  return (
    <div className={`shop-card ${!canAfford ? 'shop-card--disabled' : ''}`}>
      <div className="shop-card-emoji">{emoji}</div>
      <div className="shop-card-name">{name}</div>
      <div className="shop-card-desc">{desc}</div>
      <button
        className={`btn ${isStars ? 'btn--stars' : 'btn--buy'} ${!canAfford ? 'btn--disabled' : ''}`}
        onClick={onBuy}
        disabled={!canAfford && !isStars}
      >
        {isStars ? `${costLabel}` : (canAfford ? costLabel : `${costLabel} ❌`)}
      </button>
    </div>
  )
}

function formatCost(item: ShopItem): string {
  const parts: string[] = []
  if (item.costLeaves) parts.push(`${formatNumber(item.costLeaves)} 🍃`)
  if (item.costDew) parts.push(`${formatNumber(item.costDew)} 💧`)
  if (item.costBerries) parts.push(`${formatNumber(item.costBerries)} 🍇`)
  if (item.costStars) parts.push(`${item.costStars} ⭐`)
  return parts.length ? parts.join(' + ') : 'Free'
}

function formatBuildingCost(cost: typeof BUILDINGS[0]['cost']): string {
  const parts: string[] = []
  if (cost.leaves) parts.push(`${formatNumber(cost.leaves)} 🍃`)
  if (cost.dew) parts.push(`${formatNumber(cost.dew)} 💧`)
  if (cost.berries) parts.push(`${formatNumber(cost.berries)} 🍇`)
  return parts.join(' + ')
}

function checkCanAfford(resources: { leaves: number; dew: number; berries: number }, item: ShopItem): boolean {
  if (item.costStars) return true // Stars handled by Telegram
  return (
    resources.leaves >= (item.costLeaves ?? 0) &&
    resources.dew >= (item.costDew ?? 0) &&
    resources.berries >= (item.costBerries ?? 0)
  )
}
