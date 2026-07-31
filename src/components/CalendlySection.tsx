const CALENDLY_URL =
  'https://calendly.com/skye-hellomosaic?embed_type=Inline&hide_gdpr_banner=1'

export function CalendlySection() {
  return (
    <section
      id="book"
      className="calendly-section"
      aria-label="Book a discovery call"
    >
      <iframe
        className="calendly-embed"
        title="Book a discovery call with Skye"
        src={CALENDLY_URL}
        loading="lazy"
      />
    </section>
  )
}
