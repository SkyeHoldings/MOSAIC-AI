import { useEffect } from 'react'

const CALENDLY_EVENT_URL =
  'https://calendly.com/skye-hellomosaic/30min?hide_gdpr_banner=1'

const WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js'
const WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css'

type CalendlyApi = {
  initPopupWidget: (options: { url: string }) => void
}

type CalendlySectionProps = {
  label?: string
  title?: string
  variant?: 'inline' | 'button'
}

function calendlyApi() {
  return (window as Window & { Calendly?: CalendlyApi }).Calendly
}

let calendlyAssets: Promise<void> | null = null

function loadCalendlyAssets() {
  if (!calendlyAssets) {
    calendlyAssets = new Promise((resolve) => {
      if (!document.querySelector('link[data-calendly-widget]')) {
        const css = document.createElement('link')
        css.rel = 'stylesheet'
        css.href = WIDGET_CSS
        css.dataset.calendlyWidget = 'true'
        document.head.appendChild(css)
      }

      if (calendlyApi()) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = WIDGET_JS
      script.async = true
      script.dataset.calendlyWidget = 'true'
      script.onload = () => resolve()
      document.body.appendChild(script)
    })
  }
  return calendlyAssets
}

export function CalendlySection({
  label = 'Book a discovery call',
  title = 'Book a discovery call with Skye',
  variant = 'inline',
}: CalendlySectionProps) {
  useEffect(() => {
    if (variant !== 'button') return
    void loadCalendlyAssets()
  }, [variant])

  if (variant === 'button') {
    return (
      <section id="book" className="calendly-section calendly-section--button" aria-label={label}>
        <button
          type="button"
          className="btn"
          onClick={() => {
            const api = calendlyApi()
            if (api) {
              api.initPopupWidget({ url: CALENDLY_EVENT_URL })
              return
            }
            window.open(CALENDLY_EVENT_URL, '_blank', 'noopener,noreferrer')
          }}
        >
          {label}
        </button>
      </section>
    )
  }

  return (
    <section id="book" className="calendly-section" aria-label={label}>
      <iframe
        className="calendly-embed"
        title={title}
        src={`${CALENDLY_EVENT_URL}&embed_type=Inline`}
        loading="lazy"
      />
    </section>
  )
}
