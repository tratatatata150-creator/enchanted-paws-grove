import React, { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { getCreatureDef } from '../gameData'
import { t, formatNumber } from '../i18n'
import type { GridCreature } from '../types'

// ─── Single cell ──────────────────────────────────────────────────────────────
interface CellProps {
  index: number
  creature: GridCreature | null
  isSelected: boolean
  isLocked: boolean
  onSelect: (i: number) => void
  onCollect: (i: number) => void
}

function CreatureCell({ index, creature, isSelected, isLocked, onSelect, onCollect }: CellProps) {
  const def = creature ? getCreatureDef(creature.family, creature.level) : null

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLocked) return
    if (creature?.isCollecting) {
      onCollect(index)
    } else {
      onSelect(index)
    }
  }

  const cellClass = [
    'grid-cell',
    isSelected ? 'grid-cell--selected' : '',
    isLocked ? 'grid-cell--locked' : '',
    creature?.isCollecting ? 'grid-cell--ready' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cellClass} onClick={handleClick} style={def ? { '--glow': def.glowColor } as React.CSSProperties : {}}>
      {isLocked ? (
        <span className="cell-lock">🔒</span>
      ) : creature && def ? (
        <div className="creature-wrapper">
          <span className="creature-emoji">{def.emoji}</span>
          <span className="creature-level">Lv.{creature.level}</span>
          {creature.isCollecting && <span className="collect-bubble">!</span>}
          {isSelected && <div className="selected-ring" />}
        </div>
      ) : (
        <span className="cell-empty">＋</span>
      )}
    </div>
  )
}

// ─── Resource bar ─────────────────────────────────────────────────────────────
function ResourceBar() {
  const resources = useStore(s => s.gameState.resources)
  return (
    <div className="resource-bar">
      <div className="resource-item">
        <span>🍃</span>
        <span>{formatNumber(resources.leaves)}</span>
      </div>
      <div className="resource-item">
        <span>💧</span>
        <span>{formatNumber(resources.dew)}</span>
      </div>
      <div className="resource-item">
        <span>🍇</span>
        <span>{formatNumber(resources.berries)}</span>
      </div>
    </div>
  )
}

// ─── Main board ───────────────────────────────────────────────────────────────
export default function GameBoard() {
  const { gameState, selectedCell, selectCell, clearSelection, collectCreature, tickProduction, mergeAnimating, catchupBonus, applyOfflineBonus, setToast } = useStore(s => ({
    gameState: s.gameState,
    selectedCell: s.selectedCell,
    selectCell: s.selectCell,
    clearSelection: s.clearSelection,
    collectCreature: s.collectCreature,
    tickProduction: s.tickProduction,
    mergeAnimating: s.mergeAnimating,
    catchupBonus: s.gameState.catchupBonus,
    applyOfflineBonus: s.applyOfflineBonus,
    setToast: s.setToast,
  }))

  // Tick production every 5 seconds
  useEffect(() => {
    const id = setInterval(tickProduction, 5000)
    return () => clearInterval(id)
  }, [tickProduction])

  // Show offline bonus
  useEffect(() => {
    if (catchupBonus.leaves > 0 || catchupBonus.dew > 0) {
      setToast(
        `🌙 Offline bonus: +${formatNumber(catchupBonus.leaves)} 🍃 +${formatNumber(catchupBonus.dew)} 💧`
      )
      applyOfflineBonus()
    }
  }, []) // eslint-disable-line

  const { grid, unlockedSlots } = gameState

  return (
    <div className="game-board-wrapper" onClick={clearSelection}>
      <ResourceBar />
      <div className="grove-title">{t('grove_title')}</div>
      <div className={`merge-grid ${mergeAnimating ? 'merge-grid--animating' : ''}`}>
        {grid.map((creature, i) => (
          <CreatureCell
            key={i}
            index={i}
            creature={creature}
            isSelected={selectedCell === i}
            isLocked={i >= unlockedSlots}
            onSelect={selectCell}
            onCollect={collectCreature}
          />
        ))}
      </div>
      <p className="grove-hint">{t('grove_select_hint')}</p>
    </div>
  )
}
