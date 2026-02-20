import { useEffect, useRef } from 'react'
import { useStore } from './store'
import { setLang } from './i18n'
import { useTelegram } from './hooks/useTelegram'

import Header from './components/Header'
import BottomNav from './components/BottomNav'
import GameBoard from './components/GameBoard'
import ShopScreen from './components/ShopScreen'
import QuestScreen from './components/QuestScreen'
import CollectionScreen from './components/CollectionScreen'
import ProfileScreen from './components/ProfileScreen'
import Onboarding from './components/Onboarding'
import Toast from './components/Toast'

export default function App() {
  const { user, initData, startParam, isReady, colorScheme } = useTelegram()
  const { initialize, isLoading, loadError, activeScreen, showOnboarding } = useStore(s => ({
    initialize: s.initialize,
    isLoading: s.isLoading,
    loadError: s.loadError,
    activeScreen: s.activeScreen,
    showOnboarding: s.showOnboarding,
  }))

  const initialized = useRef(false)

  useEffect(() => {
    if (!isReady || initialized.current) return
    initialized.current = true

    // Set language from Telegram user
    const lang = user?.language_code ?? navigator.language ?? 'en'
    setLang(lang)

    // Init game
    initialize(initData, startParam)
  }, [isReady, initData, startParam, user, initialize])

  // Set color scheme on body
  useEffect(() => {
    document.body.setAttribute('data-theme', colorScheme)
  }, [colorScheme])

  if (isLoading) {
    return (
      <div className="splash-screen">
        <div className="splash-logo">🌿</div>
        <h1 className="splash-title">Enchanted Paws Grove</h1>
        <div className="splash-subtitle">Волшебная Роща Пушистиков</div>
        <div className="splash-loader">
          <div className="loader-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="error-screen">
        <span className="error-emoji">😿</span>
        <p>{loadError}</p>
        <button className="btn btn--primary" onClick={() => window.location.reload()}>
          Retry / Повторить
        </button>
      </div>
    )
  }

  return (
    <div className="app-root">
      {showOnboarding && <Onboarding />}
      <Header />
      <main className="app-main">
        {activeScreen === 'grove' && <GameBoard />}
        {activeScreen === 'shop' && <ShopScreen />}
        {activeScreen === 'quests' && <QuestScreen />}
        {activeScreen === 'collection' && <CollectionScreen />}
        {activeScreen === 'profile' && <ProfileScreen />}
      </main>
      <BottomNav />
      <Toast />
    </div>
  )
}
