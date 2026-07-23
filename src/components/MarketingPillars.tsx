import {
  useEffect,
  useId,
  useRef,
  useState,
  type AnimationEvent,
  type ReactNode,
} from 'react'
import { MosaicLogo } from './MosaicLogo'

type PillarId = 'planning' | 'strategy' | 'reporting' | 'growth'

type Pillar = {
  id: PillarId
  title: string
  subtitle: string
  summary: string
  icon: () => ReactNode
}

const AUTO_MS = 8000
const CHAR_MS = 18
const CHAR_MS_FAST = 8

function IconPlanning() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M5 15.5 9.2 4.5h1.6L15 15.5h-1.7l-.9-2.5H7.6l-.9 2.5H5Zm3.2-4h3.5L10 6.2 8.2 11.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconStrategy() {
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

function IconReporting() {
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
        d="M6.5 12.5v-2M10 12.5v-5M13.5 12.5v-3.5"
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
      <circle cx="10" cy="10" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 6.5v7M7.2 9.2 10 6.5l2.8 2.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const pillars: Pillar[] = [
  {
    id: 'planning',
    title: 'Planning & Creative',
    subtitle: 'Working with local artists',
    summary:
      'We start with brief, mood, and concept alongside local artists — then move into storyboards and asset systems that are ready for production.',
    icon: IconPlanning,
  },
  {
    id: 'strategy',
    title: 'Strategy & Optimization',
    subtitle: 'Enterprise level expertise',
    summary:
      'Audience maps, channel mix, and offer architecture come first — then we tune continuously against performance signals so the plan stays sharp.',
    icon: IconStrategy,
  },
  {
    id: 'growth',
    title: 'Activation & Growth',
    subtitle: 'Campaigns that keep moving in market',
    summary:
      'We launch, localize, and iterate in-market so campaigns keep compounding instead of going quiet after the first push.',
    icon: IconGrowth,
  },
  {
    id: 'reporting',
    title: 'Reporting & Insights',
    subtitle: 'What matters and how do we move forward',
    summary:
      'Clear readouts on what moved the needle — then next-step recommendations the team can actually act on.',
    icon: IconReporting,
  },
]

function StreamingText({
  text,
  active,
  reduceMotion,
  onComplete,
}: {
  text: string
  active: boolean
  reduceMotion: boolean
  onComplete?: () => void
}) {
  const [visibleCount, setVisibleCount] = useState(reduceMotion ? text.length : 0)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    completedRef.current = false

    if (!active) {
      setVisibleCount(0)
      return
    }

    if (reduceMotion) {
      setVisibleCount(text.length)
      if (!completedRef.current) {
        completedRef.current = true
        onCompleteRef.current?.()
      }
      return
    }

    setVisibleCount(0)
    let index = 0
    let timeoutId = 0

    const tick = () => {
      index += 1
      setVisibleCount(index)
      if (index >= text.length) {
        if (!completedRef.current) {
          completedRef.current = true
          onCompleteRef.current?.()
        }
        return
      }
      const char = text[index - 1]
      const delay = char === ' ' || char === ',' || char === '—' ? CHAR_MS_FAST : CHAR_MS
      timeoutId = window.setTimeout(tick, delay)
    }

    timeoutId = window.setTimeout(tick, 180)
    return () => window.clearTimeout(timeoutId)
  }, [text, active, reduceMotion])

  const visible = text.slice(0, visibleCount)
  const typing = active && !reduceMotion && visibleCount < text.length

  return (
    <p className="pillars__ai-stream">
      <span>{visible}</span>
      {typing ? <span className="pillars__ai-caret" aria-hidden="true" /> : null}
    </p>
  )
}

export function MarketingPillars() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [cycleKey, setCycleKey] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [inView, setInView] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [streamDone, setStreamDone] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const headingId = useId()

  const active = pillars[activeIndex] ?? pillars[0]
  const Icon = active.icon
  const autoplayPaused = !playing || !inView || reduceMotion

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.35 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setStreamDone(false)
  }, [active.id, cycleKey, inView])

  function goTo(index: number) {
    const next = (index + pillars.length) % pillars.length
    setActiveIndex(next)
    setCycleKey((key) => key + 1)
    setPlaying(true)
  }

  function selectPillar(index: number) {
    if (index === activeIndex) {
      setCycleKey((key) => key + 1)
      return
    }
    goTo(index)
  }

  function handleProgressEnd(event: AnimationEvent<HTMLSpanElement>) {
    if (event.animationName !== 'pillars-progress') return
    if (autoplayPaused) return
    goTo(activeIndex + 1)
  }

  return (
    <section ref={sectionRef} id="how-we-work" className="pillars" aria-labelledby={headingId}>
      <div className="pillars__intro">
        <p className="pillars__eyebrow">How we work</p>
        <h2 id={headingId}>The Mosaic Way</h2>
        <p className="pillars__subtitle">{active.subtitle}</p>
      </div>

      <div className="pillars__rails" role="tablist" aria-label="Marketing pillars">
        {pillars.map((pillar, index) => {
          const selected = index === activeIndex
          return (
            <button
              key={pillar.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`pillars__rail${selected ? ' is-active' : ''}${autoplayPaused ? ' is-paused' : ''}`}
              onClick={() => selectPillar(index)}
            >
              <span className="pillars__rail-track" aria-hidden="true">
                {selected && !reduceMotion ? (
                  <span
                    key={`${pillar.id}-${cycleKey}`}
                    className="pillars__rail-fill"
                    style={{ animationDuration: `${AUTO_MS}ms` }}
                    onAnimationEnd={handleProgressEnd}
                  />
                ) : null}
              </span>
              <strong>{pillar.title}</strong>
            </button>
          )
        })}
      </div>

      <div className="pillars__ai" aria-live="polite">
        <div className="pillars__ai-prompt">
          <span className="pillars__ai-badge" aria-hidden="true">
            <MosaicLogo />
          </span>
          <p key={`prompt-${active.id}-${cycleKey}`} className="pillars__ai-prompt-text">
            Summarize {active.title} for this brand.
          </p>
        </div>

        <div className="pillars__ai-status" aria-hidden="true">
          <span className="pillars__ai-thought">
            {streamDone ? 'Thought 2s' : 'Thinking…'}
          </span>
          <span className={`pillars__ai-plan${streamDone ? ' is-done' : ''}`}>
            <span className="pillars__ai-plan-icon" />
            {streamDone ? 'Summarized the process' : 'Drafting summary'}
            <em>{streamDone ? '1s' : ''}</em>
          </span>
        </div>

        <article
          key={`${active.id}-${cycleKey}`}
          className="pillars__ai-answer"
          aria-label={active.title}
        >
          <header className="pillars__ai-answer-head">
            <span className="pillars__ai-topic-icon">
              <Icon />
            </span>
            <h3>
              {active.title}
              <span className="pillars__ai-answer-tag"> @Inland Northwest</span>
            </h3>
          </header>

          <div className="pillars__ai-answer-body">
            <StreamingText
              text={active.summary}
              active={inView}
              reduceMotion={reduceMotion}
              onComplete={() => setStreamDone(true)}
            />
          </div>
        </article>

      </div>

      <div className="pillars__cta">
        <a className="pillars__button" href="#contact">
          Get started
        </a>
      </div>
    </section>
  )
}
