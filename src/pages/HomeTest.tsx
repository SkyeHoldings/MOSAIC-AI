import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MosaicLogo } from '../components/MosaicLogo'
import { SmsConsent } from '../components/SmsConsent'
import { sendSiteNotification } from '../data/briefNotify'
import './home-test.css'

const NAV = [
  { href: '#how', label: 'How we work' },
  { href: '#work', label: 'Case studies' },
  { href: '/services', label: 'Services' },
] as const

const STEPS = [
  {
    n: '01',
    title: 'See the picture',
    body: 'A growth audit of media, creative, and follow-up — so the plan starts from what is already in market.',
  },
  {
    n: '02',
    title: 'Build the system',
    body: 'Monthly content, paid media, and a destination that converts. One team owns the pieces that usually sit in separate shops.',
  },
  {
    n: '03',
    title: 'Steer it',
    body: 'Reporting you can read, and a standing consultation so the work changes when the numbers do.',
  },
] as const

const STATS = [
  { value: '+$200M', label: 'Managed in ad spend' },
  { value: '10 years', label: 'In market' },
  { value: '+14.5%', label: 'Red Robin guests, YouTube on Performance Max' },
] as const

const WORK = [
  {
    client: 'Red Robin',
    title: 'YouTube on top of Performance Max',
    stat: '+14.5% guest traffic',
    href: '/case-studies/red-robin',
    image: '/work/red-robin/appetizer-platter.png',
    alt: 'Red Robin appetizer platter',
  },
  {
    client: 'GUCCI',
    title: 'Performance Max, built like couture',
    stat: 'Campaign systems',
    href: '/work/gucci',
    image: '/work/gucci/emerald-portrait.png',
    alt: 'GUCCI campaign portrait',
  },
  {
    client: "Bass Pro Shops / Cabela's",
    title: 'Outdoor retail, told in the store',
    stat: 'Brand and experience',
    href: '/work/bass-pro-cabelas',
    image: '/work/bass-pro-fishing-center.png',
    alt: "Bass Pro Shops fishing center",
  },
] as const

const LOGOS = [
  { label: 'Goldman Sachs', src: '/brands/goldman-sachs.png' },
  { label: 'Truist', src: '/brands/truist.png' },
  { label: 'Invesco', src: '/brands/invesco.png' },
  { label: 'GUCCI', src: '/brands/gucci.png' },
  { label: 'Red Robin', src: '/brands/red-robin.png' },
  { label: 'Bass Pro Shops', src: '/brands/bass-pro-shops.png' },
  { label: "Cabela's", src: '/brands/cabelas.png' },
] as const

type SubmitState = 'idle' | 'submitting' | 'succeeded' | 'error'

function fieldValue(form: HTMLFormElement, name: string) {
  const value = form.elements.namedItem(name)
  if (value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement) {
    return value.value.trim()
  }
  return ''
}

function HeroChart() {
  return (
    <svg
      className="ht-chart"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="#145e58"
        d="M0 230 L70 248 L120 190 L180 220 L240 150 L310 196 L370 128 L440 188 L510 110 L580 170 L650 96 L730 160 L800 88 L880 150 L960 70 L1040 140 L1120 86 L1200 160 L1280 74 L1360 130 L1440 58 L1440 320 L0 320 Z"
      />
      <path
        fill="#1c7d72"
        d="M0 262 L80 240 L150 286 L220 230 L300 270 L380 210 L460 258 L540 188 L630 246 L720 176 L810 230 L900 160 L990 214 L1080 148 L1170 200 L1260 136 L1350 188 L1440 120 L1440 320 L0 320 Z"
      />
      <path
        fill="#0f4c4a"
        d="M0 292 L90 270 L170 304 L250 258 L340 288 L430 240 L520 278 L620 230 L710 268 L810 222 L910 260 L1010 210 L1110 248 L1210 200 L1310 236 L1440 188 L1440 320 L0 320 Z"
      />
      <path
        fill="none"
        stroke="#d3f05f"
        strokeWidth="3"
        strokeDasharray="2 8"
        strokeLinejoin="round"
        d="M0 210 L60 176 L110 228 L170 150 L230 198 L300 112 L360 186 L430 96 L500 168 L570 78 L650 154 L720 64 L800 142 L870 52 L960 130 L1040 40 L1130 118 L1210 48 L1300 110 L1440 22"
      />
    </svg>
  )
}

