import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'
import { LoadingScreen } from '../components/LoadingScreen'

export const AuthPage = () => {
  const { webApp } = useTelegramWebApp()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [authStatus, setAuthStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        setIsLoading(true)

        // Get Telegram init data
        const initData = webApp?.initData || 'demo-init-data'

        // Call our API
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:54321/functions/v1/navigapp-api'

        const response = await fetch(`${apiUrl}/auth/telegram`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        })

        const result = await response.json()

        if (result.success) {
          setUser(result.data.user)
          setAuthStatus('success')

          // Store tokens
          if (result.data.token) {
            localStorage.setItem('auth_token', result.data.token)
          }
          if (result.data.refreshToken) {
            localStorage.setItem('refresh_token', result.data.refreshToken)
          }

          // Redirect to page builder after a short delay
          setTimeout(() => {
            navigate('/builder')
          }, 2000)
        } else {
          setAuthStatus('error')
        }
      } catch (error) {
        console.error('Authentication error:', error)
        setAuthStatus('error')
      } finally {
        setIsLoading(false)
      }
    }

    // Small delay to show loading state
    const timer = setTimeout(authenticateUser, 1000)
    return () => clearTimeout(timer)
  }, [webApp])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] flex flex-col items-center justify-center p-6">
      <div className="max-w-sm mx-auto text-center space-y-6">
        {authStatus === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--tg-theme-text-color)]">
              Авторизация успешна!
            </h1>
            <div className="bg-[var(--tg-theme-secondary-bg-color)] p-4 rounded-lg">
              <p className="text-[var(--tg-theme-text-color)] font-medium">
                Добро пожаловать, {user?.firstName || 'Пользователь'}!
              </p>
              <p className="text-[var(--tg-theme-hint-color)] text-sm mt-1">
                Тип подписки: {user?.subscriptionType === 'free' ? 'Бесплатная' : 'Pro'}
              </p>
            </div>
            <div className="space-y-2 text-sm text-[var(--tg-theme-hint-color)]">
              <p>🎉 Вы успешно авторизованы через Telegram</p>
              <p>📱 Теперь вы можете создавать навигацию</p>
            </div>
          </>
        )}

        {authStatus === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--tg-theme-text-color)]">
              Ошибка авторизации
            </h1>
            <p className="text-[var(--tg-theme-hint-color)]">
              Не удалось авторизоваться через Telegram. Попробуйте еще раз.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] py-2 px-4 rounded-lg"
            >
              Попробовать снова
            </button>
          </>
        )}

        {/* Debug info */}
        {!webApp && (
          <div className="mt-8 p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-800 text-sm">
              🔧 Режим разработки: используются тестовые данные
            </p>
          </div>
        )}
      </div>
    </div>
  )
}