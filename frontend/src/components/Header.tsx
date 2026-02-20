import { useStore } from '../store'
import { t } from '../i18n'
import { getXpForLevel } from '../gameData'

export default function Header() {
  const { profile, gameState } = useStore(s => ({
    profile: s.profile,
    gameState: s.gameState,
  }))

  if (!profile) return null

  const { level, experience } = gameState
  const xpNeeded = getXpForLevel(level + 1)
  const xpPct = Math.min(100, (experience / xpNeeded) * 100)

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="avatar-wrap">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt="avatar" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">
              {(profile.firstName[0] ?? '?').toUpperCase()}
            </div>
          )}
        </div>
        <div className="header-user">
          <span className="header-name">{profile.firstName}</span>
          <div className="xp-bar-wrap">
            <div className="xp-bar" style={{ width: `${xpPct}%` }} />
            <span className="xp-label">{t('profile_level', { level })}</span>
          </div>
        </div>
      </div>
      <div className="header-right">
        <div className="header-sub-badge">
          {gameState.subscription === 'none' ? '🌿' :
           gameState.subscription === 'sprout' ? '🌱' :
           gameState.subscription === 'grove' ? '🌳' : '✨'}
        </div>
      </div>
    </header>
  )
}
