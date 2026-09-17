import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { sendSiteNotification } from '../data/briefNotify'
import { expertise } from '../data/work'
import { SmsConsent } from './SmsConsent'

const INTEREST_OPTIONS = [
  ...expertise.map((item) => item.title),
  "Don't Know Yet",
] as const

type SubmitState = 'idle' | 'submitting' | 'succeeded' | 'error'

function readPrefill(search: string) {
  const params = new URLSearchParams(search)
  const capability = params.get('capability')?.trim() ?? ''

  return {
    capability: (INTEREST_OPTIONS as readonly string[]).includes(capability)
      ? capability
      : '',
  }
}

function fieldValue(form: HTMLFormElement, name: string) {
  const value = form.elements.namedItem(name)
  if (value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement) {
    return value.value.trim()
  }
  return ''
}

export function ContactSection() {
  const { search } = useLocation()
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [open, setOpen] = useState(false)
  const [capability, setCapability] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const menusRef = useRef<HTMLDivElement>(null)
  const capabilityId = useId()
  const smsConsentId = useId()

  useEffect(() => {
    const prefill = readPrefill(search)
    if (prefill.capability) setCapability(prefill.capability)
  }, [search])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menusRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitState === 'submitting') return

    const form = event.currentTarget
    const phone = fieldValue(form, 'phone')
    const phoneInput = form.elements.namedItem('phone') as HTMLInputElement | null

    if (smsConsent && !phone) {
      phoneInput?.setCustomValidity(
        'Please enter a mobile number to opt in to texts.',
      )
      phoneInput?.reportValidity()
      return
    }

    phoneInput?.setCustomValidity('')
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const name = fieldValue(form, 'name')
    const email = fieldValue(form, 'email')
    const company = fieldValue(form, 'company')
    const interest = capability.trim() || 'Not specified'
    const subject = company
      ? `Contact — ${name} · ${company}`
      : `Contact — ${name}`

    setSubmitState('submitting')
    try {
      await sendSiteNotification({
        form_type: 'contact',
        _subject: subject,
        name,
        email,
        company,
        phone,
        capability: interest,
        sms_opt_in: smsConsent ? 'yes' : 'no',
        message: [
          'Contact form — hellomosaic.ai',
          `Name: ${name}`,
          `Email: ${email}`,
          company ? `Company: ${company}` : '',
          phone ? `Phone: ${phone}` : '',
          `Interest: ${interest}`,
          `SMS opt-in: ${smsConsent ? 'yes' : 'no'}`,
        ]
          .filter(Boolean)
          .join('\n'),
      })
      setSubmitState('succeeded')
    } catch {
      setSubmitState('error')
    }
  }

  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-heading">
      <div className="contact-grid">
        <div className="contact-info">
          <h2 id="contact-heading">We&apos;re Here to Help</h2>
          <p>
            MOSAIC works with business owners within the Inland Northwest to
            create marketing and AI systems that bring clarity, consistency, and
            room to grow — without the noise.
          </p>
        </div>

        {submitState === 'succeeded' ? (
          <div className="contact-info">
            <h3 className="contact-sent-title">Message sent</h3>
            <p>
              Thanks — we’ll reply with next steps, usually a short intro call.
            </p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={onSubmit}>
            <input type="hidden" name="form_type" value="contact" />
            <div className="field">
              <label htmlFor="home-name">Name</label>
              <input id="home-name" name="name" required autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="home-email">Email</label>
              <input
                id="home-email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="home-company">Company</label>
              <input
                id="home-company"
                name="company"
                autoComplete="organization"
              />
            </div>
            <div className="field">
              <label htmlFor="home-phone">Mobile phone (optional)</label>
              <input
                id="home-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                onChange={(event) => event.currentTarget.setCustomValidity('')}
              />
            </div>

            <SmsConsent
              id={smsConsentId}
              tone="dark"
              checked={smsConsent}
              onChange={setSmsConsent}
            />

            <div className="field contact-selects-field">
              <span className="contact-selects-label" id="contact-interest-label">
                Interest
              </span>
              <input type="hidden" name="capability" value={capability} />
              <div className="contact-actions">
                <div
                  className="assist-menus contact-selects"
                  ref={menusRef}
                  role="group"
                  aria-labelledby="contact-interest-label"
                >
                  <div className="assist-menu">
                    <button
                      type="button"
                      className="assist-trigger"
                      aria-expanded={open}
                      aria-controls={capabilityId}
                      aria-haspopup="listbox"
                      onClick={() => setOpen((current) => !current)}
                    >
                      <span className="contact-select-value">
                        {capability || 'Capabilities'}
                      </span>
                      <span className="assist-chevron" aria-hidden="true" />
                    </button>
                    {open ? (
                      <ul
                        id={capabilityId}
                        className="assist-dropdown"
                        role="listbox"
                        aria-label="Capabilities"
                      >
                        {INTEREST_OPTIONS.map((title) => (
                          <li
                            key={title}
                            role="option"
                            aria-selected={capability === title}
                          >
                            <button
                              type="button"
                              className={
                                capability === title
                                  ? 'assist-option is-selected'
                                  : 'assist-option'
                              }
                              onClick={() => {
                                setCapability(title)
                                setOpen(false)
                              }}
                            >
                              {title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>

                <button
                  className="btn"
                  type="submit"
                  disabled={submitState === 'submitting'}
                >
                  {submitState === 'submitting' ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </div>

            {submitState === 'error' ? (
              <p className="form-note form-note-error" role="alert">
                Something went wrong — please try again in a moment.
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  )
}
