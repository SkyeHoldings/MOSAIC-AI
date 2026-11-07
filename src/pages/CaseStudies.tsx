import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCaseStudyPath, getPublishedCaseStudies } from '../data/work'

export function CaseStudies() {
  const studies = getPublishedCaseStudies()

  useEffect(() => {
    const previous = document.title
    document.title = 'Case Studies · MOSAIC'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <article className="cs-index">
      <header className="cs-index-hero">
        <p className="cs-badge">Case studies</p>
        <h1>Work that moved the number</h1>
        <p>
          Reads on media mix and product economics — not last-click stories.
          Red Robin: YouTube on top of Performance Max, measured against
          PMax-only units in the same markets. Bass Pro Shops: a daily margin
          label in the feed, then Performance Max coverage for the most
          profitable SKUs.
        </p>
      </header>

      <div className="cs-index-list">
        {studies.map((study) => {
          const story = study.story
          if (!story) return null

          return (
            <Link
              key={study.id}
              className="cs-index-card"
              to={getCaseStudyPath(study)}
            >
              <div className="cs-index-card__media">
                <img src={story.heroImage} alt="" />
              </div>
              <div className="cs-index-card__copy">
                <p className="cs-index-card__client">{study.client}</p>
                <h2>{study.title}</h2>
                <p>{study.summary}</p>
                <div className="cs-index-card__stats">
                  {story.results.map((stat) => (
                    <div key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
                <span className="cs-index-card__cta">Read case study</span>
              </div>
            </Link>
          )
        })}
      </div>

      <section className="cs-cta" aria-labelledby="cs-index-cta-heading">
        <h2 id="cs-index-cta-heading">Want this kind of read on your mix?</h2>
        <Link className="cs-cta__button" to={{ pathname: '/', hash: 'book' }}>
          Book a discovery call
        </Link>
      </section>
    </article>
  )
}
