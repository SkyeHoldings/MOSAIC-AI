import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CarouselHero } from '../components/CarouselHero'
import { BrandMarquee } from '../components/BrandMarquee'
import { CalendlySection } from '../components/CalendlySection'
import { FeatureShowcase } from '../components/FeatureShowcase'
import { MarketingPillars } from '../components/MarketingPillars'
import { RecognitionStrip } from '../components/RecognitionStrip'
import { SafetyBuiltIn } from '../components/SafetyBuiltIn'

export function HomeTest4() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === '/') return
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => {
      robots.remove()
    }
  }, [pathname])

  return (
    <>
      <CarouselHero />

      <BrandMarquee />

      <FeatureShowcase heading="We build campaigns and content systems for brands around the world — with AI and director-level strategists." />

      <nav className="spotlight" aria-label="Spotlight Achievements">
        <div className="spotlight-bar">
          <span className="spotlight-label">Spotlight Achievements</span>
          <span className="spotlight-link">+$200M Managed in Ad Spend</span>
          <span className="spotlight-link">10 Years of Experience</span>
          <span className="spotlight-link">2 Awards from dentsu</span>
        </div>
      </nav>

      <RecognitionStrip />

      <MarketingPillars answerTag="@MOSAIC" ctaHref="#book" />

      <SafetyBuiltIn
        heading="From notice to return"
        empathy="The work starts with people, not personas. Humans notice, decide, and come back for the same reasons."
        awareness="We put brands in front of the right people at the right moment, across markets around the world."
      />

      <section className="ideas-cta" aria-labelledby="ideas-cta-heading">
        <h2 id="ideas-cta-heading">Sit down for coffee. We’ll bring the case studies.</h2>
        <a className="ideas-cta__button" href="#book">
          Get started
        </a>
      </section>

      <CalendlySection />
    </>
  )
}
