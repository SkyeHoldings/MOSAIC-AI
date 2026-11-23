import { useEffect, useRef, useState, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendlySection } from '../components/CalendlySection'
import { RecognitionStrip } from '../components/RecognitionStrip'
import { SafetyBuiltIn } from '../components/SafetyBuiltIn'
import './insurance-build.css'

const points = [
  { label: 'Full-service partner', icon: 'team' },
  { label: 'Built for agencies', icon: 'focus' },
  { label: 'Proven strategies', icon: 'hands' },
  { label: 'Custom reporting', icon: 'clear' },
  { label: 'AI in the workflow', icon: 'ai' },
] as const

const services = [
  {
    title: 'The foundation',
    body: 'We tighten what a buyer checks first: the website, the Google listing, the offer, and the way the agency introduces itself.',
  },
  {
    title: 'Agency website',
    body: 'A site the agency owns. Written so a local buyer understands who they are calling, and built to hold up in search.',
  },
  {
    title: 'Google Business Profile',
    body: 'The listing most people see before the website. Categories, photos, services, and reviews kept current.',
  },
  {
    title: 'Paid media',
    body: 'Search and social for people already looking for coverage, a quote, or a local agent. Spend stays the agency’s.',
  },
  {
    title: 'Search and content',
    body: 'Pages and posts shaped around the questions buyers type, the market you serve, and the way you actually explain coverage.',
  },
  {
    title: 'Video',
    body: 'You on camera, answering real questions. We handle topics, editing, and cutdowns for the places people already watch.',
  },
  {
    title: 'Content upkeep',
    body: 'Publishing, replies, and review responses so the presence stays active without taking the week.',
  },
  {
    title: 'Working sessions',
    body: 'Time together to turn what you know about coverage into language a buyer can follow and trust.',
  },
  {
    title: 'Reporting',
    body: 'What shipped, what changed, and what happens next. One view of the work, the spend, and the response.',
  },
] as const

const steps = [
  {
    n: '01',
    title: 'We research',
    line: 'The questions already being asked',
    body: 'We look at what people search before they call an agent in your market. That list becomes the brief for the site, the videos, and the ads.',
  },
  {
    n: '02',
    title: 'We build',
    line: 'Site, video, content, and ads in one voice',
    body: 'The website, the videos of you, the posts, and the ad copy are made to sound like the agency. The accounts and the files stay yours.',
  },
  {
    n: '03',
    title: 'We distribute',
    line: 'Where buyers already look',
    body: 'Search, Google Maps, social, reviews, and ads. One explanation of the agency, carried across the places people check.',
  },
  {
    n: '04',
    title: 'We track',
    line: 'What moved, and what did not',
    body: 'Which pieces people engaged with, where calls and forms came from, and which ads earned the spend. You can see it as it happens.',
  },
  {
    n: '05',
    title: 'We sharpen',
    line: 'Keep what works. Change what does not.',
    body: 'Topics, publishing, ads, and follow-up shift with the numbers. The next round is more specific than the last.',
  },
] as const

const stats = [
  { value: '$200M+', label: 'Ad spend managed', note: 'Across the work behind MOSAIC' },
  { value: '10 years', label: 'In market', note: 'Campaigns, content, and systems' },
  { value: '2', label: 'Awards from dentsu', note: 'Enterprise craft, applied locally' },
  { value: 'Yours', label: 'Site, accounts, creative', note: 'The agency keeps the assets' },
  { value: 'Visible', label: 'Spend and results', note: 'One report, no hidden dashboard' },
  { value: 'Both', label: 'Independent and captive', note: 'The plan starts from your rules' },
] as const

