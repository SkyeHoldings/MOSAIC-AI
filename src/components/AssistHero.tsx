import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { expertise } from '../data/work'
import { DigitalEarthCanvas } from './DigitalEarthCanvas'

const industries = [
  { label: 'Luxury & Fashion', href: '/work/gucci' },
  { label: 'Outdoor Retail', href: '/work/bass-pro-cabelas' },
  { label: 'Restaurant & QSR', href: '/work/red-robin' },
  { label: 'Climate & Tech', href: '/work/northline' },
  { label: 'DTC & Launch', href: '/work/kiln' },
  { label: 'Content & Media', href: '/work/harbor' },
]

type MenuKey = 'capabilities' | 'industries' | null

export function AssistHero() {
  const [open, setOpen] = useState<MenuKey>(null)
  const rootRef = useRef<HTMLElement>(null)
  const capabilitiesId = useId()
  const industriesId = useId()

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
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
    <section className="assist-hero" aria-label="How can we help" ref={rootRef}>
      <div className="assist-hero__copy">
        <h1>Ready to reshape your future?</h1>
        <p>
          Learn more about our core areas of expertise by selecting your topic
          of interest:
        </p>

        <div className="assist-menus">
          <div className="assist-menu">
            <button
              type="button"
              className="assist-trigger"
              aria-expanded={open === 'capabilities'}
              aria-controls={capabilitiesId}
              onClick={() =>
                setOpen((current) =>
                  current === 'capabilities' ? null : 'capabilities',
                )
              }
            >
              Capabilities
              <span className="assist-chevron" aria-hidden="true" />
            </button>
            {open === 'capabilities' ? (
              <ul id={capabilitiesId} className="assist-dropdown" role="list">
                {expertise.map((item) => (
                  <li key={item.title}>
                    <a href="#how-we-work" onClick={() => setOpen(null)}>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="assist-menu">
            <button
              type="button"
              className="assist-trigger"
              aria-expanded={open === 'industries'}
              aria-controls={industriesId}
              onClick={() =>
                setOpen((current) =>
                  current === 'industries' ? null : 'industries',
                )
              }
            >
              Industries
              <span className="assist-chevron" aria-hidden="true" />
            </button>
            {open === 'industries' ? (
              <ul id={industriesId} className="assist-dropdown" role="list">
                {industries.map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} onClick={() => setOpen(null)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <div className="assist-hero__visual" aria-hidden="true">
        <DigitalEarthCanvas />
      </div>
    </section>
  )
}
