import { useState, useEffect, useCallback } from 'react'

interface TelegramWebApp {
  initData: string
  initDataUnsafe: any
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number

  ready: () => void
  expand: () => void
  close: () => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void

  onEvent: (eventType: string, eventHandler: () => void) => void
  offEvent: (eventType: string, eventHandler: () => void) => void

  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: () => void
    hideProgress: () => void
  }

  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }

  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    if (tg) {
      setWebApp(tg)
      setIsReady(true)
    } else {
      // For development without Telegram
      console.warn('Telegram WebApp not available')
      setIsReady(true)
    }
  }, [])

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text)
      webApp.MainButton.show()
      webApp.MainButton.onClick(onClick)
    }
  }, [webApp])

  const hideMainButton = useCallback(() => {
    webApp?.MainButton.hide()
  }, [webApp])

  const showBackButton = useCallback((onClick: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.show()
      webApp.BackButton.onClick(onClick)
    }
  }, [webApp])

  const hideBackButton = useCallback(() => {
    webApp?.BackButton.hide()
  }, [webApp])

  const hapticFeedback = useCallback((type: 'impact' | 'notification' | 'selection', style?: string) => {
    if (webApp?.HapticFeedback) {
      switch (type) {
        case 'impact':
          webApp.HapticFeedback.impactOccurred(style as any || 'medium')
          break
        case 'notification':
          webApp.HapticFeedback.notificationOccurred(style as any || 'success')
          break
        case 'selection':
          webApp.HapticFeedback.selectionChanged()
          break
      }
    }
  }, [webApp])

  return {
    webApp,
    isReady,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    mainButton: webApp?.MainButton,
    backButton: webApp?.BackButton
  }
}