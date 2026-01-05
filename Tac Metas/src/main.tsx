import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import './styles/index.css'
import { getInitialTheme, applyTheme } from './app/theme'

// Apply theme immediately before render to avoid flash
const initialTheme = getInitialTheme()
applyTheme(initialTheme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
