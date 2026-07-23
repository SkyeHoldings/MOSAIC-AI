import { useEffect, useId, useRef, useState } from 'react'
import { expertise } from '../data/work'
import { DigitalEarthCanvas } from './DigitalEarthCanvas'

const industries = [
  'Apartments & Housing',
  'Automotive',
  'Banking & Credit Unions',
  'Beauty, Hair, Nails & Massage',
  'Construction, Trades & Home Services',
  'Dentistry',
  'Education & Schools',
  'Energy & Industrial',
  'Engineering & Professional Services',
  'Fitness & Athletic Training',
  'Holistic, Naturopathic & Functional Medicine',
  'Home Care, Hospice & Senior Living',
  'Insurance & Financial Services',
  'Legal',
  'Maternity, Doula & Family Support',
  'Med Spa, Aesthetics & IV Wellness',
  'Media, Marketing & Technology',
  'Medical — Primary & Specialty Care',
  'Mental & Behavioral Health',
  'Mortgage & Lending',
  'Nonprofits, Charities & Community',
  'Nutrition & Weight Management',
  'Orthodontics',
  'Physical Therapy & Sports Medicine',
  'Prosthetics & Adaptive Medical',
  'Real Estate Brokerages',
  'Recreation, Tourism & Attractions',
  'Restaurants, Food & Beverage',
  'Retail & Consumer Goods',
  'Tattoo & Body Art',
  'Telecom',
  'Title & Escrow',
  'Tourism',
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
              <ul
                id={industriesId}
                className="assist-dropdown assist-dropdown--scroll"
                role="list"
              >
                {industries.map((label) => (
                  <li key={label}>
                    <a href="#contact" onClick={() => setOpen(null)}>
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
        <DigitalEarthCanvas />
      </div>
    </section>
  )
}
