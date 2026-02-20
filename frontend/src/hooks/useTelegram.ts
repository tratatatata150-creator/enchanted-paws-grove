import { useEffect, useState } from 'react'
import type { TelegramUser } from '../types'

export interface TelegramContext {
  user: TelegramUser | null
  initData: string
  startParam: string | undefined
  isReady: boolean
  colorScheme: 'light' | 'dark'
  hapticImpact: (style?: 'light' | 'medium' | 'heavy') => void
  hapticSuccess: () => void
  hapticError: () => void
  showAlert: (msg: string) => void
  openInvoice: (url: string, cb?: (status: string) => void) => void
}

export function useTelegram(): TelegramContext {
  const [isReady, setIsReady] = useState(false)
  const twa = window.Telegram?.WebApp

  useEffect(() => {
    if (!twa) {
      // Dev mode without Telegram
      setIsReady(true)
      return
    }
    twa.ready()
    twa.expand()
    setIsReady(true)
  }, [twa])

  const user = twa?.initDataUnsafe?.user ?? null
  const initData = twa?.initData ?? ''
  const startParam = twa?.initDataUnsafe?.start_param

  function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
    twa?.HapticFeedback?.impactOccurred(style)
  }

  function hapticSuccess() {
    twa?.HapticFeedback?.notificationOccurred('success')
  }

  function hapticError() {
    twa?.HapticFeedback?.notificationOccurred('error')
  }

  function showAlert(msg: string) {
    twa ? twa.showAlert(msg) : alert(msg)
  }

  function openInvoice(url: string, cb?: (status: string) => void) {
    if (twa) {
      twa.openInvoice(url, cb)
    } else {
      window.open(url, '_blank')
    }
  }

  return {
    user,
    initData,
    startParam,
    isReady,
    colorScheme: twa?.colorScheme ?? 'light',
    hapticImpact,
    hapticSuccess,
    hapticError,
    showAlert,
    openInvoice,
  }
}
