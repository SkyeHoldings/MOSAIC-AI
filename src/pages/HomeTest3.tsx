import { useEffect } from 'react'
import { AssistHero } from '../components/AssistHero'
import { BrandMarquee } from '../components/BrandMarquee'
import { CalendlySection } from '../components/CalendlySection'
import { ContactSection } from '../components/ContactSection'
import { FeatureShowcase } from '../components/FeatureShowcase'
import { MarketingPillars } from '../components/MarketingPillars'
import { RecognitionStrip } from '../components/RecognitionStrip'
import { SafetyBuiltIn } from '../components/SafetyBuiltIn'
import { ShippedShowcase } from '../components/ShippedShowcase'

export function HomeTest3() {
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
      <AssistHero copy="partner" visual="creative" />

      <BrandMarquee />

      <ShippedShowcase />

      <FeatureShowcase heading="We build campaigns and content systems for brands around the world — with AI and director-level strategists." />

      <nav className="spotlight" aria-label="Spotlight Achievements">
        <div className="spotlight-bar">
          <span className="spotlight-label">Spotlight Achievements</span>
          <span className="spotlight-link">+$200M Managed in Ad Spend</span>
          <span className="spotlight-link">10 Years of Experience</span>
          <span className="spotlight-link">Enterprise to Local Expertise</span>
        </div>
      </nav>

      <RecognitionStrip />

      <MarketingPillars answerTag="@MOSAIC" />

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

      <ContactSection />
    </>
  )
}
