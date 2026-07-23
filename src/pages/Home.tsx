import { AssistHero } from '../components/AssistHero'
import { ContactSection } from '../components/ContactSection'
import { FeatureShowcase } from '../components/FeatureShowcase'
import { MarketingPillars } from '../components/MarketingPillars'
import { SafetyBuiltIn } from '../components/SafetyBuiltIn'
import { ShippedShowcase } from '../components/ShippedShowcase'

export function Home() {
  return (
    <>
      <AssistHero />

      <ShippedShowcase />

      <FeatureShowcase />

      <nav className="spotlight" aria-label="Spotlight">
        <div className="spotlight-bar">
          <span className="spotlight-label">Spotlight Services</span>
          <a className="spotlight-link" href="#how-we-work">
            Artificial Intelligence
          </a>
          <a className="spotlight-link" href="#how-we-work">
            Brand Storytelling
          </a>
          <a className="spotlight-link" href="#how-we-work">
            Paid Media Support
          </a>
        </div>
      </nav>

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
