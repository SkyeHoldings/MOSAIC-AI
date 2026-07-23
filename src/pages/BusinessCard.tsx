import { useEffect } from 'react'
import { MosaicLogo } from '../components/MosaicLogo'

/**
 * Edit this profile — empty optional fields are hidden automatically.
 */
const CARD = {
  name: 'Skye',
  title: 'Founder',
  organization: 'MOSAIC AI',
  tagline: 'Marketing & AI systems for the Inland Northwest',
  email: 'hello@hellomosaic.ai',
  phone: '',
  website: 'https://hellomosaic.ai/',
  linkedin: '',
  location: "Coeur d'Alene, Idaho",
} as const

function websiteLabel(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function buildVCard() {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${CARD.name}`,
    `N:${CARD.name};;;;`,
    `ORG:${CARD.organization}`,
    `TITLE:${CARD.title}`,
    `EMAIL;TYPE=INTERNET,WORK:${CARD.email}`,
  ]

  if (CARD.phone) lines.push(`TEL;TYPE=CELL,VOICE:${CARD.phone}`)
  if (CARD.website) lines.push(`URL:${CARD.website}`)
  if (CARD.linkedin) lines.push(`URL;TYPE=LinkedIn:${CARD.linkedin}`)
  if (CARD.location) lines.push(`ADR;TYPE=WORK:;;${CARD.location};;;;`)
  lines.push(`NOTE:${CARD.tagline}`)
  lines.push('END:VCARD')

  return `data:text/vcard;charset=utf-8,${encodeURIComponent(lines.join('\n'))}`
}

export function BusinessCard() {
  useEffect(() => {
    const previous = document.title
    document.title = `${CARD.name} · ${CARD.organization}`
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <section className="bc" aria-labelledby="bc-name">
      <div className="bc__shell">
        <header className="bc__brand">
          <a className="bc__logo" href={CARD.website} aria-label="MOSAIC home">
            <MosaicLogo />
          </a>
        </header>

        <div className="bc__body">
          <p className="bc__kicker">Digital Business Card</p>
          <h1 id="bc-name" className="bc__name">
            {CARD.name}
          </h1>
          <p className="bc__role">
            {CARD.title}
            <span className="bc__role-sep" aria-hidden="true">
              ·
            </span>
            {CARD.organization}
          </p>
          <p className="bc__tagline">{CARD.tagline}</p>

          <div className="bc__primary">
            <a className="bc__save" href={buildVCard()} download="mosaic-business-card.vcf">
              Save Contact
            </a>
          </div>

          <ul className="bc__actions">
            <li>
              <a className="bc__action" href={`mailto:${CARD.email}`}>
                <span className="bc__action-label">Email</span>
                <span className="bc__action-value">{CARD.email}</span>
              </a>
            </li>
            {CARD.phone ? (
              <li>
                <a className="bc__action" href={`tel:${CARD.phone.replace(/\s+/g, '')}`}>
                  <span className="bc__action-label">Phone</span>
                  <span className="bc__action-value">{CARD.phone}</span>
                </a>
              </li>
            ) : null}
            <li>
              <a
                className="bc__action"
                href={CARD.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="bc__action-label">Website</span>
                <span className="bc__action-value">{websiteLabel(CARD.website)}</span>
              </a>
            </li>
            {CARD.linkedin ? (
              <li>
                <a
                  className="bc__action"
                  href={CARD.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="bc__action-label">LinkedIn</span>
                  <span className="bc__action-value">Connect</span>
                </a>
              </li>
            ) : null}
            {CARD.location ? (
              <li>
                <div className="bc__action bc__action--static">
                  <span className="bc__action-label">Location</span>
                  <span className="bc__action-value">{CARD.location}</span>
                </div>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  )
}
