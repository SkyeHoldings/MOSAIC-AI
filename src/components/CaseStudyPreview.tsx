import { Link } from 'react-router-dom'
import { getCaseStudyPath, getPublishedCaseStudies } from '../data/work'

export function CaseStudyPreview() {
  const studies = getPublishedCaseStudies()

  return (
    <section className="home-cases" aria-labelledby="home-cases-heading">
      <div className="home-cases__head">
        <h2 id="home-cases-heading">Case studies</h2>
        <Link to="/case-studies">All case studies</Link>
      </div>

      <div className="home-cases__grid">
        {studies.map((study) => {
          const story = study.story
          if (!story) return null

          return (
            <Link
              key={study.id}
              className="home-cases__card"
              to={getCaseStudyPath(study)}
            >
              <div className="home-cases__media">
                <img src={story.heroImage} alt={story.heroImageAlt} />
              </div>
              <div className="home-cases__copy">
                <p className="home-cases__client">{study.client}</p>
                <h3>{study.title}</h3>
                <p>{study.summary}</p>
                <div className="home-cases__stats">
                  {story.results.map((stat) => (
                    <div key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
                <span className="home-cases__cta">Read case study</span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
