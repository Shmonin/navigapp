import { Routes, Route, Navigate } from 'react-router-dom'
import { WelcomePage } from '../pages/WelcomePage'
import { AuthPage } from '../pages/AuthPage'

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  )
}