import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Hide loading screen
const loadingElement = document.getElementById('loading')
if (loadingElement) {
  loadingElement.style.display = 'none'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)