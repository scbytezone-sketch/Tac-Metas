import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Dashboard from '../pages/Dashboard'
import Setup from '../pages/Setup'
import NewActivity from '../pages/NewActivity'
import Reports from '../pages/Reports'
import Overtime from '../pages/Overtime'
import { useApp } from './context'
import PageTransition from '../components/PageTransition'
import BottomNav from '../components/BottomNav'

export default function AppRouter() {
  const { state } = useApp()
  const location = useLocation()
  const hasProfile = Boolean(state.user)
  const isSetup = location.pathname === '/setup'

  if (!hasProfile) {
    return (
      <Routes>
        <Route path="/*" element={<Setup />} />
      </Routes>
    )
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/nova-atividade" element={<PageTransition><NewActivity /></PageTransition>} />
          <Route path="/overtime" element={<PageTransition><Overtime /></PageTransition>} />
          <Route path="/relatorios" element={<PageTransition><Reports /></PageTransition>} />
          <Route path="/setup" element={<PageTransition><Setup /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      {!isSetup && <BottomNav />}
    </>
  )
}
