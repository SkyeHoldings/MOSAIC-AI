import { AssistHero } from '../components/AssistHero'
import { ContactSection } from '../components/ContactSection'
import { FeatureShowcase } from '../components/FeatureShowcase'
import { MarketingPillars } from '../components/MarketingPillars'
import { RecognitionStrip } from '../components/RecognitionStrip'
import { SafetyBuiltIn } from '../components/SafetyBuiltIn'
import { ShippedShowcase } from '../components/ShippedShowcase'

export function Home() {
  return (
    <>
      <AssistHero />

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
        <a className="ideas-cta__button" href="#contact">
          Get started
        </a>
      </section>

      <ContactSection />
    </>
  )
}