export function HomeTest() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [smsConsent, setSmsConsent] = useState(false)
  const smsId = useId()

  useEffect(() => {
    const previous = document.title
    document.title = 'MOSAIC — Growth marketing partner'
    return () => {
      document.title = previous
    }
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitState === 'submitting') return

    const form = event.currentTarget
    const phone = fieldValue(form, 'phone')
    const phoneInput = form.elements.namedItem('phone') as HTMLInputElement | null

    if (smsConsent && !phone) {
      phoneInput?.setCustomValidity('Enter a mobile number to opt in to texts.')
      phoneInput?.reportValidity()
      return
    }

    phoneInput?.setCustomValidity('')
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const first = fieldValue(form, 'first')
    const last = fieldValue(form, 'last')
    const email = fieldValue(form, 'email')
    const company = fieldValue(form, 'company')
    const website = fieldValue(form, 'website')
    const note = fieldValue(form, 'note')

    setSubmitState('submitting')
    try {
      await sendSiteNotification({
        form_type: 'home-test',
        subject: `Homepage draft — ${first} ${last}${company ? ` · ${company}` : ''}`,
        name: `${first} ${last}`,
        email,
        phone,
        company,
        website,
        note,
        sms_consent: smsConsent ? 'yes' : 'no',
      })
      setSubmitState('succeeded')
      form.reset()
      setSmsConsent(false)
    } catch {
      setSubmitState('error')
    }
  }

  return (
    <div className="ht">
      <header className="ht-nav">
        <Link className="ht-nav__logo" to="/test" aria-label="MOSAIC">
          <MosaicLogo />
        </Link>

        <button
          type="button"
          className="ht-nav__toggle"
          aria-expanded={menuOpen}
          aria-controls="ht-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>

        <nav
          id="ht-menu"
          className={`ht-nav__links${menuOpen ? ' is-open' : ''}`}
          aria-label="Primary"
        >
          {NAV.map((item) =>
            item.href.startsWith('/') ? (
              <Link key={item.href} to={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ) : (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ),
          )}
          <a className="ht-pill" href="#start" onClick={() => setMenuOpen(false)}>
            Contact us
          </a>
        </nav>
      </header>

      <section className="ht-hero" aria-labelledby="ht-hero-title">
        <div className="ht-hero__copy">
          <h1 id="ht-hero-title">
            MOSAIC is your
            <span>growth marketing partner.</span>
          </h1>
          <p>
            We help brands grow by building the system that plans the work, makes
            the creative, and runs the media — then stays with it week to week.
          </p>
        </div>
        <HeroChart />
      </section>

      <section className="ht-intro" aria-labelledby="ht-intro-title">
        <h2 id="ht-intro-title">
          The work, in <span>one practice.</span>
        </h2>
        <p className="ht-intro__lead">
          Enterprise discipline, close enough to stay in the account. Faster than
          a stack of vendors, and built to be read by the person who owns the
          number.
        </p>
        <p>
          Strategy, creative, and paid media sit together. We own the plan and
          the execution, and we check progress on a schedule you can see.
        </p>
      </section>

      <section className="ht-how" id="how" aria-labelledby="ht-how-title">
        <div className="ht-how__panel">
          <div className="ht-how__main">
            <h2 id="ht-how-title">How it works</h2>
            <ol>
              {STEPS.map((step) => (
                <li key={step.n}>
                  <span>{step.n}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="ht-how__side" aria-hidden="true" />
        </div>
      </section>

      <section className="ht-proof" aria-labelledby="ht-proof-title">
        <h2 id="ht-proof-title">Proof from the work already in market</h2>
        <ul>
          {STATS.map((stat) => (
            <li key={stat.value}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ht-work" id="work" aria-labelledby="ht-work-title">
        <div className="ht-work__head">
          <h2 id="ht-work-title">Selected work</h2>
          <Link to="/case-studies">All case studies</Link>
        </div>
        <div className="ht-work__grid">
          {WORK.map((item) => (
            <Link key={item.client} className="ht-card" to={item.href}>
              <img src={item.image} alt={item.alt} />
              <p className="ht-card__client">{item.client}</p>
              <h3>{item.title}</h3>
              <p className="ht-card__stat">{item.stat}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="ht-logos" aria-label="Brands">
        <p>Brands in the work</p>
        <ul>
          {LOGOS.map((logo) => (
            <li key={logo.label}>
              <img src={logo.src} alt={logo.label} />
            </li>
          ))}
        </ul>
      </section>

      <section className="ht-start" id="start" aria-labelledby="ht-start-title">
        <div className="ht-start__copy">
          <h2 id="ht-start-title">Let’s work together.</h2>
          <p>
            Women-owned, based in Coeur d’Alene. Enterprise work and local
            businesses, on the same system.
          </p>
          <a
            className="ht-pill ht-pill--ghost"
            href="https://calendly.com/skye-hellomosaic/30min?hide_gdpr_banner=1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a time
          </a>
        </div>

        {submitState === 'succeeded' ? (
          <p className="ht-start__done" role="status">
            Received. We’ll reply at the email you sent.
          </p>
        ) : (
          <form className="ht-form" onSubmit={onSubmit}>
            <label>
              First name
              <input name="first" autoComplete="given-name" required />
            </label>
            <label>
              Last name
              <input name="last" autoComplete="family-name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
            <label>
              Business
              <input name="company" autoComplete="organization" />
            </label>
            <label>
              Website
              <input name="website" type="url" placeholder="https://" />
            </label>
            <label className="ht-form__wide">
              Anything else
              <textarea name="note" rows={3} />
            </label>
            <div className="ht-form__wide">
              <SmsConsent
                id={smsId}
                tone="dark"
                checked={smsConsent}
                onChange={setSmsConsent}
              />
            </div>
            <button className="ht-pill" type="submit" disabled={submitState === 'submitting'}>
              {submitState === 'submitting' ? 'Sending…' : 'Send'}
            </button>
            {submitState === 'error' ? (
              <p className="ht-form__error" role="alert">
                That didn’t send. Try again, or book a time instead.
              </p>
            ) : null}
          </form>
        )}
      </section>

      <footer className="ht-foot">
        <MosaicLogo />
        <p>© {new Date().getFullYear()} MOSAIC · Coeur d’Alene, Idaho</p>
        <nav aria-label="Footer">
          <a href="mailto:skye@hellomosaic.ai">skye@hellomosaic.ai</a>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/">Current site</Link>
        </nav>
      </footer>
    </div>
  )
}
