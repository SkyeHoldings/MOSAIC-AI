import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ContactSection } from '../components/ContactSection'

type PackageTier = {
  id: string
  name: string
  blurb: string
  price: string
  meta: { label: string; value: string }[]
  chooseLabel: string
  includes: string[]
}

type ProjectPackage = {
  id: string
  name: string
  blurb: string
  price: string
  meta?: { label: string; value: string }[]
  includes: string[]
}

type ResultItem = {
  client: string
  body: string
  stats: { value: string; label: string }[]
}

const marketingPackages: PackageTier[] = [
  {
    id: 'core',
    name: 'Mosaic Core',
    blurb: 'Paid, follow-up, and converting destinations — with monthly video and photo so we own the content engine from day one.',
    price: '$10,000/mo',
    meta: [
      { label: 'Kickoff', value: 'Growth audit — $3,500' },
      { label: 'Commitment', value: 'Min 6 months' },
      { label: 'Ad spend', value: 'Client-funded (not included)' },
    ],
    chooseLabel: 'Included:',
    includes: [
      'Paid media management (recommended up to $5K/mo spend)',
      'Follow-up system — 2 campaign emails / month + 1 nurture flow (3 touchpoints)',
      'Landing page & offer support so ads have somewhere that converts',
      '1 video / month*',
      '1 photo shoot / month*',
      'Conversion tracking & monthly performance reporting',
      'Monthly strategy consultation',
    ],
  },
  {
    id: 'growth',
    name: 'Mosaic Growth',
    blurb: 'The sweet spot for most growing businesses — higher spend capacity, tighter testing, and bi-weekly steering on the same content-led system.',
    price: '$14,500/mo',
    meta: [
      { label: 'Kickoff', value: 'Brand + performance audit — $5,500' },
      { label: 'Commitment', value: 'Min 6 months' },
      { label: 'Ad spend', value: 'Client-funded (not included)' },
    ],
    chooseLabel: 'Included:',
    includes: [
      'Paid media management (recommended up to $15K/mo spend)',
      'Follow-up system — 4 campaign emails / month + lifecycle flow (3 touchpoints)',
      'Landing page CRO & offer testing',
      '1 video / month*',
      '1 photo shoot / month*',
      'Creative direction + testing roadmap*',
      'Conversion tracking & analytics setup',
      'Bi-weekly strategy consultation',
    ],
  },
  {
    id: 'full',
    name: 'Mosaic Full',
    blurb: 'For in-house teams that need higher volume, faster cadence, and enterprise-level paid leadership — more production, more touchpoints, weekly steering.',
    price: '$22,500/mo',
    meta: [
      { label: 'Kickoff', value: 'Full-funnel audit — $6,250' },
      { label: 'Commitment', value: 'Min 6 months' },
      { label: 'Ad spend', value: 'Client-funded (not included)' },
    ],
    chooseLabel: 'Included:',
    includes: [
      'Paid media management (recommended $15K–$50K+/mo spend)',
      'Follow-up system — 4 campaign emails / month + lifecycle flows (4 touchpoints)',
      'Landing page & website conversion support',
      '2 videos / month*',
      '1 photo shoot / month*',
      'Ad cutdowns & platform variants from each shoot*',
      'Creative direction + always-on testing program*',
      'Full-funnel measurement & reporting',
      'Weekly strategy consultation',
      'Priority production queue',
    ],
  },
]

const aiPackages: ProjectPackage[] = [
  {
    id: 'ai',
    name: 'Mosaic AI',
    blurb: 'For teams ready to turn AI into a real marketing system — faster output, tighter testing, and assistants that know the brand.',
    price: '$11,000/mo',
    meta: [
      { label: 'Kickoff', value: 'AI opportunity workshop — $4,000' },
      { label: 'Commitment', value: 'Min 6 months' },
      { label: 'Ad spend', value: 'Client-funded when paid is in scope' },
    ],
    includes: [
      'Brand voice system, prompt library & AI guardrails',
      'Up to 2 custom marketing assistants (GPT / workflow builds)',
      'Always-on ad creative iteration engine (copy + briefs)*',
      'AI-assisted content pipeline — email, social & SEO — with human QA',
      'Landing page / offer testing support',
      'Performance feedback loops into prompts & creatives',
      'Team enablement so your people can run the system',
      'Bi-weekly AI + growth consultation',
      'Monthly system upgrades & roadmap',
    ],
  },
]

