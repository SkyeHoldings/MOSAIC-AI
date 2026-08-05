import { useState } from 'react'
import { useForm, ValidationError } from '@formspree/react'
import { Link } from 'react-router-dom'
import { SmsConsent } from '../components/SmsConsent'

const FORMSPREE_ID =
  (import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined) || 'xpqvjowe'

export function SmsOptIn() {
  const [state, handleSubmit] = useForm(FORMSPREE_ID)
  const [smsConsent, setSmsConsent] = useState(false)

  return (
    <article className="legal-page sms-opt-in-page">
      <header className="page-hero legal-hero">
        <p className="legal-kicker">SMS</p>
        <h1>Text message updates</h1>
        <p>
          Opt in to receive texts from MOSAIC about marketing updates,
          appointment reminders, and related messages.
        </p>
      </header>

      <div className="legal-body sms-opt-in-body">
        {state.succeeded ? (
          <div className="sms-opt-in-success">
            <h2>You&apos;re opted in</h2>
            <p>
              Thanks — we&apos;ll only text you as described on this page. Reply
              STOP anytime to unsubscribe, or HELP for help.
            </p>
            <p className="legal-nav">
              <Link to="/">Back to home</Link>
            </p>
          </div>
        ) : (
          <>
            <p>
              Use the form below to subscribe. You can also opt in from our{' '}
              <a href="/#contact">contact form</a> at the bottom of the home
              page by entering your phone number and checking the SMS consent
              box.
            </p>

            <form className="sms-opt-in-form" onSubmit={handleSubmit}>
              <input type="hidden" name="form_type" value="sms_opt_in" />
              <input
                type="hidden"
                name="_subject"
                value="SMS opt-in — hellomosaic.ai"
              />

              <div className="field">
                <label htmlFor="sms-name">Name</label>
                <input
                  id="sms-name"
                  name="name"
                  required
                  autoComplete="name"
                />
                <ValidationError
                  prefix="Name"
                  field="name"
                  errors={state.errors}
                  className="form-note form-note-error"
                />
              </div>

              <div className="field">
                <label htmlFor="sms-phone">Mobile phone</label>
                <input
                  id="sms-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="(208) 555-0100"
                />
                <ValidationError
                  prefix="Phone"
                  field="phone"
                  errors={state.errors}
                  className="form-note form-note-error"
                />
              </div>

              <div className="field">
                <label htmlFor="sms-email">Email (optional)</label>
                <input
                  id="sms-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                  className="form-note form-note-error"
                />
              </div>

              <SmsConsent
                id="sms-opt-in-consent"
                required
                checked={smsConsent}
                onChange={setSmsConsent}
              />

              <button className="btn" type="submit" disabled={state.submitting}>
                {state.submitting ? 'Submitting…' : 'Subscribe to texts'}
              </button>

              {state.errors ? (
                <p className="form-note form-note-error" role="alert">
                  Something went wrong — please try again in a moment.
                </p>
              ) : null}
            </form>
          </>
        )}
      </div>
    </article>
  )
}
