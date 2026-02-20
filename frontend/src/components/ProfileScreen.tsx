import { useStore } from '../store'
import { t, formatDate, getLang } from '../i18n'
import { getXpForLevel, SUBSCRIPTIONS } from '../gameData'
import { generateShareLink } from '../api'
import { useState } from 'react'

export default function ProfileScreen() {
  const { profile, gameState, setToast } = useStore(s => ({
    profile: s.profile,
    gameState: s.gameState,
    setToast: s.setToast,
  }))

  const [copying, setCopying] = useState(false)
  const lang = getLang()

  if (!profile) return null

  const { level, experience, totalMerges, subscription, subscriptionExpires, referralCode, referralCount } = gameState
  const xpNeeded = getXpForLevel(level + 1)
  const xpPct = Math.min(100, (experience / xpNeeded) * 100)

  const subDef = SUBSCRIPTIONS.find(s => s.id === subscription)
  const subName = lang === 'ru'
    ? (subDef ? subDef.nameRu : t('sub_none'))
    : (subDef ? subDef.nameEn : t('sub_none'))

  async function handleShare() {
    const link = await generateShareLink(referralCode)
    const text = lang === 'ru'
      ? `🌿 Играй со мной в Волшебную Рощу Пушистиков! ${link}`
      : `🌿 Join me in Enchanted Paws Grove! ${link}`

    if (navigator.share) {
      navigator.share({ text, url: link }).catch(() => {})
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(link)
      setCopying(true)
      setToast(lang === 'ru' ? 'Ссылка скопирована!' : 'Link copied!')
      setTimeout(() => setCopying(false), 1500)
    } else {
      // Telegram share
      const twa = window.Telegram?.WebApp
      if (twa) {
        twa.showAlert(link)
      }
    }
  }

  return (
    <div className="screen-container">
      <h2 className="screen-title">{t('profile_title')}</h2>

      {/* User card */}
      <div className="profile-card">
        <div className="profile-avatar">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt="avatar" className="avatar-img-lg" />
          ) : (
            <div className="avatar-placeholder-lg">
              {(profile.firstName[0] ?? '?').toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-info">
          <div className="profile-name">{profile.firstName}</div>
          {profile.username && <div className="profile-username">@{profile.username}</div>}
          <div className="profile-level-badge">{t('profile_level', { level })}</div>
        </div>
      </div>

      {/* XP bar */}
      <div className="xp-section">
        <div className="xp-bar-full">
          <div className="xp-fill" style={{ width: `${xpPct}%` }} />
        </div>
        <div className="xp-text">{t('profile_xp', { current: experience, next: xpNeeded })} XP</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-emoji">🔀</span>
          <span className="stat-value">{totalMerges}</span>
          <span className="stat-label">{lang === 'ru' ? 'Слияний' : 'Merges'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-emoji">📖</span>
          <span className="stat-value">{gameState.discoveredCreatures.length}</span>
          <span className="stat-label">{lang === 'ru' ? 'Открыто' : 'Discovered'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-emoji">🐾</span>
          <span className="stat-value">{gameState.grid.filter(Boolean).length}</span>
          <span className="stat-label">{lang === 'ru' ? 'Зверьков' : 'Creatures'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-emoji">🤝</span>
          <span className="stat-value">{referralCount}</span>
          <span className="stat-label">{lang === 'ru' ? 'Друзей' : 'Friends'}</span>
        </div>
      </div>

      {/* Subscription */}
      <div className="section-card">
        <h3 className="section-card-title">
          {subscription === 'none' ? '🌿' : subscription === 'sprout' ? '🌱' : subscription === 'grove' ? '🌳' : '✨'}{' '}
          {lang === 'ru' ? 'Текущий пропуск' : 'Current Pass'}
        </h3>
        <p className="section-card-value">{subName}</p>
        {subscriptionExpires && subscription !== 'none' && (
          <p className="section-card-sub">
            {lang === 'ru' ? 'Истекает: ' : 'Expires: '}
            {formatDate(subscriptionExpires)}
          </p>
        )}
        {subscription === 'none' && (
          <p className="section-card-sub">
            {lang === 'ru' ? 'Открой пропуск в магазине для бонусов!' : 'Get a pass in the shop for bonuses!'}
          </p>
        )}
      </div>

      {/* Referral */}
      <div className="section-card">
        <h3 className="section-card-title">{t('profile_referral_title')}</h3>
        <p className="section-card-desc">{t('profile_referral_desc')}</p>
        {referralCode && (
          <div className="referral-code-box">
            <span className="referral-code-text">{referralCode}</span>
          </div>
        )}
        <button className="btn btn--primary btn--full" onClick={handleShare}>
          {copying
            ? (lang === 'ru' ? '✓ Скопировано!' : '✓ Copied!')
            : t('profile_referral_share')}
        </button>
        <p className="referral-count">
          {t('profile_referral_count', { count: referralCount })}
        </p>
      </div>

      {/* Member since */}
      <div className="member-since">
        {lang === 'ru' ? 'Дата вступления: ' : 'Member since: '}
        {formatDate(profile.createdAt)}
      </div>
    </div>
  )
}
