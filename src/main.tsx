import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './telemed.css'
import { ThemeProvider } from './theme/ThemeProvider'
import { registerServiceWorker } from './services/pwa'
import { initOneSignal } from './services/onesignal'

registerServiceWorker()
initOneSignal()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
