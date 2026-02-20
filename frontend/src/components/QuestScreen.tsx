import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { t, formatNumber, formatTimeRemaining, getLang } from '../i18n'
import { fetchDailyQuests } from '../api'
import { CREATURE_FAMILIES } from '../gameData'
import type { Quest } from '../types'

export default function QuestScreen() {
  const { gameState, claimQuest, setToast } = useStore(s => ({
    gameState: s.gameState,
    claimQuest: s.claimQuest,
    setToast: s.setToast,
  }))

  const [loading, setLoading] = useState(false)

  const quests = gameState.dailyQuests
  const questLastReset = gameState.questLastReset
  const nextReset = questLastReset + 24 * 3600 * 1000
  const timeLeft = Math.max(0, nextReset - Date.now())

  useEffect(() => {
    if (quests.length === 0) {
      setLoading(true)
      fetchDailyQuests().then(res => {
        setLoading(false)
        if (res.ok && res.data) {
          useStore.setState(s => ({
            gameState: { ...s.gameState, dailyQuests: res.data! }
          }))
        }
      })
    }
  }, [quests.length])

  function handleClaim(quest: Quest) {
    if (!quest.completed || quest.claimedAt) return
    claimQuest(quest.id)
  }

  if (loading) {
    return (
      <div className="screen-container center-content">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="screen-container">
      <h2 className="screen-title">{t('quests_title')}</h2>

      <div className="quest-reset-timer">
        {t('quests_reset', { time: formatTimeRemaining(timeLeft) })}
      </div>

      <div className="quest-list">
        {quests.length === 0 ? (
          <div className="empty-state">
            <span>📜</span>
            <p>{getLang() === 'ru' ? 'Нет заданий. Попробуй позже!' : 'No quests yet. Check back later!'}</p>
          </div>
        ) : (
          quests.map(quest => (
            <QuestCard key={quest.id} quest={quest} onClaim={handleClaim} />
          ))
        )}
      </div>

      {/* Achievements section */}
      <h3 className="section-title">
        {getLang() === 'ru' ? '🏆 Достижения' : '🏆 Achievements'}
      </h3>
      <div className="achievement-list">
        <AchievementCard
          emoji="⭐"
          nameEn="First Merge"
          nameRu="Первое слияние"
          descEn="Merge 2 creatures for the first time"
          descRu="Слей двух зверьков первый раз"
          unlocked={gameState.totalMerges >= 1}
        />
        <AchievementCard
          emoji="🌟"
          nameEn="Merge Master"
          nameRu="Мастер слияний"
          descEn="Perform 10 merges"
          descRu="Выполни 10 слияний"
          unlocked={gameState.totalMerges >= 10}
        />
        <AchievementCard
          emoji="🐉"
          nameEn="Dragon Tamer"
          nameRu="Укротитель дракона"
          descEn="Reach level 3 Dragon"
          descRu="Прокачай дракона до уровня 3"
          unlocked={gameState.discoveredCreatures.some(d => d.family === 'baby_dragon' && d.level >= 3)}
        />
        <AchievementCard
          emoji="📖"
          nameEn="Collector"
          nameRu="Коллекционер"
          descEn="Discover 10 different creatures"
          descRu="Открой 10 разных зверьков"
          unlocked={gameState.discoveredCreatures.length >= 10}
        />
        <AchievementCard
          emoji="🤝"
          nameEn="Social Butterfly"
          nameRu="Душа компании"
          descEn="Invite your first friend"
          descRu="Пригласи первого друга"
          unlocked={gameState.referralCount >= 1}
        />
      </div>
    </div>
  )
}

// ─── Quest Card ───────────────────────────────────────────────────────────────
interface QuestCardProps {
  quest: Quest
  onClaim: (q: Quest) => void
}

function QuestCard({ quest, onClaim }: QuestCardProps) {
  const lang = getLang()
  const pct = Math.min(100, (quest.currentAmount / quest.targetAmount) * 100)
  const claimed = !!quest.claimedAt

  function getQuestDesc() {
    const family = quest.targetFamily ? CREATURE_FAMILIES[quest.targetFamily] : null
    const familyName = family ? (lang === 'ru' ? family.levels[0].nameRu.split(' ')[0] : family.levels[0].nameEn.split(' ')[0]) : ''

    if (quest.type === 'merge') return lang === 'ru'
      ? `Слей ${quest.targetAmount} зверьков`
      : `Merge ${quest.targetAmount} creatures`
    if (quest.type === 'collect') return lang === 'ru'
      ? `Собери ${quest.targetAmount} ${quest.targetResource === 'leaves' ? 'Листьев' : quest.targetResource === 'dew' ? 'Росы' : 'Ягод'}`
      : `Collect ${quest.targetAmount} ${quest.targetResource}`
    if (quest.type === 'collect_type') return lang === 'ru'
      ? `Собери ${quest.targetAmount} ресурсов от ${familyName}`
      : `Collect ${quest.targetAmount} resources from ${familyName}`
    return ''
  }

  function getRewardText() {
    const parts = []
    if (quest.rewardLeaves > 0) parts.push(`+${formatNumber(quest.rewardLeaves)} 🍃`)
    if (quest.rewardDew > 0) parts.push(`+${formatNumber(quest.rewardDew)} 💧`)
    if (quest.rewardBerries > 0) parts.push(`+${formatNumber(quest.rewardBerries)} 🍇`)
    return parts.join(' ')
  }

  return (
    <div className={`quest-card ${claimed ? 'quest-card--claimed' : quest.completed ? 'quest-card--done' : ''}`}>
      <div className="quest-top">
        <div className="quest-info">
          <span className="quest-desc">{getQuestDesc()}</span>
          <span className="quest-reward">{getRewardText()}</span>
        </div>
        <button
          className={`btn ${claimed ? 'btn--claimed' : quest.completed ? 'btn--claim' : 'btn--progress'}`}
          onClick={() => onClaim(quest)}
          disabled={!quest.completed || claimed}
        >
          {claimed ? t('quests_claimed') : quest.completed ? t('quests_claim') : t('quests_progress', { current: quest.currentAmount, target: quest.targetAmount })}
        </button>
      </div>
      <div className="quest-progress-bar">
        <div className="quest-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Achievement Card ─────────────────────────────────────────────────────────
interface AchievementCardProps {
  emoji: string
  nameEn: string
  nameRu: string
  descEn: string
  descRu: string
  unlocked: boolean
}

function AchievementCard({ emoji, nameEn, nameRu, descEn, descRu, unlocked }: AchievementCardProps) {
  const lang = getLang()
  return (
    <div className={`achievement-card ${unlocked ? 'achievement-card--unlocked' : ''}`}>
      <span className="achievement-emoji">{unlocked ? emoji : '🔒'}</span>
      <div className="achievement-info">
        <div className="achievement-name">{lang === 'ru' ? nameRu : nameEn}</div>
        <div className="achievement-desc">{lang === 'ru' ? descRu : descEn}</div>
      </div>
      {unlocked && <span className="achievement-check">✓</span>}
    </div>
  )
}
