import { useEffect, useId, useState, type FormEvent } from 'react'
import { useForm, ValidationError } from '@formspree/react'
import { CalendlySection } from '../components/CalendlySection'
import { DigitalEarthCanvas } from '../components/DigitalEarthCanvas'
import { SmsConsent } from '../components/SmsConsent'

const FORMSPREE_ID =
  (import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined) || 'xpqvjowe'

const LEAD_SOURCES = [
  'Google / search',
  'Paid ads',
  'Website forms',
  'Phone calls',
  'Referrals',
  'Not sure',
] as const

const GETS = [
  {
    title: 'Three specific leaks',
    body: 'Where inquiries die before they become booked jobs — in plain English, not a dashboard.',
  },
  {
    title: 'Twenty minutes',
    body: 'Phone or in person. I look at how leads come in and what happens next. You tell me what’s true.',
  },
  {
    title: 'No invoice',
    body: 'No software demo. No proposal. This is a free check so real businesses can try the work.',
  },
] as const

const NEEDS = [
  {
    title: 'Honest feedback',
    body: 'What was useful, what was wrong, and what would make this worth doing again.',
  },
  {
    title: 'A real business',
    body: 'Owners in Coeur d’Alene, Spokane, and the Inland Northwest who already get some inquiries.',
  },
  {
    title: 'Permission to look',
    body: 'How leads arrive today — ads, Google, the website, missed calls — even if the answer is “I’m not sure.”',
  },
] as const

const STEPS = [
  {
    n: '01',
    title: 'Claim a slot',
    body: 'Tell me who you are and how leads come in. Or pick a time on the calendar.',
  },
  {
    n: '02',
    title: 'Try the check',
    body: 'We talk for 20 minutes. I name the three places booked work is most likely leaking.',
  },
  {
    n: '03',
    title: 'Tell me the truth',
    body: 'If it’s useful, say so. If it isn’t, I need that more. That’s how this gets better.',
  },
] as const

const LOOK_AT = [
  {
    title: 'The offer',
    body: 'Is what you sell clear enough that someone would actually pay for it — or even try it?',
  },
  {
    title: 'How people find you',
    body: 'Google, ads, the website, word of mouth. Who already knows you exist?',
  },
  {
    title: 'What happens after contact',
    body: 'Missed calls, slow follow-up, forms that sit. Paying customers expect more than a voicemail.',
  },
  {
    title: 'Whether you can see it',
    body: 'If I asked which source booked the most jobs last month, could you answer without guessing?',
  },
] as const

