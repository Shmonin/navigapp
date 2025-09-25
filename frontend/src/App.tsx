import { useEffect } from 'react'
import { useTelegramWebApp } from './hooks/useTelegramWebApp'
import { AppRouter } from './router'
import { LoadingScreen } from './components/LoadingScreen'
import { IconProvider } from './providers/IconProvider'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import { ToastContainer } from './components/Toast/ToastContainer'
import { DebugPanel } from './components/Debug/DebugPanel'

function App() {
  const { webApp, isReady } = useTelegramWebApp()

  useEffect(() => {
    // Set up Telegram WebApp
    if (webApp) {
      webApp.ready()
      webApp.expand()

      // Apply Telegram theme
      document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.themeParams.bg_color || '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color || '#000000')
      document.documentElement.style.setProperty('--tg-theme-hint-color', webApp.themeParams.hint_color || '#999999')
      document.documentElement.style.setProperty('--tg-theme-link-color', webApp.themeParams.link_color || '#2481cc')
      document.documentElement.style.setProperty('--tg-theme-button-color', webApp.themeParams.button_color || '#2481cc')
      document.documentElement.style.setProperty('--tg-theme-button-text-color', webApp.themeParams.button_text_color || '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', webApp.themeParams.secondary_bg_color || '#f0f0f0')
      document.documentElement.style.setProperty('--tg-theme-section-separator-color', '#e0e0e0')
    }
  }, [webApp])

  if (!isReady) {
    return <LoadingScreen />
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <IconProvider>
          <div className="twa-root min-h-screen">
            <AppRouter />
            <ToastContainer />
            <DebugPanel />
          </div>
        </IconProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App