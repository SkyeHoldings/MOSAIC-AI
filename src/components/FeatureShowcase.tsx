import { useId, useRef, useState, type ReactNode } from 'react'

type FeatureId = 'agents' | 'search' | 'content' | 'growth'

type Feature = {
  id: FeatureId
  label: string
}

const features: Feature[] = [
  { id: 'agents', label: 'Client Intake' },
  { id: 'search', label: 'Market Research' },
  { id: 'content', label: 'Custom Content' },
  { id: 'growth', label: 'Growth Strategy' },
]

function IconAgents() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M10 3.2 4.2 6.2v7.6L10 16.8l5.8-3V6.2L10 3.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 8.2v4M8.2 10.2h3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <circle cx="9" cy="9" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.2 13.2 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconContent() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <rect
        x="3.5"
        y="4.5"
        width="13"
        height="11"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.8 13.2 8.4 10l2.1 2.1 1.5-1.6 2.2 2.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.2" cy="7.6" r="1.1" fill="currentColor" />
    </svg>
  )
}

function IconGrowth() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M4 14.5 8 10l3 3 5-6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 6.5h3.5V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const icons: Record<FeatureId, () => ReactNode> = {
  agents: IconAgents,
  search: IconSearch,
  content: IconContent,
  growth: IconGrowth,
}

