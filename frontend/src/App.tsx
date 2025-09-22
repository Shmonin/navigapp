import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useTelegramWebApp } from './hooks/useTelegramWebApp'
import { AppRouter } from './components/AppRouter'
import { LoadingScreen } from './components/LoadingScreen'
import { IconProvider } from './providers/IconProvider'

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
    }
  }, [webApp])

  if (!isReady) {
    return <LoadingScreen />
  }

  return (
    <IconProvider>
      <div className="twa-root min-h-screen">
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </div>
    </IconProvider>
  )
}

export default App