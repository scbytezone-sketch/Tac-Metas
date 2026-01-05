import { useEffect, useRef } from 'react'

export function useDebouncedSave<T>(value: T, key: string, delay = 300) {
  const timeoutRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value))
    }, delay)
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [value, key, delay])
}

export function loadState<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === 'undefined') return fallback
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (err) {
    console.warn('Failed to load state', err)
    return fallback
  }
}

