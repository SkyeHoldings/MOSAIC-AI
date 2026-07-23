import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { BusinessCard } from './pages/BusinessCard'
import { Home } from './pages/Home'
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
  const isBusinessCardPage = pathname === '/businesscard'

  return (
    <div className="site-shell">
      <ScrollToTop />
      {!isBusinessCardPage && <Header />}
      <main className={`site-main${isBusinessCardPage ? ' site-main--flush' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/businesscard" element={<BusinessCard />} />
          <Route path="/work/:id" element={<WorkDetail />} />
          <Route path="/expertise" element={<Navigate to={{ pathname: '/', hash: 'how-we-work' }} replace />} />
          <Route path="/contact" element={<Navigate to={{ pathname: '/', hash: 'contact' }} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isBusinessCardPage && <Footer />}
    </div>
  )
}