function AgentsScene() {
  return (
    <div className="fx-scene fx-scene--agents">
      <article className="fx-mock fx-mock--board">
        <header className="fx-mock__head">
          <div>
            <p className="fx-mock__eyebrow">Client intake</p>
            <h3 className="fx-mock__title">Industry brief</h3>
          </div>
          <div className="fx-mock__badge">Outdoor retail</div>
        </header>

        <div className="fx-board">
          <aside className="fx-board__rail" aria-hidden="true">
            <span className="is-active" />
            <span />
            <span />
            <span />
          </aside>

          <div className="fx-board__main">
            <div className="fx-mock__tabs" aria-hidden="true">
              <span className="is-active">Intake</span>
              <span>Industry</span>
              <span>Goals</span>
              <span className="fx-mock__plus">+</span>
            </div>

            <ul className="fx-mock__list">
              <li>
                <span className="fx-mock__q">What does success look like this quarter?</span>
                <em>Goals</em>
              </li>
              <li className="is-focus">
                <span className="fx-mock__q">Which audiences and markets matter most?</span>
                <em>Audience</em>
                <span className="fx-mock__pin" aria-hidden="true" />
              </li>
              <li>
                <span className="fx-mock__q">Where should we prioritize media and creative?</span>
                <em>Media</em>
              </li>
              <li>
                <span className="fx-mock__q">Any seasonal peaks we should plan around?</span>
                <em>Calendar</em>
              </li>
              <li>
                <span className="fx-mock__q">Brand, legal, or claim constraints?</span>
                <em>Guardrails</em>
              </li>
            </ul>
          </div>
        </div>
      </article>

      <aside className="fx-chat" aria-label="Example intake conversation">
        <div className="fx-chat__row">
          <span className="fx-chat__avatar fx-chat__avatar--user" aria-hidden="true">
            J
          </span>
          <div>
            <strong>Jordan</strong>
            <p>Can you tailor this intake for outdoor retail?</p>
          </div>
        </div>
        <div className="fx-chat__row">
          <span className="fx-chat__avatar fx-chat__avatar--agent" aria-hidden="true">
            ✦
          </span>
          <div>
            <strong>MOSAIC Agent</strong>
            <p>Locked in. Your intake is customized for Outdoor Retail — ready when you are.</p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function SearchScene() {
  return (
    <div className="fx-scene fx-scene--search">
      <div className="fx-research-glow" aria-hidden="true" />
      <div className="fx-research-glow fx-research-glow--soft" aria-hidden="true" />

      <article className="fx-mock fx-mock--wide fx-mock--research">
        <header className="fx-mock__head">
          <div>
            <p className="fx-mock__eyebrow">Market research</p>
            <h3 className="fx-mock__title">Your market, mapped</h3>
          </div>
          <div className="fx-research__live" aria-hidden="true">
            <span className="fx-research__pulse" />
            Live scan
          </div>
        </header>

        <div className="fx-searchbar fx-searchbar--scan" aria-hidden="true">
          <span className="fx-searchbar__icon" />
          <span className="fx-searchbar__scanline" />
          <span className="fx-searchbar__hint">Scanning your category…</span>
          <kbd>⌘K</kbd>
        </div>

        <div className="fx-research-findings" aria-hidden="true">
          <span>Audience signals</span>
          <span>Demand pockets</span>
          <span>Creative gaps</span>
        </div>

        <div className="fx-research-grid" aria-hidden="true">
          <div className="fx-research-card fx-research-card--map is-hot">
            <span className="fx-research-card__label">Competitive landscape</span>
            <div className="fx-research-map">
              <span className="fx-research-map__beam" />
              <svg className="fx-research-map__links" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M30 22 L64 44" />
                <path d="M64 44 L40 70" />
                <path d="M30 22 L78 30" />
                <path d="M40 70 L64 44" />
              </svg>
              <span className="fx-research-map__node is-a" />
              <span className="fx-research-map__node is-b" />
              <span className="fx-research-map__node is-c" />
              <span className="fx-research-map__node is-d" />
              <span className="fx-research-map__ring" />
              <span className="fx-research-map__ring is-delay" />
              <span className="fx-research-map__tag is-1">You</span>
              <span className="fx-research-map__tag is-2">Whitespace</span>
            </div>
          </div>

          <div className="fx-research-card fx-research-card--wave">
            <span className="fx-research-card__label">Category momentum</span>
            <div className="fx-research-bars">
              <span style={{ ['--h' as string]: '42%' }} />
              <span style={{ ['--h' as string]: '68%' }} />
              <span style={{ ['--h' as string]: '55%' }} />
              <span style={{ ['--h' as string]: '86%' }} />
              <span style={{ ['--h' as string]: '74%' }} />
              <span style={{ ['--h' as string]: '93%' }} />
              <span style={{ ['--h' as string]: '61%' }} />
            </div>
          </div>

          <div className="fx-research-card fx-research-card--spark">
            <span className="fx-research-card__label">Interest over time</span>
            <svg
              className="fx-research-spark"
              viewBox="0 0 160 64"
              fill="none"
              aria-hidden="true"
            >
              <path
                className="fx-research-spark__fill"
                d="M0 52 C18 48 28 40 42 38 C58 36 66 46 80 34 C96 20 108 16 124 22 C138 26 148 18 160 12 V64 H0 Z"
              />
              <path
                className="fx-research-spark__line"
                d="M0 52 C18 48 28 40 42 38 C58 36 66 46 80 34 C96 20 108 16 124 22 C138 26 148 18 160 12"
              />
              <circle className="fx-research-spark__tip" cx="160" cy="12" r="3.5" />
            </svg>
          </div>

          <div className="fx-research-card fx-research-card--radar">
            <span className="fx-research-card__label">Share of voice</span>
            <div className="fx-research-radar">
              <span className="fx-research-radar__sweep" />
              <span className="fx-research-radar__dot is-1" />
              <span className="fx-research-radar__dot is-2" />
              <span className="fx-research-radar__dot is-3" />
            </div>
          </div>
        </div>
      </article>

      <aside className="fx-chat fx-chat--research" aria-label="Example research conversation">
        <div className="fx-chat__row">
          <span className="fx-chat__avatar fx-chat__avatar--user" aria-hidden="true">
            J
          </span>
          <div>
            <strong>Jordan</strong>
            <p>Where should we focus first?</p>
          </div>
        </div>
        <div className="fx-chat__row">
          <span className="fx-chat__avatar fx-chat__avatar--agent" aria-hidden="true">
            ✦
          </span>
          <div>
            <strong>MOSAIC Agent</strong>
            <p>
              Weekend outdoor shoppers look open — here’s who to reach, where to play, and what to
              say next.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function ContentScene() {
  return (
    <div className="fx-scene fx-scene--content">
      <article className="fx-mock fx-mock--editor fx-mock--atelier">
        <header className="fx-mock__head">
          <div>
            <p className="fx-mock__eyebrow">Brand brief · Trail &amp; Timber</p>
            <h3 className="fx-mock__title">Creative brief</h3>
          </div>
          <div className="fx-mock__badge fx-mock__badge--mint">In review</div>
        </header>

        <div className="fx-brief-meta" aria-hidden="true">
          <div>
            <span>Industry</span>
            <strong>Outdoor retail</strong>
          </div>
          <div>
            <span>Look</span>
            <strong>Lived-in, elevated</strong>
          </div>
          <div>
            <span>Season</span>
            <strong>Fall campaign</strong>
          </div>
        </div>

        <div className="fx-brief-crew" aria-hidden="true">
          <div className="fx-brief-crew__label">
            <span>Creative team</span>
            <em>Matched to category</em>
          </div>
          <ul className="fx-brief-crew__list">
            <li className="is-selected">
              <span className="fx-cast__avatar fx-cast__avatar--maya">MC</span>
              <div>
                <strong>Maya Chen</strong>
                <span>Lead photo</span>
              </div>
            </li>
            <li>
              <span className="fx-cast__avatar fx-cast__avatar--rio">RS</span>
              <div>
                <strong>Rio Santos</strong>
                <span>Illustration</span>
              </div>
            </li>
            <li>
              <span className="fx-cast__avatar fx-cast__avatar--jules">JK</span>
              <div>
                <strong>Jules Kim</strong>
                <span>Motion</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="fx-atelier">
          <div className="fx-mood" aria-hidden="true">
            <p className="fx-mood__label">Mood board</p>
            <div className="fx-mood__grid">
              <div className="fx-mood__cell fx-mood__cell--hero">
                <span className="fx-mood__sky" />
                <span className="fx-mood__ridge" />
                <span className="fx-mood__ridge fx-mood__ridge--near" />
                <span className="fx-mood__tag">Key visual</span>
              </div>
              <div className="fx-mood__cell fx-mood__cell--swatch">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="fx-mood__cell fx-mood__cell--type">
                <span>Aa</span>
                <em>Trail display</em>
              </div>
              <div className="fx-mood__cell fx-mood__cell--light">
                <span>Light</span>
                <em>Golden hour</em>
              </div>
              <div className="fx-mood__cell fx-mood__cell--material">
                <span>Materials</span>
                <em>Canvas · timber</em>
              </div>
            </div>
          </div>

          <div className="fx-brief-body">
            <div>
              <span>Objective</span>
              <p>
                A visual system that feels trail-ready and premium — distinctive in outdoor
                retail, never stock.
              </p>
            </div>
            <div>
              <span>Direction</span>
              <p>
                Natural light, grounded palette, product in place. Local artists own the
                stills, marks, and motion.
              </p>
            </div>
            <div>
              <span>Guardrails</span>
              <p>No glossy lifestyle tropes. No generic stock trails. Keep craft front and center.</p>
            </div>
          </div>
        </div>

        <div className="fx-cast-tags" aria-hidden="true">
          <span>Product stills</span>
          <span>Location day</span>
          <span>Brand film</span>
        </div>
      </article>
    </div>
  )
}

function GrowthScene() {
  return (
    <div className="fx-scene fx-scene--growth">
      <div className="fx-paid-glow" aria-hidden="true" />
      <div className="fx-paid-glow fx-paid-glow--hot" aria-hidden="true" />

      <article className="fx-mock fx-mock--dash fx-mock--paid">
        <header className="fx-mock__head">
          <div>
            <p className="fx-mock__eyebrow">Paid media · Solara Beauty</p>
            <h3 className="fx-mock__title">Campaign performance</h3>
          </div>
          <div className="fx-paid__live" aria-hidden="true">
            <span className="fx-paid__pulse" />
            Live
          </div>
        </header>

        <div className="fx-paid">
          <div className="fx-paid__hero" aria-hidden="true">
            <div className="fx-paid__hero-copy">
              <span>ROAS</span>
              <strong>4.8x</strong>
              <em>+1.2 vs last week</em>
            </div>
            <svg
              className="fx-paid__spark"
              viewBox="0 0 180 64"
              fill="none"
              aria-hidden="true"
            >
              <path
                className="fx-paid__spark-fill"
                d="M0 52 C16 50 28 44 42 40 C58 34 70 46 86 30 C102 14 118 18 134 22 C148 25 162 12 180 8 V64 H0 Z"
              />
              <path
                className="fx-paid__spark-line"
                d="M0 52 C16 50 28 44 42 40 C58 34 70 46 86 30 C102 14 118 18 134 22 C148 25 162 12 180 8"
              />
              <circle className="fx-paid__spark-tip" cx="180" cy="8" r="3.5" />
            </svg>
          </div>

          <div className="fx-paid__stats" aria-hidden="true">
            <div>
              <span>CPA</span>
              <strong>$18</strong>
            </div>
            <div>
              <span>CTR</span>
              <strong>3.4%</strong>
            </div>
            <div>
              <span>Spend</span>
              <strong>$12.4k</strong>
            </div>
          </div>

          <div className="fx-paid__channels" aria-hidden="true">
            <div className="fx-paid__channels-head">
              <span>Channel mix</span>
              <em>Health &amp; beauty</em>
            </div>
            <ul>
              <li>
                <div>
                  <strong>Meta</strong>
                  <span>42%</span>
                </div>
                <i style={{ ['--w' as string]: '42%' }} className="is-meta" />
              </li>
              <li>
                <div>
                  <strong>Google</strong>
                  <span>35%</span>
                </div>
                <i style={{ ['--w' as string]: '35%' }} className="is-google" />
              </li>
              <li>
                <div>
                  <strong>TikTok</strong>
                  <span>23%</span>
                </div>
                <i style={{ ['--w' as string]: '23%' }} className="is-tiktok" />
              </li>
            </ul>
          </div>

          <div className="fx-paid__ads" aria-hidden="true">
            <div className="fx-paid__ads-head">
              <span>Winning creatives</span>
              <em>3 live</em>
            </div>
            <div className="fx-paid__thumbs">
              <div className="fx-paid__thumb fx-paid__thumb--a">
                <span>Glow Serum</span>
                <em>2.4x</em>
              </div>
              <div className="fx-paid__thumb fx-paid__thumb--b">
                <span>Soft Reset</span>
                <em>2.1x</em>
              </div>
              <div className="fx-paid__thumb fx-paid__thumb--c">
                <span>Daily Ritual</span>
                <em>1.9x</em>
              </div>
            </div>
          </div>
        </div>
      </article>

      <aside className="fx-chat fx-chat--paid" aria-label="Example paid media conversation">
        <div className="fx-chat__row">
          <span className="fx-chat__avatar fx-chat__avatar--user" aria-hidden="true">
            J
          </span>
          <div>
            <strong>Jordan</strong>
            <p>Glow Serum is doing well — what should we do next?</p>
          </div>
        </div>
        <div className="fx-chat__row">
          <span className="fx-chat__avatar fx-chat__avatar--agent" aria-hidden="true">
            ✦
          </span>
          <div>
            <strong>MOSAIC Agent</strong>
            <p>Looks strong. I’ll lean into what’s working and keep exploring new angles.</p>
          </div>
        </div>
      </aside>
    </div>
  )
}

const scenes: Record<FeatureId, () => ReactNode> = {
  agents: AgentsScene,
  search: SearchScene,
  content: ContentScene,
  growth: GrowthScene,
}

export function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const tablistId = useId()
  const panelId = useId()
  const touchX = useRef<number | null>(null)

  const active = features[activeIndex]
  const Scene = scenes[active.id]

  function goTo(index: number) {
    const next = (index + features.length) % features.length
    if (next === activeIndex) return
    setActiveIndex(next)
    setAnimKey((k) => k + 1)
  }

  return (
    <section className="feature-showcase" aria-labelledby={tablistId}>
      <div className="feature-showcase__intro">
        <p className="feature-showcase__eyebrow">How we innovate</p>
        <h2 id={tablistId}>
          We build campaigns and content systems with AI and local artists —
          quietly, carefully, and with craft.
        </h2>
      </div>

      <div className="feature-tabs" role="tablist" aria-label="Capabilities">
        {features.map((feature, index) => {
          const Icon = icons[feature.id]
          const selected = index === activeIndex
          return (
            <button
              key={feature.id}
              type="button"
              role="tab"
              id={`${panelId}-tab-${feature.id}`}
              aria-selected={selected}
              aria-controls={panelId}
              className={`feature-tab${selected ? ' is-active' : ''}`}
              onClick={() => goTo(index)}
            >
              <span className="feature-tab__icon">
                <Icon />
              </span>
              <span>{feature.label}</span>
            </button>
          )
        })}
      </div>

      <div
        className={`feature-stage feature-stage--${active.id}`}
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${panelId}-tab-${active.id}`}
        onTouchStart={(event) => {
          touchX.current = event.changedTouches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          if (touchX.current == null) return
          const delta = (event.changedTouches[0]?.clientX ?? 0) - touchX.current
          touchX.current = null
          if (Math.abs(delta) < 48) return
          goTo(activeIndex + (delta < 0 ? 1 : -1))
        }}
      >
        <button
          type="button"
          className="feature-nav feature-nav--prev"
          aria-label="Previous capability"
          onClick={() => goTo(activeIndex - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="feature-nav feature-nav--next"
          aria-label="Next capability"
          onClick={() => goTo(activeIndex + 1)}
        >
          ›
        </button>

        <div className="feature-stage__inner" key={animKey}>
          <Scene />
        </div>
      </div>
    </section>
  )
}
