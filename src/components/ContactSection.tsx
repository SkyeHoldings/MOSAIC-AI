import { useState, type FormEvent } from 'react'

export function ContactSection() {
  const [sent, setSent] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-heading">
      <div className="contact-grid">
        <div className="contact-info">
          <h2 id="contact-heading">Start a project.</h2>
          <p>
            Tell us what you’re building, where you’re stuck, and what “good”
            looks like. We’ll reply with next steps — usually a short intro call.
          </p>
          <p>
            Understory works with founders, marketing leads, and product teams —
            especially when AI is part of the story or the operating model.
          </p>
          <div className="meta-block">
            <h4>Direct</h4>
            <p>
              <a href="mailto:hello@understory.studio">hello@understory.studio</a>
            </p>
            <p>Pacific Northwest · remote-friendly</p>
          </div>
        </div>

        {sent ? (
          <div className="contact-info">
            <h3 className="contact-sent-title">Message noted</h3>
            <p>
              This draft form doesn’t send email yet — wire it to your inbox,
              Formspree, or CRM when you’re ready.
            </p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
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
              <label htmlFor="home-message">What are you building?</label>
              <textarea id="home-message" name="message" required />
            </div>
            <button className="btn" type="submit">
              Send message
            </button>
            <p className="form-note">
              Placeholder form for the draft site. No data leaves the browser
              yet.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
