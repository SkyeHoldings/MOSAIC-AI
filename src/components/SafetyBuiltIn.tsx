const cards = [
  {
    id: 'moderation',
    title: 'Empathy',
    body: 'We know this region — Coeur d’Alene, Spokane, and the communities between — so the work starts with people, not personas.',
  },
  {
    id: 'accountability',
    title: 'Awareness',
    body: 'We put local brands in front of the right neighbors at the right moment, across a market of more than 700,000.',
  },
  {
    id: 'provenance',
    title: 'Conversion',
    body: 'Awareness only matters when it turns into action — visits, calls, and customers who come back.',
  },
] as const

function IllustrationModeration() {
  return (
    <svg viewBox="0 0 160 120" fill="none" aria-hidden="true">
      <ellipse cx="80" cy="58" rx="46" ry="18" stroke="currentColor" strokeWidth="1.2" />
      <ellipse
        cx="80"
        cy="58"
        rx="28"
        ry="11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="2.5 3"
      />
      <path d="M52 42 80 18l28 24" stroke="currentColor" strokeWidth="1.2" />
      <path d="M56 78 80 102l24-24" stroke="currentColor" strokeWidth="1.2" />
      <line
        x1="80"
        y1="18"
        x2="80"
        y2="102"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <line
        x1="42"
        y1="58"
        x2="118"
        y2="58"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
    </svg>
  )
}

function IllustrationAccountability() {
  return (
    <svg viewBox="0 0 160 120" fill="none" aria-hidden="true">
      <path
        d="M48 78 80 30l32 48-32 18-32-18Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M80 30v66M48 78l64 0" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M56 66h48M62 54h36M68 42h24"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.7"
      />
      <line
        x1="48"
        y1="96"
        x2="112"
        y2="36"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <line
        x1="40"
        y1="50"
        x2="120"
        y2="86"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
    </svg>
  )
}

function IllustrationProvenance() {
  return (
    <svg viewBox="0 0 160 120" fill="none" aria-hidden="true">
      <ellipse
        cx="80"
        cy="60"
        rx="48"
        ry="34"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2.5 3"
      />
      <ellipse cx="80" cy="60" rx="34" ry="24" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="80" cy="60" rx="22" ry="15" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="80" cy="60" rx="10" ry="7" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="80" cy="60" r="2.5" fill="currentColor" />
    </svg>
  )
}

const illustrations = {
  moderation: IllustrationModeration,
  accountability: IllustrationAccountability,
  provenance: IllustrationProvenance,
} as const

export function SafetyBuiltIn() {
  return (
    <section className="safety" aria-labelledby="safety-heading">
      <div className="safety__header">
        <h2 id="safety-heading">Rooted in community</h2>
      </div>

      <div className="safety__grid">
        {cards.map((card) => {
          const Illustration = illustrations[card.id]
          return (
            <article key={card.id} className="safety-card">
              <div className="safety-card__art">
                <Illustration />
              </div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
