import { Routes, Route, Navigate } from 'react-router-dom'
import { WelcomePage } from '../pages/WelcomePage'
import { AuthPage } from '../pages/AuthPage'
import { PageBuilder } from '../pages/PageBuilder'
import { PublicPageView } from './pages/PublicPageView'
import { BotAuthComplete } from './auth/BotAuthComplete'
import { ProtectedRoute } from './auth/ProtectedRoute'

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes - no authentication required */}
      <Route path="/p/:slug" element={<PublicPageView />} />
      <Route path="/auth/bot" element={<BotAuthComplete />} />

      {/* Main app routes */}
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected routes - authentication required */}
      <Route path="/builder" element={
        <ProtectedRoute>
          <PageBuilder />
        </ProtectedRoute>
      } />

      {/* Dashboard and other protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div className="p-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Your pages and analytics will appear here.</p>
          </div>
        </ProtectedRoute>
      } />

      {/* Legacy auth routes for backward compatibility */}
      <Route path="/auth/webapp" element={<AuthPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  )
}