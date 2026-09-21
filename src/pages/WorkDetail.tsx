import { Link, Navigate, useParams } from 'react-router-dom'
import { getCaseStudy, getCaseStudyPath } from '../data/work'

export function WorkDetail() {
  const { id } = useParams()
  const study = id ? getCaseStudy(id) : undefined

  if (study?.published) {
    return <Navigate to={getCaseStudyPath(study)} replace />
  }

  if (!study) {
    return (
      <div className="not-found">
        <h1>Work not found</h1>
        <p>That case study doesn’t exist in this draft.</p>
        <Link className="text-link" to="/">
          Back to work
        </Link>
      </div>
    )
  }

  return (
    <>
      <section className="case-hero">
        <div className="kicker">{study.client}</div>
        <h1>{study.title}</h1>
        <p>{study.summary}</p>
      </section>

      <div
        className="case-visual"
        style={{ background: study.tileBg }}
        aria-hidden="true"
      />

      <section className="case-body">
        <aside className="case-meta">
          <div className="meta-block">
            <h4>Client</h4>
            <p>{study.client}</p>
          </div>
          <div className="meta-block">
            <h4>Capabilities</h4>
            <p>{study.tags.join(' · ')}</p>
          </div>
          <div className="meta-block">
            <h4>Studio note</h4>
            <p>
              Placeholder case study for structure. Swap in real work, metrics,
              and media when ready.
            </p>
          </div>
          <Link className="text-link" to="/">
            All work
          </Link>
        </aside>

        <div className="case-copy">
          <h2>The brief</h2>
          <p>
            {study.client} needed marketing that could move at product speed
            without sounding like every other AI-adjacent brand. The work had to
            feel specific — rooted in their category, their audience, and a
            visual language that wouldn’t age out in a quarter.
          </p>
          <h2>What we built</h2>
          <p>
            A clear positioning line, a modular creative system, and an
            AI-assisted production workflow with human taste as the final
            filter. The point wasn’t more output. It was better judgment,
            faster.
          </p>
          <h2>The result</h2>
          <p>
            A brand story teams can actually run: coherent across web, campaign,
            and content — with intelligence in the background where it belongs.
          </p>
        </div>
      </section>
    </>
  )
}
