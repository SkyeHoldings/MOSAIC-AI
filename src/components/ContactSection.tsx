import { useEffect, useId, useRef, useState } from 'react'
import { useForm, ValidationError } from '@formspree/react'
import { useLocation } from 'react-router-dom'
import { expertise } from '../data/work'

const FORMSPREE_ID =
  (import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined) || 'xpqvjowe'

const INTEREST_OPTIONS = [
  ...expertise.map((item) => item.title),
  "Don't Know Yet",
] as const

function readPrefill(search: string) {
  const params = new URLSearchParams(search)
  const capability = params.get('capability')?.trim() ?? ''

  return {
    capability: (INTEREST_OPTIONS as readonly string[]).includes(capability)
      ? capability
      : '',
  }
}

export function ContactSection() {
  const [state, handleSubmit] = useForm(FORMSPREE_ID)
  const { search } = useLocation()
  const [open, setOpen] = useState(false)
  const [capability, setCapability] = useState('')
  const menusRef = useRef<HTMLDivElement>(null)
  const capabilityId = useId()

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

                <button className="btn" type="submit" disabled={state.submitting}>
                  {state.submitting ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </div>

            {state.errors ? (
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