const faqs = [
  {
    q: 'Do you handle the whole program?',
    a: 'Strategy, the website, video, Google, social, content, ads, and reporting. If a carrier has rules, those get read before anything is built. You stay on the conversations that close. We keep the marketing moving.',
  },
  {
    q: 'Do I own the website and the accounts?',
    a: 'Yes. The domain, the Google Business Profile, the social accounts, the content, and the reporting access stay with the agency, whether or not we keep working together.',
  },
  {
    q: 'What if my carrier has specific rules?',
    a: 'For captive agents, we read the carrier documents you share before we agree to a plan. Those rules shape what we publish. Independent agents have more room, and we still keep claims accurate.',
  },
  {
    q: 'Can I see what you are doing?',
    a: 'Yes. You can see what published, how it performed, where inquiries came from, and what we are changing next.',
  },
  {
    q: 'Can I add video or more media later?',
    a: 'Yes. Start with the foundation and add video, content, or paid media when the agency is ready. The pieces are built to stack.',
  },
  {
    q: 'How many leads will I get?',
    a: 'It depends on the market, the spend, the current presence, and how crowded the area is. On the call we will say what looks realistic for an agency like yours. We do not promise a lead count up front.',
  },
  {
    q: 'How will I know it is working?',
    a: 'We show what shipped, what people engaged with, where calls or forms came from, and what we are changing next. We do not pick a flattering month and call it the program.',
  },
  {
    q: 'Why would I need to be on video?',
    a: 'Insurance is a personal hire. A real answer from you is easier to trust than a template or a stock spokesperson. We help with the topics, the edit, and where it runs.',
  },
  {
    q: 'How do you handle compliance?',
    a: 'Insurance content has to be useful and careful. Carrier rules, platform rules, and accuracy are part of the plan from the start, not a review tacked on at the end.',
  },
] as const