export function LeadLeakCheck() {
  const [state, handleSubmit] = useForm(FORMSPREE_ID)
  const [smsConsent, setSmsConsent] = useState(false)
  const [leadSource, setLeadSource] = useState('')
  const smsConsentId = useId()

  useEffect(() => {
    const previous = document.title
    document.title = 'Free Lead Leak Check · MOSAIC'
    return () => {
      document.title = previous
    }
  }, [])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget
    const phone = (
      form.elements.namedItem('phone') as HTMLInputElement | null
    )?.value.trim()

    if (smsConsent && !phone) {
      event.preventDefault()
      const phoneInput = form.elements.namedItem('phone') as HTMLInputElement
      phoneInput.setCustomValidity(
        'Please enter a mobile number to opt in to texts.',
      )
      phoneInput.reportValidity()
      return
    }

    const phoneInput = form.elements.namedItem('phone') as HTMLInputElement
    phoneInput.setCustomValidity('')
    void handleSubmit(event)
  }

  return (
    <article className="leak-page">
      <section className="assist-hero leak-hero" aria-labelledby="leak-heading">
        <div className="assist-hero__copy">
          <p className="leak-kicker">Free · Inland Northwest · Limited spots</p>
          <h1 id="leak-heading">See where your leads never become booked jobs.</h1>
          <p>
            A free 20-minute Lead Leak Check. Not a pitch. You try it. I tell
            you what I find. You tell me if it&apos;s actually useful.
          </p>
          <div className="leak-hero__actions">
            <a className="assist-trigger leak-hero__cta" href="#claim">
              Claim a free check
            </a>
            <a className="leak-hero__quiet" href="#how">
              How it works
            </a>
          </div>
        </div>
        <div className="assist-hero__visual" aria-hidden="true">
          <DigitalEarthCanvas />
        </div>
      </section>

      <section className="leak-band" aria-label="What this is">
        <p>
          I used to run marketing for national brands. I&apos;m bringing that
          back to local owners — and I need a small group to try this for free
          so I can see if the work holds up.
        </p>
      </section>

      <section className="leak-split" aria-labelledby="gets-heading">
        <div>
          <p className="leak-kicker">You get</p>
          <h2 id="gets-heading">The check itself.</h2>
          <ul className="leak-list">
            {GETS.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="leak-kicker">I need</p>
          <h2>The practice.</h2>
          <ul className="leak-list">
            {NEEDS.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="leak-steps" id="how" aria-labelledby="how-heading">
        <div className="leak-steps__intro">
          <p className="leak-kicker">How it works</p>
          <h2 id="how-heading">Try it. Then tell me what to change.</h2>
        </div>
        <ol className="leak-steps__grid">
          {STEPS.map((step) => (
            <li key={step.n} className="leak-step">
              <span className="leak-step__n">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="leak-look" aria-labelledby="look-heading">
        <div className="leak-look__intro">
          <p className="leak-kicker">What we look at</p>
          <h2 id="look-heading">The quiet places booked work disappears.</h2>
        </div>
        <div className="leak-look__grid">
          {LOOK_AT.map((item) => (
            <article key={item.title} className="leak-look__card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="leak-fit" aria-labelledby="fit-heading">
        <div>
          <p className="leak-kicker">This is for you if</p>
          <h2 id="fit-heading">You already get some interest.</h2>
          <ul>
            <li>You own or run a local business in the Inland Northwest.</li>
            <li>Leads come in — calls, forms, walk-ins — and some never turn into work.</li>
            <li>You can&apos;t always say which ads or listings booked the last job.</li>
            <li>You&apos;re willing to try a free check and give a straight opinion.</li>
          </ul>
        </div>
        <div>
          <p className="leak-kicker">This is not for you if</p>
          <h2>You want a quote today.</h2>
          <ul>
            <li>You&apos;re shopping retainers, packages, or a software demo this week.</li>
            <li>You don&apos;t have time to talk for 20 minutes.</li>
            <li>You want me to run ads before we&apos;ve looked at where leads die.</li>
            <li>You&apos;d rather I guess than tell you what I actually see.</li>
          </ul>
        </div>
      </section>

      <section className="leak-claim" id="claim" aria-labelledby="claim-heading">
        <div className="contact-grid leak-claim__grid">
          <div className="contact-info">
            <p className="leak-kicker">Claim a spot</p>
            <h2 id="claim-heading">Request the free check.</h2>
            <p>
              A handful of owners at a time. I&apos;ll confirm a 20-minute
              window and come with a short list of where booked jobs usually
              leak. You tell me what&apos;s true for you.
            </p>
          </div>

          {state.succeeded ? (
            <div className="contact-info">
              <h3 className="contact-sent-title">You&apos;re in</h3>
              <p>
                Thanks — I&apos;ll reply to confirm a time. If you already
                picked a slot below, I&apos;ll treat it as a Lead Leak Check,
                not a sales call.
              </p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <input type="hidden" name="form_type" value="lead_leak_check" />
              <input
                type="hidden"
                name="_subject"
                value="Lead Leak Check — hellomosaic.ai"
              />
              <input type="hidden" name="lead_source" value={leadSource} />

              <div className="field">
                <label htmlFor="leak-name">Name</label>
                <input id="leak-name" name="name" required autoComplete="name" />
                <ValidationError
                  prefix="Name"
                  field="name"
                  errors={state.errors}
                  className="form-note form-note-error"
                />
              </div>
              <div className="field">
                <label htmlFor="leak-email">Email</label>
                <input
                  id="leak-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                  className="form-note form-note-error"
                />
              </div>
              <div className="field">
                <label htmlFor="leak-company">Company</label>
                <input
                  id="leak-company"
                  name="company"
                  required
                  autoComplete="organization"
                />
                <ValidationError
                  prefix="Company"
                  field="company"
                  errors={state.errors}
                  className="form-note form-note-error"
                />
              </div>
              <div className="field">
                <label htmlFor="leak-phone">Mobile phone (optional)</label>
                <input
                  id="leak-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  onChange={(event) => event.currentTarget.setCustomValidity('')}
                />
                <ValidationError
                  prefix="Phone"
                  field="phone"
                  errors={state.errors}
                  className="form-note form-note-error"
                />
              </div>
              <div className="field">
                <label htmlFor="leak-source">How do most leads come in?</label>
                <select
                  id="leak-source"
                  value={leadSource}
                  onChange={(event) => setLeadSource(event.target.value)}
                >
                  <option value="">Not sure yet</option>
                  {LEAD_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="leak-notes">
                  What happens after a missed call?
                </label>
                <textarea
                  id="leak-notes"
                  name="notes"
                  placeholder="Voicemail, a text, the office calls back, nothing — whatever is true."
                />
              </div>

              <SmsConsent
                id={smsConsentId}
                tone="dark"
                checked={smsConsent}
                onChange={setSmsConsent}
              />

              <button className="btn" type="submit" disabled={state.submitting}>
                {state.submitting ? 'Sending…' : 'Request the free check'}
              </button>

              {state.errors ? (
                <p className="form-note form-note-error" role="alert">
                  Something went wrong — please try again in a moment.
                </p>
              ) : null}
            </form>
          )}
        </div>
      </section>

      <div className="leak-cal-intro">
        <p>Or pick a 20-minute window. I&apos;ll run it as a Lead Leak Check — not a discovery pitch.</p>
      </div>
      <CalendlySection
        label="Pick a 20-minute Lead Leak Check"
        title="Book a free Lead Leak Check with MOSAIC"
      />
    </article>
  )
}