const projectPackages: ProjectPackage[] = [
  {
    id: 'brand-full',
    name: 'Brand Launch Full',
    blurb: 'For businesses preparing to grow with a complete launch system.',
    price: '$15,500+',
    meta: [
      { label: 'Revisions', value: 'Up to 15 hours' },
      { label: 'Work with', value: 'A dedicated team' },
    ],
    includes: [
      'Full brand positioning',
      'Visual identity system',
      '5-page website design',
      'Launch creative package',
      'Messaging & copy framework',
      'Go-to-market plan',
    ],
  },
]

const results: ResultItem[] = [
  {
    client: 'Enterprise retail',
    body: 'Campaign systems that move from national craft to local activation without losing the brand.',
    stats: [
      { value: '$200M+', label: 'Ad spend managed' },
      { value: '10 yrs', label: 'Hands-on experience' },
    ],
  },
  {
    client: 'Local growth brands',
    body: 'Content and paid working as one system — clearer offers, sharper creative, better inbound.',
    stats: [
      { value: '3×', label: 'More consistent output' },
      { value: '1 team', label: 'Strategy to production' },
    ],
  },
  {
    client: 'Inland Northwest',
    body: 'Women-owned and rooted here — enterprise judgment with frontier proximity.',
    stats: [
      { value: 'CDA', label: 'Home base' },
      { value: '700K+', label: 'Regional market' },
    ],
  },
]

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}

