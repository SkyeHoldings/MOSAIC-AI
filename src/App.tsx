import { useEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { BusinessCard } from './pages/BusinessCard'
import { GrowthPreview } from './pages/GrowthPreview'
import { Home } from './pages/Home'
import { LeadLeakCheck } from './pages/LeadLeakCheck'
import { OneSheet } from './pages/OneSheet'
import { ProgramBrief } from './pages/ProgramBrief'
import { Privacy } from './pages/Privacy'
import { Services } from './pages/Services'
import { SmsOptIn } from './pages/SmsOptIn'
import { Terms } from './pages/Terms'
import { CaseStudies } from './pages/CaseStudies'
import { CaseStudy } from './pages/CaseStudy'
import { WorkDetail } from './pages/WorkDetail'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash && !pathname.endsWith('/review')) {
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

function NormalizeTrailingSlash() {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (pathname.length > 1 && pathname.endsWith('/')) {
      navigate(`${pathname.replace(/\/+$/, '')}${search}${hash}`, { replace: true })
    }
  }, [hash, navigate, pathname, search])

  return null
}

function NotFound() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>That page isn’t on this site.</p>
      <Link className="text-link" to="/case-studies">
        Case Studies
      </Link>
      <Link className="text-link" to="/">
        Home
      </Link>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const isStandalonePage = pathname === '/businesscard' || pathname === '/onesheet'

  return (
    <div className="site-shell">
      <NormalizeTrailingSlash />
      <ScrollToTop />
      {!isStandalonePage && <Header />}
      <main className={`site-main${isStandalonePage ? ' site-main--flush' : ''}`}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="growth" element={<GrowthPreview />} />
          <Route path="case-studies">
            <Route index element={<CaseStudies />} />
            <Route path=":id" element={<CaseStudy />} />
          </Route>
          <Route path="services" element={<Services />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="sms-opt-in" element={<SmsOptIn />} />
          <Route path="lead-leak-check" element={<LeadLeakCheck />} />
          <Route path="free" element={<LeadLeakCheck />} />
          <Route path="brief" element={<ProgramBrief />} />
          <Route path="brief/review" element={<ProgramBrief />} />
          <Route path="diagnostic" element={<ProgramBrief />} />
          <Route path="diagnostic/review" element={<ProgramBrief />} />
          <Route path="businesscard" element={<BusinessCard />} />
          <Route path="onesheet" element={<OneSheet />} />
          <Route path="work/:id" element={<WorkDetail />} />
          <Route path="expertise" element={<Navigate to={{ pathname: '/', hash: 'how-we-work' }} replace />} />
          <Route path="contact" element={<Navigate to={{ pathname: '/', hash: 'contact' }} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isStandalonePage && <Footer />}
    </div>
  )
}
