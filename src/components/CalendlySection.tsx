const CALENDLY_URL =
  'https://calendly.com/skye-hellomosaic?embed_type=Inline&hide_gdpr_banner=1'

type CalendlySectionProps = {
  label?: string
  title?: string
}

export function CalendlySection({
  label = 'Book a discovery call',
  title = 'Book a discovery call with Skye',
}: CalendlySectionProps) {
  return (
    <section id="book" className="calendly-section" aria-label={label}>
      <iframe
        className="calendly-embed"
        title={title}
        src={CALENDLY_URL}
        loading="lazy"
      />
    </section>
  )
}
