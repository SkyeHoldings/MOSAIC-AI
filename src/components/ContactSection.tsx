import { useEffect, useId, useRef, useState } from 'react'
import { useForm, ValidationError } from '@formspree/react'
import { useLocation } from 'react-router-dom'
import { expertise, industries } from '../data/work'

const FORMSPREE_ID =
  (import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined) || 'xpqvjowe'

type MenuKey = 'capability' | 'industry' | null

function readPrefill(search: string) {
  const params = new URLSearchParams(search)
  const capability = params.get('capability')?.trim() ?? ''
  const industry = params.get('industry')?.trim() ?? ''

  return {
    capability: expertise.some((item) => item.title === capability)
      ? capability
      : '',
    industry: (industries as readonly string[]).includes(industry)
      ? industry
      : '',
  }
}

export function ContactSection() {
  const [state, handleSubmit] = useForm(FORMSPREE_ID)
  const { search } = useLocation()
  const [open, setOpen] = useState<MenuKey>(null)
  const [capability, setCapability] = useState('')
  const [industry, setIndustry] = useState('')
  const menusRef = useRef<HTMLDivElement>(null)
  const capabilityId = useId()
  const industryId = useId()

  useEffect(() => {
    const prefill = readPrefill(search)
    if (prefill.capability) setCapability(prefill.capability)
    if (prefill.industry) setIndustry(prefill.industry)
  }, [search])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menusRef.current?.contains(event.target as Node)) {
        setOpen(null)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(null)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

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
          <a
            className="contact-partner"
            href="https://cdachamber.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="contact-partner-label">Proud Member of</span>
            <img
              src="/partners/cda-chamber.png?v=5"
              alt="Coeur d'Alene Regional Chamber"
              width={220}
              height={132}
            />
          </a>
        </div>

        {state.succeeded ? (
          <div className="contact-info">
            <h3 className="contact-sent-title">Message sent</h3>
            <p>
              Thanks — we’ll reply with next steps, usually a short intro call.
            </p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="home-name">Name</label>
              <input id="home-name" name="name" required autoComplete="name" />
              <ValidationError
                prefix="Name"
                field="name"
                errors={state.errors}
                className="form-note form-note-error"
              />
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
              <ValidationError
                prefix="Email"
                field="email"
                errors={state.errors}
                className="form-note form-note-error"
              />
            </div>
            <div className="field">
              <label htmlFor="home-company">Company</label>
              <input
                id="home-company"
                name="company"
                autoComplete="organization"
              />
              <ValidationError
                prefix="Company"
                field="company"
                errors={state.errors}
                className="form-note form-note-error"
              />
            </div>

            <div className="field contact-selects-field">
              <span className="contact-selects-label" id="contact-interest-label">
                Interest
              </span>
              <input type="hidden" name="capability" value={capability} />
              <input type="hidden" name="industry" value={industry} />
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
                    aria-expanded={open === 'capability'}
                    aria-controls={capabilityId}
                    aria-haspopup="listbox"
                    onClick={() =>
                      setOpen((current) =>
                        current === 'capability' ? null : 'capability',
                      )
                    }
                  >
                    <span className="contact-select-value">
                      {capability || 'Capabilities'}
                    </span>
                    <span className="assist-chevron" aria-hidden="true" />
                  </button>
                  {open === 'capability' ? (
                    <ul
                      id={capabilityId}
                      className="assist-dropdown"
                      role="listbox"
                      aria-label="Capabilities"
                    >
                      {expertise.map((item) => (
                        <li key={item.title} role="option" aria-selected={capability === item.title}>
                          <button
                            type="button"
                            className={
                              capability === item.title
                                ? 'assist-option is-selected'
                                : 'assist-option'
                            }
                            onClick={() => {
                              setCapability(item.title)
                              setOpen(null)
                            }}
                          >
                            {item.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="assist-menu">
                  <button
                    type="button"
                    className="assist-trigger"
                    aria-expanded={open === 'industry'}
                    aria-controls={industryId}
                    aria-haspopup="listbox"
                    onClick={() =>
                      setOpen((current) =>
                        current === 'industry' ? null : 'industry',
                      )
                    }
                  >
                    <span className="contact-select-value">
                      {industry || 'Industries'}
                    </span>
                    <span className="assist-chevron" aria-hidden="true" />
                  </button>
                  {open === 'industry' ? (
                    <ul
                      id={industryId}
                      className="assist-dropdown assist-dropdown--scroll"
                      role="listbox"
                      aria-label="Industries"
                    >
                      {industries.map((label) => (
                        <li key={label} role="option" aria-selected={industry === label}>
                          <button
                            type="button"
                            className={
                              industry === label
                                ? 'assist-option is-selected'
                                : 'assist-option'
                            }
                            onClick={() => {
                              setIndustry(label)
                              setOpen(null)
                            }}
                          >
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="home-message">What are you building?</label>
              <textarea id="home-message" name="message" required />
              <ValidationError
                prefix="Message"
                field="message"
                errors={state.errors}
                className="form-note form-note-error"
              />
            </div>
            <button className="btn" type="submit" disabled={state.submitting}>
              {state.submitting ? 'Sending…' : 'Send message'}
            </button>
            {state.errors ? (
              <p className="form-note form-note-error" role="alert">
                Something went wrong — email hello@understory.studio and we’ll
                get back to you.
              </p>
            ) : (
              <p className="form-note">We reply from hello@understory.studio.</p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
