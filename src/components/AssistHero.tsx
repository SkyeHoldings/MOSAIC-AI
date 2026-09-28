import { useEffect, useId, useRef, useState } from 'react'
import { expertise, industries } from '../data/work'
import { DigitalEarthCanvas } from './DigitalEarthCanvas'
import { GrowthTypeCanvas } from './GrowthTypeCanvas'
import { MosaicLogo } from './MosaicLogo'
import { TrendlineCanvas } from './TrendlineCanvas'

type MenuKey = 'capabilities' | 'industries' | null

export function AssistHero({
  visual = 'earth',
  copy = 'default',
}: {
  visual?: 'earth' | 'growth' | 'trend'
  copy?: 'default' | 'partner'
}) {
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
    <section
      className={`assist-hero${copy === 'partner' ? ' assist-hero--partner' : ''}`}
      aria-label={copy === 'partner' ? 'MOSAIC is your growth marketing partner' : 'How can we help'}
      ref={rootRef}
    >
      <div className="assist-hero__copy">
        {copy === 'partner' ? (
          <>
            <h1>
              <span className="assist-hero__lead">
                <span className="assist-hero__logo">
                  <MosaicLogo />
                  <span className="assist-hero__sr">MOSAIC</span>
                </span>
                <span className="assist-hero__aside">is your</span>
              </span>
              <span className="assist-hero__rest">growth marketing partner.</span>
            </h1>
            <p>
              We help brands grow by building the system that plans the work, makes
              the creative, and runs the media — then stays with it week to week.
            </p>
          </>
        ) : (
          <>
            <h1>Ready to reshape your future?</h1>
            <p>
              Learn more about our core areas of expertise by selecting your topic
              of interest:
            </p>
          </>
        )}

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
                    <a
                      href={`/?capability=${encodeURIComponent(item.title)}#contact`}
                      onClick={() => setOpen(null)}
                    >
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
              <ul
                id={industriesId}
                className="assist-dropdown assist-dropdown--scroll"
                role="list"
              >
                {industries.map((label) => (
                  <li key={label}>
                    <a
                      href={`/?industry=${encodeURIComponent(label)}#contact`}
                      onClick={() => setOpen(null)}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <div className="assist-hero__visual" aria-hidden="true">
        {visual === 'growth' ? (
          <GrowthTypeCanvas />
        ) : visual === 'trend' ? (
          <TrendlineCanvas />
        ) : (
          <DigitalEarthCanvas />
        )}
      </div>
    </section>
  )
}
