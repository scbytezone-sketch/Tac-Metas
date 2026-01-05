export type Theme = 'light' | 'dark'

const KEY = 'tac_theme'

export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function persistTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, theme)
}

export function getSavedTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(KEY)
  return v === 'dark' || v === 'light' ? v as Theme : null
}

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return getSavedTheme() 
    ?? (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light')
}
