import { Link } from 'react-router-dom'
import { AssistHero } from '../components/AssistHero'
import { WorkCard } from '../components/WorkCard'
import { caseStudies, expertise } from '../data/work'

export function Home() {
  return (
    <>
      <AssistHero />

      <nav className="spotlight" aria-label="Spotlight">
        <div className="spotlight-bar">
          <span className="spotlight-label">Spotlight Services</span>
          <Link className="spotlight-link" to="/expertise">
            Artificial Intelligence
          </Link>
          <Link className="spotlight-link" to="/expertise">
            Brand Storytelling
          </Link>
          <Link className="spotlight-link" to="/expertise">
            Growth Strategy
          </Link>
        </div>
      </nav>

      <section className="work-section" aria-label="Selected work">
        <div className="work-grid">
          {caseStudies.map((study) => (
            <WorkCard key={study.id} study={study} />
          ))}
        </div>
      </section>

      <section className="statement">
        <h2>
          We build brands, campaigns, and content systems with AI — quietly,
          carefully, and with craft.
        </h2>
        <p className="follow-up">
          Strategy leads. Models accelerate. Taste makes the final call.
        </p>
      </section>

      <section aria-label="Expertise">
        <div className="expertise-list">
          {expertise.map((item) => (
            <div key={item.title} className="expertise-row">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <Link className="text-link" to="/expertise">
                View expertise
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>The future, faster.</h2>
        <Link className="text-link" to="/contact">
          Get in touch
        </Link>
      </section>
    </>
  )
}
