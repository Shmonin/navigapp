export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-[var(--tg-theme-bg-color)] flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-3 border-[var(--tg-theme-hint-color)] border-t-[var(--tg-theme-button-color)] rounded-full animate-spin" />
        <p className="text-[var(--tg-theme-hint-color)] text-sm">Загрузка...</p>
      </div>
    </div>
  )
}