function PointIcon({ name }: { name: (typeof points)[number]['icon'] }) {
  const common = {
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    'aria-hidden': true,
  } as const

  if (name === 'team') {
    return (
      <svg {...common}>
        <circle cx="16" cy="11" r="3.2" />
        <path d="M9.5 22.5c.8-3 3.2-4.6 6.5-4.6s5.7 1.6 6.5 4.6" />
        <circle cx="7.2" cy="13" r="2.1" />
        <circle cx="24.8" cy="13" r="2.1" />
        <path d="M4.2 22c.5-2 1.9-3.2 3.6-3.5M27.8 22c-.5-2-1.9-3.2-3.6-3.5" />
      </svg>
    )
  }
  if (name === 'focus') {
    return (
      <svg {...common}>
        <circle cx="16" cy="16" r="7.5" />
        <circle cx="16" cy="16" r="2.2" />
        <path d="M16 4.5v3.2M16 24.3v3.2M4.5 16h3.2M24.3 16h3.2" />
      </svg>
    )
  }
  if (name === 'hands') {
    return (
      <svg {...common}>
        <path d="M8 16.5c0-2.2 1.6-3.5 3.2-2.2L16 18l4.8-3.7c1.6-1.3 3.2 0 3.2 2.2V21c0 3.2-2.6 5.5-8 5.5s-8-2.3-8-5.5v-4.5z" />
        <path d="M12.2 13.2V9.8a1.8 1.8 0 0 1 3.6 0v4.2M19.8 12.4V8.6a1.8 1.8 0 0 1 3.6 0v6" />
      </svg>
    )
  }
  if (name === 'clear') {
    return (
      <svg {...common}>
        <circle cx="16" cy="16" r="3" />
        <path d="M16 6.5v2.2M16 23.3v2.2M6.5 16h2.2M23.3 16h2.2M9.2 9.2l1.6 1.6M21.2 21.2l1.6 1.6M22.8 9.2l-1.6 1.6M10.8 21.2l-1.6 1.6" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <circle cx="16" cy="16" r="8" />
      <path d="M16 12.2v4.2l2.6 1.6" />
      <path d="M16 8.2V6.4M16 25.6v-1.8M8.2 16H6.4M25.6 16h-1.8" />
    </svg>
  )
}

export function InsuranceBuild() {
  const { pathname } = useLocation()
  const servicesRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const previous = document.title
    document.title = 'MOSAIC | Marketing for insurance agencies'
    if (pathname === '/') return () => {
      document.title = previous
    }
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => {
      document.title = previous
      robots.remove()
    }
  }, [pathname])

  const scrollRow = (ref: RefObject<HTMLDivElement | null>, direction: number) => {
    const row = ref.current
    if (!row) return
    const card = row.querySelector<HTMLElement>(':scope > *')
    const gap = 16
    const amount = (card?.offsetWidth ?? 320) + gap
    row.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <div className="ib">
      <section className="ib-hero" aria-labelledby="ib-hero-heading">
        <h1 id="ib-hero-heading">
          A modern-day lead generation system{' '}
          <em>for insurance agencies</em>
        </h1>
        <p className="ib-hero__proof">
          We&apos;ve worked with 400+ insurance agents across the United States
        </p>
        <div className="ib-hero__actions">
          <a className="ib-btn" href="#book">
            Book a call
          </a>
          <a className="ib-btn ib-btn--ghost" href="#services">
            See the process
          </a>
        </div>
        <ul className="ib-points">
          {points.map((point) => (
            <li key={point.label}>
              <PointIcon name={point.icon} />
              <span>{point.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ib-section ib-situation" aria-labelledby="ib-both-heading">
        <p className="ib-kicker ib-kicker--pill">Built for your situation</p>
        <h2 id="ib-both-heading">We work with both.</h2>
        <div className="ib-split">
          <article className="ib-card">
            <h3>Independent agents</h3>
            <p>
              You need room to add work as the book grows, and to keep the site,
              the accounts, and the content in your name.
            </p>
            <ul>
              <li>Choose what to add as you scale</li>
              <li>Own the website, accounts, and content</li>
              <li>No carrier template to write around</li>
              <li>Room to test offers and markets</li>
            </ul>
          </article>
          <article className="ib-card">
            <h3>Captive agents</h3>
            <p>
              The carrier’s rules come first. We read them before anything is
              built, so you are not guessing what is allowed.
            </p>
            <ul>
              <li>Carrier documents reviewed before launch</li>
              <li>The plan is written inside those rules</li>
              <li>Boundaries stay in the published work</li>
              <li>The license is treated as the constraint</li>
            </ul>
          </article>
        </div>
        <p className="ib-note">
          Either way, the marketing should sound like you. Not like a template
          with the agency name swapped in.
        </p>
      </section>

      <section className="ib-section" aria-labelledby="ib-path-heading">
        <p className="ib-kicker">Your brand, in the places people look</p>
        <h2 id="ib-path-heading">Where the agency shows up matters.</h2>
        <div className="ib-path">
          <div className="ib-path__copy">
            <p>
              Buyers meet you on Google, on social, in reviews, and in ads. If
              those places tell different stories, the agency looks smaller than
              it is. If they sound like the same person, trust starts before the
              call.
            </p>
            <p>
              We keep that voice consistent. One system, across the channels a
              local buyer actually checks.
            </p>
          </div>
          <div className="ib-path__steps">
            <p className="ib-kicker">The buyer path</p>
            <h3>Four moments before the call</h3>
            <ol>
              <li>
                <strong>They search</strong>
                <span>Local insurance, a specific coverage, or a problem they can name.</span>
              </li>
              <li>
                <strong>They scan</strong>
                <span>The website, the reviews, and what you explain about the agency.</span>
              </li>
              <li>
                <strong>They compare</strong>
                <span>Your answer against other agencies and whatever else they have read.</span>
              </li>
              <li>
                <strong>They decide</strong>
                <span>A call, a form, or the next agency on the list.</span>
              </li>
            </ol>
          </div>
        </div>
        <ul className="ib-chips">
          <li>
            <span>Be found</span>
            Website · Search · Google
          </li>
          <li>
            <span>Be understood</span>
            Video · Content · Ads
          </li>
          <li>
            <span>Stay trusted</span>
            Reporting · Upkeep · Sessions
          </li>
        </ul>
      </section>

      <RecognitionStrip />

      <section className="ib-section ib-section--paper" id="services" aria-labelledby="ib-services-heading">
        <div className="ib-section__bar">
          <div>
            <p className="ib-kicker ib-kicker--pill">The Process</p>
            <h2 id="ib-services-heading">
              How we help your agency
            </h2>
            <p className="ib-section__lead">
              Start with the foundation, then add what the agency needs. Each piece
              makes the agency easier to find, easier to understand, and easier to
              trust before the quote call.
            </p>
          </div>
          <div className="ib-arrows" aria-hidden="false">
            <button type="button" aria-label="Previous service" onClick={() => scrollRow(servicesRef, -1)}>
              <span>←</span>
            </button>
            <button type="button" aria-label="Next service" onClick={() => scrollRow(servicesRef, 1)}>
              <span>→</span>
            </button>
          </div>
        </div>
        <div className="ib-row" ref={servicesRef}>
          {services.map((service, index) => (
            <article className="ib-service" key={service.title}>
              <span className="ib-service__index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
            </article>
          ))}
        </div>
        <div className="ib-section__links">
          <a className="ib-btn ib-btn--ink" href="#book">
            Get started
          </a>
        </div>
      </section>

      <section className="ib-section" id="method" aria-labelledby="ib-method-heading">
        <div className="ib-section__bar">
          <div>
            <p className="ib-kicker">How the work moves</p>
            <h2 id="ib-method-heading">Research, build, publish, then sharpen.</h2>
            <p className="ib-section__lead">
              A base people can find. Useful answers. Distribution. A record of
              what responded. A tighter round after that.
            </p>
          </div>
          <div className="ib-arrows">
            <button type="button" aria-label="Previous step" onClick={() => scrollRow(stepsRef, -1)}>
              <span>←</span>
            </button>
            <button type="button" aria-label="Next step" onClick={() => scrollRow(stepsRef, 1)}>
              <span>→</span>
            </button>
          </div>
        </div>
        <div className="ib-row" ref={stepsRef}>
          {steps.map((step) => (
            <article className="ib-step" key={step.n}>
              <span className="ib-step__n">{step.n}</span>
              <h3>{step.title}</h3>
              <p className="ib-step__line">{step.line}</p>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ib-section ib-section--ink" aria-labelledby="ib-numbers-heading">
        <p className="ib-kicker">The record behind the work</p>
        <h2 id="ib-numbers-heading">
          What we can show.
          <br />
          What the agency keeps.
        </h2>
        <p className="ib-section__lead">
          Marketing should make the agency easier to understand. It should not
          lock you into assets you do not control, or a lead count nobody can
          stand behind.
        </p>
        <dl className="ib-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>
                <strong>{stat.value}</strong>
                <span>{stat.note}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="ib-trust">
          <article>
            <h3>No selected months</h3>
            <p>We show what shipped, what changed, and what the numbers say about this agency.</p>
          </article>
          <article>
            <h3>The work stays visible</h3>
            <p>Spend, creative, and response live in one place. Nothing is kept off to the side.</p>
          </article>
          <article>
            <h3>You keep what we make</h3>
            <p>The website, the accounts, the content, and the reporting access stay with you.</p>
          </article>
        </div>
      </section>

      <SafetyBuiltIn
        heading="From notice to the call"
        empathy="Insurance is a personal hire. A local buyer looks for a person at the agency they can trust before the quote call, not a template."
        awareness="The agency shows up where that buyer already looks — search, Google, and reviews — so it is found before they call."
        conversion="Being seen only matters when it becomes a call, a form, or a quote conversation."
      />

      <section className="ib-close" aria-labelledby="ib-close-heading">
        <h2 id="ib-close-heading">Bring the agency. We’ll bring a plan.</h2>
        <p>Pick a time. A working conversation about the market, the rules, and what to build first.</p>
        <a className="ib-btn ib-btn--ink ib-btn--wide" href="#book">
          Book a call
        </a>
      </section>

      <CalendlySection />

      <section className="ib-section" aria-labelledby="ib-faq-heading">
        <p className="ib-kicker">Straight answers</p>
        <h2 id="ib-faq-heading">What agency owners ask first.</h2>
        <div className="ib-faq">
          {faqs.map((item, index) => {
            const open = openFaq === index
            return (
              <div className={`ib-faq__item${open ? ' is-open' : ''}`} key={item.q}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : index)}
                >
                  <span>{item.q}</span>
                  <span className="ib-faq__mark" aria-hidden="true">
                    {open ? '–' : '+'}
                  </span>
                </button>
                {open && <p>{item.a}</p>}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