function FadeIn({
  children,
  reduceMotion,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  reduceMotion: boolean
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(reduceMotion)

  useEffect(() => {
    const node = ref.current
    if (!node || reduceMotion) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [reduceMotion])

  return (
    <div
      ref={ref}
      className={`svc-fade${visible ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? ({ '--svc-fade-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}

function PackageCard({
  name,
  blurb,
  price,
  meta,
  chooseLabel,
  includes,
  onContact,
}: {
  name: string
  blurb: string
  price: string
  meta?: { label: string; value: string }[]
  chooseLabel: string
  includes: string[]
  onContact: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const preview = includes.slice(0, 3)
  const rest = includes.slice(3)
  const shown = expanded ? includes : preview

  return (
    <article className={`svc-card${expanded ? ' is-open' : ''}`}>
      <header className="svc-card__top">
        <h3>{name}</h3>
        <p className="svc-card__blurb">{blurb}</p>
        <p className="svc-card__price">{price}</p>
      </header>

      {meta && meta.length > 0 ? (
        <dl className="svc-card__meta">
          {meta.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="svc-card__includes">
        <p className="svc-card__choose">{chooseLabel}</p>
        <ul>
          {shown.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {rest.length > 0 ? (
          <button
            type="button"
            className="svc-text-link"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'See less' : 'See more'}
          </button>
        ) : null}
      </div>

      <button type="button" className="svc-btn svc-btn--ghost svc-card__cta" onClick={onContact}>
        Get started
      </button>
    </article>
  )
}

export function Services() {
  const [, setSearchParams] = useSearchParams()
  const reduceMotion = usePrefersReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const [heroStyle, setHeroStyle] = useState<CSSProperties>({ opacity: 1 })

  useEffect(() => {
    if (reduceMotion) {
      setHeroStyle({ opacity: 1 })
      return
    }

    let frame = 0

    const update = () => {
      frame = 0
      const hero = heroRef.current
      if (!hero) return
      const rect = hero.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height * 0.7, 1)))
      setHeroStyle({
        opacity: 1 - progress,
        transform: `translate3d(0, ${progress * -28}px, 0)`,
      })
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [reduceMotion])

  function goContact(capability?: string) {
    if (capability) {
      setSearchParams({ capability }, { replace: true })
    }
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="svc svc--branded">
      <section
        ref={heroRef}
        className="svc-hero"
        aria-labelledby="svc-hero-heading"
        style={heroStyle}
      >
        <div className="svc-hero__inner">
          <h1 id="svc-hero-heading">Pricing</h1>
          <p className="svc-hero__tag">This is what great work costs.</p>
          <a className="svc-hero__cue" href="#svc-packages" aria-label="Scroll to packages">
            <span />
          </a>
        </div>
      </section>

      <section className="svc-intro" aria-labelledby="svc-intro-heading">
        <FadeIn reduceMotion={reduceMotion}>
          <div className="svc-intro__inner">
            <h2 id="svc-intro-heading">
              Move further,
              <br />
              faster.
            </h2>
            <p>
              MOSAIC packages brand, paid, content, and AI under one system for Inland Northwest
              businesses — from first impression to lasting loyalty. Pick the engagement that fits
              where you are; we build the rest around it.
            </p>
            <button type="button" className="svc-btn svc-btn--solid" onClick={() => goContact()}>
              Book an Intro
            </button>
          </div>
        </FadeIn>
      </section>

      <section
        id="svc-packages"
        className="svc-packages"
        aria-labelledby="svc-packages-heading"
      >
        <FadeIn reduceMotion={reduceMotion}>
          <div className="svc-packages__head">
            <h2 id="svc-packages-heading">Marketing packages for growing businesses.</h2>
            <button type="button" className="svc-btn svc-btn--solid" onClick={() => goContact()}>
              Learn More
            </button>
          </div>
          <p className="svc-packages__note">
            Ad spend is always client-funded and not included in package pricing. Image and video
            production (*) is fulfilled through partners and quoted separately.
          </p>
        </FadeIn>

        <div className="svc-packages__grid">
          {marketingPackages.map((pkg, index) => (
            <FadeIn key={pkg.id} reduceMotion={reduceMotion} delay={index * 80}>
              <PackageCard
                name={pkg.name}
                blurb={pkg.blurb}
                price={pkg.price}
                meta={pkg.meta}
                chooseLabel={pkg.chooseLabel}
                includes={pkg.includes}
                onContact={() => goContact(pkg.name)}
              />
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="svc-packages svc-packages--ai" aria-labelledby="svc-ai-heading">
        <FadeIn reduceMotion={reduceMotion}>
          <div className="svc-packages__head">
            <h2 id="svc-ai-heading">AI for growing businesses.</h2>
            <button type="button" className="svc-btn svc-btn--solid" onClick={() => goContact()}>
              Learn More
            </button>
          </div>
        </FadeIn>

        <div className="svc-packages__grid svc-packages__grid--single">
          {aiPackages.map((pkg, index) => (
            <FadeIn key={pkg.id} reduceMotion={reduceMotion} delay={index * 80}>
              <PackageCard
                name={pkg.name}
                blurb={pkg.blurb}
                price={pkg.price}
                meta={pkg.meta}
                chooseLabel="Included:"
                includes={pkg.includes}
                onContact={() => goContact(pkg.name)}
              />
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="svc-packages svc-packages--projects" aria-labelledby="svc-brand-heading">
        <FadeIn reduceMotion={reduceMotion}>
          <div className="svc-packages__head">
            <h2 id="svc-brand-heading">Branding for growing businesses.</h2>
            <button type="button" className="svc-btn svc-btn--solid" onClick={() => goContact()}>
              Learn More
            </button>
          </div>
        </FadeIn>

        <div className="svc-packages__grid svc-packages__grid--single">
          {projectPackages.map((pkg, index) => (
            <FadeIn key={pkg.id} reduceMotion={reduceMotion} delay={index * 80}>
              <PackageCard
                name={pkg.name}
                blurb={pkg.blurb}
                price={pkg.price}
                meta={pkg.meta}
                chooseLabel="Included:"
                includes={pkg.includes}
                onContact={() => goContact(pkg.name)}
              />
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="svc-results" aria-labelledby="svc-results-heading">
        <FadeIn reduceMotion={reduceMotion}>
          <h2 id="svc-results-heading">
            We do great work.
            <br />
            And get great results.
          </h2>
        </FadeIn>
        <div className="svc-results__grid">
          {results.map((item, index) => (
            <FadeIn key={item.client} reduceMotion={reduceMotion} delay={index * 90}>
              <article className="svc-results__card">
                <h3>{item.client}</h3>
                <p>{item.body}</p>
                <div className="svc-results__stats">
                  {item.stats.map((stat) => (
                    <div key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      <FadeIn reduceMotion={reduceMotion}>
        <section className="svc-cta" aria-labelledby="svc-cta-heading">
          <h2 id="svc-cta-heading">Ready to grow? Book a free discovery call.</h2>
          <p>
            We partner with ambitious local businesses at every stage — and design the right
            starting point for where you are now.
          </p>
          <button type="button" className="svc-btn svc-btn--solid" onClick={() => goContact()}>
            Book a discovery call
          </button>
          <p className="svc-cta__alt">
            Or return{' '}
            <Link to="/" className="svc-cta__link">
              home
            </Link>
            .
          </p>
        </section>
      </FadeIn>

      <div className="svc-contact">
        <ContactSection />
      </div>
    </div>
  )
}
