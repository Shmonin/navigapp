import { Routes, Route, Navigate } from 'react-router-dom'
import { WelcomePage } from '../pages/WelcomePage'
import { AuthPage } from '../pages/AuthPage'
import { PageBuilder } from '../pages/PageBuilder'

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/builder" element={<PageBuilder />} />
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  )
}