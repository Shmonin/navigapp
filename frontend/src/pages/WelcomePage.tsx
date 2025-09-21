import { useNavigate } from 'react-router-dom'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'

export const WelcomePage = () => {
  const navigate = useNavigate()
  const { webApp, hapticFeedback } = useTelegramWebApp()

  const handleStart = () => {
    hapticFeedback('impact', 'light')
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Logo/Icon placeholder */}
        <div className="w-20 h-20 mx-auto bg-[var(--tg-theme-button-color)] rounded-full flex items-center justify-center">
          <span className="text-2xl text-[var(--tg-theme-button-text-color)]">📱</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)]">
          Добро пожаловать в Навигапп
        </h1>

        {/* Description */}
        <p className="text-[var(--tg-theme-hint-color)] leading-relaxed">
          Создавайте структурированную навигацию для ваших Telegram каналов с помощью интерактивных карточек и меню
        </p>

        {/* Features */}
        <div className="space-y-3 text-sm text-[var(--tg-theme-hint-color)]">
          <div className="flex items-center space-x-3">
            <span>✅</span>
            <span>Простое создание навигации</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>✅</span>
            <span>Интеграция с Telegram</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>✅</span>
            <span>Аналитика переходов</span>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] py-3 px-6 rounded-xl font-medium transition-opacity hover:opacity-90 active:opacity-75"
        >
          Начать работу
        </button>

        {/* Debug info for development */}
        {!webApp && (
          <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Режим разработки: Telegram WebApp не обнаружен
            </p>
          </div>
        )}
      </div>
    </div>
  )
}