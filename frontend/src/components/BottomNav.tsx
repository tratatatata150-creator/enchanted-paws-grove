import { useStore } from '../store'
import { t } from '../i18n'
import type { Screen } from '../types'

const TABS: { id: Screen; emoji: string; key: 'nav_grove' | 'nav_shop' | 'nav_quests' | 'nav_collection' | 'nav_profile' }[] = [
  { id: 'grove',      emoji: '🌿', key: 'nav_grove'      },
  { id: 'shop',       emoji: '🛍', key: 'nav_shop'       },
  { id: 'quests',     emoji: '📜', key: 'nav_quests'     },
  { id: 'collection', emoji: '📖', key: 'nav_collection' },
  { id: 'profile',    emoji: '🌟', key: 'nav_profile'    },
]

export default function BottomNav() {
  const { activeScreen, setScreen } = useStore(s => ({
    activeScreen: s.activeScreen,
    setScreen: s.setScreen,
  }))

  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${activeScreen === tab.id ? 'nav-tab--active' : ''}`}
          onClick={() => setScreen(tab.id)}
        >
          <span className="nav-emoji">{tab.emoji}</span>
          <span className="nav-label">{t(tab.key)}</span>
        </button>
      ))}
    </nav>
  )
}
