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
        y="3.5"
        width="13"
        height="13"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.5 8h7M6.5 10.5h7M6.5 13h4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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
      <article className="fx-mock fx-mock--wide fx-mock--research">
        <header className="fx-mock__head">
          <div>
            <p className="fx-mock__eyebrow">Market research</p>
            <h3 className="fx-mock__title">Signal scan</h3>
          </div>
          <div className="fx-research__live" aria-hidden="true">
            <span className="fx-research__pulse" />
            Live
          </div>
        </header>

        <div className="fx-searchbar fx-searchbar--scan" aria-hidden="true">
          <span className="fx-searchbar__icon" />
          <span className="fx-searchbar__scanline" />
          <kbd>⌘K</kbd>
        </div>

        <div className="fx-research-grid" aria-hidden="true">
          <div className="fx-research-card fx-research-card--map is-hot">
            <span className="fx-research-card__label">Demand</span>
            <div className="fx-research-map">
              <span className="fx-research-map__node is-a" />
              <span className="fx-research-map__node is-b" />
              <span className="fx-research-map__node is-c" />
              <span className="fx-research-map__node is-d" />
              <span className="fx-research-map__ring" />
              <span className="fx-research-map__ring is-delay" />
            </div>
          </div>

          <div className="fx-research-card fx-research-card--wave">
            <span className="fx-research-card__label">Momentum</span>
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

          <div className="fx-research-card fx-research-card--radar">
            <span className="fx-research-card__label">Share</span>
            <div className="fx-research-radar">
              <span className="fx-research-radar__sweep" />
              <span className="fx-research-radar__dot is-1" />
              <span className="fx-research-radar__dot is-2" />
              <span className="fx-research-radar__dot is-3" />
            </div>
          </div>

          <div className="fx-research-card fx-research-card--spark">
            <span className="fx-research-card__label">Trend</span>
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
            </svg>
          </div>
        </div>
      </article>
    </div>
  )
}

function ContentScene() {
  return (
    <div className="fx-scene fx-scene--content">
      <article className="fx-mock fx-mock--editor">
        <header className="fx-mock__head">
          <div>
            <p className="fx-mock__eyebrow">Campaign draft · Harbor</p>
            <h3 className="fx-mock__title">Content studio</h3>
          </div>
          <div className="fx-mock__badge fx-mock__badge--mint">Drafting</div>
        </header>

        <div className="fx-editor">
          <p className="fx-editor__eyebrow">Headline options</p>
          <h4>Research that writes itself — without sounding automated.</h4>
          <p>
            A content system trained on Harbor’s voice. Draft, score, and publish with
            human taste in the loop.
          </p>
          <div className="fx-editor__chips" aria-hidden="true">
            <span>Rewrite warmer</span>
            <span>Shorten for paid</span>
            <span>Match brand bible</span>
          </div>
        </div>

        <div className="fx-editor-rail" aria-hidden="true">
          <div>
            <span>Voice match</span>
            <strong>94</strong>
          </div>
          <div>
            <span>Clarity</span>
            <strong>88</strong>
          </div>
          <div>
            <span>CTA strength</span>
            <strong>91</strong>
          </div>
        </div>
      </article>

      <div className="fx-float-note" aria-hidden="true">
        <strong>Studio score</strong>
        <span>94 · on-voice</span>
      </div>
    </div>
  )
}

function GrowthScene() {
  return (
    <div className="fx-scene fx-scene--growth">
      <article className="fx-mock fx-mock--dash">
        <header className="fx-mock__head">
          <div>
            <p className="fx-mock__eyebrow">Workspace admin</p>
            <h3 className="fx-mock__title">Growth controls</h3>
          </div>
          <div className="fx-mock__badge">This week</div>
        </header>

        <div className="fx-dash">
          <div className="fx-dash__card fx-dash__card--coral">
            <span>Creative velocity</span>
            <strong>+38%</strong>
            <div className="fx-dash__bars" aria-hidden="true">
              <i style={{ height: '42%' }} />
              <i style={{ height: '58%' }} />
              <i style={{ height: '51%' }} />
              <i style={{ height: '76%' }} />
              <i style={{ height: '88%' }} />
            </div>
          </div>
          <div className="fx-dash__card fx-dash__card--sky">
            <span>On-brand rate</span>
            <strong>96%</strong>
            <div className="fx-dash__meter" aria-hidden="true">
              <span style={{ width: '96%' }} />
            </div>
          </div>
          <div className="fx-dash__card fx-dash__card--wide">
            <span>Model access</span>
            <ul>
              <li>
                <i className="is-coral" /> Campaign drafting · Editors
              </li>
              <li>
                <i className="is-sky" /> Claim check · Legal + Brand
              </li>
              <li>
                <i className="is-mint" /> Publish · Admins only
              </li>
            </ul>
          </div>
        </div>
      </article>
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
        <p className="feature-showcase__eyebrow">What we build with</p>
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
