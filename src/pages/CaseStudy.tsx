import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCaseStudy } from '../data/work'

const TOC = [
  { id: 'starting-point', label: 'Starting point' },
  { id: 'solution', label: 'Solution' },
  { id: 'business-impact', label: 'Business Impact' },
] as const

export function CaseStudy() {
  const { id } = useParams()
  const study = id ? getCaseStudy(id) : undefined
  const story = study?.published ? study.story : undefined
  const [active, setActive] = useState<string>(TOC[0].id)

  useEffect(() => {
    if (!study || !story) return
    const previous = document.title
    document.title = `${story.seoTitle} · MOSAIC`
    return () => {
      document.title = previous
    }
  }, [study, story])

  useEffect(() => {
    if (!story) return

    const nodes = TOC.map((item) => document.getElementById(item.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const next = visible?.target.id
        if (next) setActive(next)
      },
      { rootMargin: '-28% 0px -55% 0px', threshold: [0, 0.2, 0.5, 1] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [story])

  if (!study || !story) {
    return (
      <div className="not-found">
        <h1>Case study not found</h1>
        <p>That write-up is not live yet.</p>
        <Link className="text-link" to="/case-studies">
          All case studies
        </Link>
      </div>
    )
  }

  return (
    <article className="cs-page">
      <section className="cs-hero">
        <div className="cs-hero__copy">
          <p className="cs-badge">Case study</p>
          <nav className="cs-crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true"> / </span>
            <Link to="/case-studies">Case studies</Link>
            <span aria-hidden="true"> / </span>
            <span>{study.client}</span>
          </nav>
          <h1>{study.client}</h1>
          <p className="cs-date">
            <CalendarIcon />
            {story.date}
          </p>

          <div className="cs-results">
            <p className="cs-results__label">Results</p>
            <div className="cs-results__stats">
              {story.results.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cs-services">
            <h2>Services</h2>
            <ul>
              {story.services.map((service, index) => (
                <li
                  key={service}
                  className={index === 0 ? 'is-filled' : undefined}
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="cs-hero__media">
          <img src={story.heroImage} alt={story.heroImageAlt} />
        </div>
      </section>

      <div className="cs-shell">
        <nav className="cs-toc" aria-label="Table of contents">
          <p>Table of contents</p>
          <ol>
            {TOC.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={active === item.id ? 'is-active' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="cs-article">
          <section id="starting-point" className="cs-section">
            <h2>Starting point</h2>
            {story.startingPoint.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </section>

          <section id="solution" className="cs-section">
            <h2>Solution</h2>
            {story.solution.map((block) => (
              <div key={block.heading} className="cs-solution">
                <p className="cs-solution__eyebrow">{block.eyebrow}</p>
                <h3>{block.heading}</h3>
                {block.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            ))}
          </section>

          <section id="business-impact" className="cs-section cs-section--impact">
            <h2>Business Impact</h2>
            <div className="cs-impact-stats">
              {story.impact.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
            {story.impactBody.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
            <p className="cs-method">{story.methodNote}</p>
          </section>
        </div>
      </div>

      <section className="cs-cta" aria-labelledby="cs-cta-heading">
        <h2 id="cs-cta-heading">Want this kind of read on your mix?</h2>
        <Link className="cs-cta__button" to={{ pathname: '/', hash: 'book' }}>
          Book a discovery call
        </Link>
      </section>
    </article>
  )
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10h17" />
    </svg>
  )
}
