import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { BusinessCard } from './pages/BusinessCard'
import { Home } from './pages/Home'
import { OneSheet } from './pages/OneSheet'
import { Privacy } from './pages/Privacy'
import { Services } from './pages/Services'
import { Terms } from './pages/Terms'
import { WorkDetail } from './pages/WorkDetail'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const node = document.getElementById(id)
      if (node) {
        node.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isStandalonePage = pathname === '/businesscard' || pathname === '/onesheet'

  return (
    <div className="site-shell">
      <ScrollToTop />
      {!isStandalonePage && <Header />}
      <main className={`site-main${isStandalonePage ? ' site-main--flush' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/businesscard" element={<BusinessCard />} />
          <Route path="/onesheet" element={<OneSheet />} />
          <Route path="/work/:id" element={<WorkDetail />} />
          <Route path="/expertise" element={<Navigate to={{ pathname: '/', hash: 'how-we-work' }} replace />} />
          <Route path="/contact" element={<Navigate to={{ pathname: '/', hash: 'contact' }} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isStandalonePage && <Footer />}
    </div>
  )
}
