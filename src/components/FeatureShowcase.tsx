import { useId, useRef, useState, type ReactNode } from 'react'

type FeatureId = 'agents' | 'search' | 'content' | 'growth'

type Feature = {
  id: FeatureId
  label: string
}

const features: Feature[] = [
  { id: 'agents', label: 'AI Agents' },
  { id: 'search', label: 'Brand search' },
  { id: 'content', label: 'Content studio' },
  { id: 'growth', label: 'Growth controls' },
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
            <p className="fx-mock__eyebrow">Live agent board</p>
            <h3 className="fx-mock__title">Brand Ask Info</h3>
          </div>
          <div className="fx-mock__badge">3 agents online</div>
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
              <span className="is-active">Questions</span>
              <span>Answers</span>
              <span>Sources</span>
              <span className="fx-mock__plus">+</span>
            </div>

            <ul className="fx-mock__list">
              <li>
                <span className="fx-mock__q">What is our tone of voice for luxury launches?</span>
                <em>Brand bible</em>
              </li>
              <li className="is-focus">
                <span className="fx-mock__q">Where do we keep approved campaign assets?</span>
                <em>Library</em>
                <span className="fx-mock__pin" aria-hidden="true" />
              </li>
              <li>
                <span className="fx-mock__q">How should AI rewrite product copy for DTC?</span>
                <em>Playbook</em>
              </li>
              <li>
                <span className="fx-mock__q">What claims are approved for Northline?</span>
                <em>Legal</em>
              </li>
              <li>
                <span className="fx-mock__q">Which hero stills are cleared for Bass Pro?</span>
                <em>Assets</em>
              </li>
            </ul>
          </div>
        </div>
      </article>

      <aside className="fx-chat" aria-label="Example agent conversation">
        <div className="fx-chat__row">
          <span className="fx-chat__avatar fx-chat__avatar--user" aria-hidden="true">
            J
          </span>
          <div>
            <strong>Jordan</strong>
            <p>Where can I pull the approved hero stills for the Bass Pro shoot?</p>
          </div>
        </div>
        <div className="fx-chat__row">
          <span className="fx-chat__avatar fx-chat__avatar--agent" aria-hidden="true">
            ✦
          </span>
          <div>
            <strong>MOSAIC Agent</strong>
            <p>
              Brand Library → Outdoor Retail → Bass Pro / Heroes. I pinned the three
              approved frames and flagged the rights window.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function SearchScene() {
  return (
    <div className="fx-scene fx-scene--search">
      <article className="fx-mock fx-mock--wide">
        <header className="fx-mock__head">
          <div>
            <p className="fx-mock__eyebrow">Connected knowledge</p>
            <h3 className="fx-mock__title">Enterprise brand search</h3>
          </div>
          <div className="fx-mock__sources" aria-hidden="true">
            <span>Notion</span>
            <span>Drive</span>
            <span>Slack</span>
          </div>
        </header>

        <div className="fx-searchbar" aria-hidden="true">
          <span className="fx-searchbar__icon" />
          <span>Find voice, assets, and claims across connected tools…</span>
          <kbd>⌘K</kbd>
        </div>

        <div className="fx-search-layout">
          <div className="fx-search-results">
            <div className="fx-result is-hot">
              <span className="fx-result__source">Notion</span>
              <strong>GUCCI Performance Max playbook</strong>
              <p>Launch creative rules, forbidden phrases, and approved CTA set.</p>
            </div>
            <div className="fx-result">
              <span className="fx-result__source">Drive</span>
              <strong>Red Robin seasonal kit</strong>
              <p>Q2 social frames + localized restaurant overlays.</p>
            </div>
            <div className="fx-result">
              <span className="fx-result__source">Slack</span>
              <strong>#brand-legal decision log</strong>
              <p>Claim approvals for climate-tech messaging, March–June.</p>
            </div>
          </div>

          <aside className="fx-search-preview" aria-hidden="true">
            <p className="fx-mock__eyebrow">Preview</p>
            <strong>Approved CTA set</strong>
            <ul>
              <li>Shop the collection</li>
              <li>Find a location</li>
              <li>Book your visit</li>
            </ul>
            <div className="fx-search-preview__meta">
              <span>On-brand</span>
              <span>Legal cleared</span>
            </div>
          </aside>
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
          We build brands, campaigns, and content systems with AI and local
          artists — quietly, carefully, and with craft.
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
