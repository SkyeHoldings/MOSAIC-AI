import { useEffect } from 'react'
import { BrandMarquee } from '../components/BrandMarquee'
import { CalendlySection } from '../components/CalendlySection'
import { ContactSection } from '../components/ContactSection'
import { FeatureShowcase } from '../components/FeatureShowcase'
import { MarketingPillars } from '../components/MarketingPillars'
import { MosaicLogo } from '../components/MosaicLogo'
import { RecognitionStrip } from '../components/RecognitionStrip'
import { SafetyBuiltIn } from '../components/SafetyBuiltIn'
import { ShippedShowcase } from '../components/ShippedShowcase'
import './home-test.css'

function HeroChart() {
  return (
    <svg
      className="ht-chart"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="#3a3a3a"
        d="M0 230 L70 248 L120 190 L180 220 L240 150 L310 196 L370 128 L440 188 L510 110 L580 170 L650 96 L730 160 L800 88 L880 150 L960 70 L1040 140 L1120 86 L1200 160 L1280 74 L1360 130 L1440 58 L1440 320 L0 320 Z"
      />
      <path
        fill="#2a2a2a"
        d="M0 262 L80 240 L150 286 L220 230 L300 270 L380 210 L460 258 L540 188 L630 246 L720 176 L810 230 L900 160 L990 214 L1080 148 L1170 200 L1260 136 L1350 188 L1440 120 L1440 320 L0 320 Z"
      />
      <path
        fill="#141414"
        d="M0 292 L90 270 L170 304 L250 258 L340 288 L430 240 L520 278 L620 230 L710 268 L810 222 L910 260 L1010 210 L1110 248 L1210 200 L1310 236 L1440 188 L1440 320 L0 320 Z"
      />
      <path
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeDasharray="2 8"
        strokeLinejoin="round"
        d="M0 210 L60 176 L110 228 L170 150 L230 198 L300 112 L360 186 L430 96 L500 168 L570 78 L650 154 L720 64 L800 142 L870 52 L960 130 L1040 40 L1130 118 L1210 48 L1300 110 L1440 22"
      />
    </svg>
  )
}

export function HomeTest2() {
  useEffect(() => {
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => {
      robots.remove()
    }
  }, [])

  return (
    <>
      <div className="ht ht--embed">
        <section className="ht-hero" aria-labelledby="ht2-hero-title">
          <div className="ht-hero__copy">
            <h1 id="ht2-hero-title">
              <span className="ht-hero__lead">
                <span className="ht-hero__logo">
                  <MosaicLogo />
                  <span className="ht-hero__sr">MOSAIC</span>
                </span>
                <span className="ht-hero__aside">is your</span>
              </span>
              <span className="ht-hero__rest">growth marketing partner.</span>
            </h1>
            <p>
              We help brands grow by building the system that plans the work, makes
              the creative, and runs the media — then stays with it week to week.
            </p>
          </div>
          <HeroChart />
        </section>
      </div>

      <BrandMarquee />

      <ShippedShowcase />

      <FeatureShowcase />

      <nav className="spotlight" aria-label="Spotlight Achievements">
        <div className="spotlight-bar">
          <span className="spotlight-label">Spotlight Achievements</span>
          <span className="spotlight-link">+$200M Managed in Ad Spend</span>
          <span className="spotlight-link">10 Years of Experience</span>
          <span className="spotlight-link">Enterprise to Local Expertise</span>
        </div>
      </nav>

      <RecognitionStrip />

      <MarketingPillars />

      <SafetyBuiltIn />

      <section className="ideas-cta" aria-labelledby="ideas-cta-heading">
        <h2 id="ideas-cta-heading">Ideas no longer have to wait their turn</h2>
        <a className="ideas-cta__button" href="#book">
          Get started
        </a>
      </section>

      <CalendlySection />

      <ContactSection />
    </>
  )
}
