import { useEffect, type MouseEvent } from 'react'
import { MosaicLogo } from '../components/MosaicLogo'

type CardProfile = {
  name: string
  title: string
  organization: string
  tagline: string
  email: string
  phone: string
  website: string
  linkedin: string
  location: string
}

/**
 * Edit this profile — empty optional fields are hidden automatically.
 * Keep public/skye-smith.vcf in sync when contact fields change.
 */
const CARD: CardProfile = {
  name: 'Skye Smith',
  title: 'Founder',
  organization: 'MOSAIC AI',
  tagline: 'Marketing & AI systems for the Inland Northwest',
  email: 'skye@marketingbymosaic.com',
  phone: '208.819.2549',
  website: 'https://hellomosaic.ai/',
  linkedin: '',
  location: "Coeur d'Alene, Idaho",
}

/** Real static file in /public — required for iOS “Add Contact”. */
const VCARD_PATH = '/skye-smith.vcf'
const VCARD_FILENAME = 'Skye-Smith.vcf'

function websiteLabel(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function phoneE164(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits ? `+${digits}` : ''
}

function escapeVCard(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

function buildVCardContent() {
  const [firstName = '', ...rest] = CARD.name.split(' ')
  const lastName = rest.join(' ')
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(CARD.name)}`,
    `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
    `ORG:${escapeVCard(CARD.organization)}`,
    `TITLE:${escapeVCard(CARD.title)}`,
    `EMAIL;TYPE=INTERNET,WORK:${CARD.email}`,
  ]

  const tel = phoneE164(CARD.phone)
  if (tel) lines.push(`TEL;TYPE=CELL,VOICE:${tel}`)
  if (CARD.website) lines.push(`URL:${CARD.website}`)
  if (CARD.linkedin) lines.push(`URL;TYPE=LinkedIn:${CARD.linkedin}`)
  if (CARD.location) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(CARD.location)};;;;`)
  lines.push(`NOTE:${escapeVCard(CARD.tagline)}`)
  lines.push('END:VCARD')

  return lines.join('\r\n')
}

function isAppleMobile() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

async function saveContact(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()

  const content = buildVCardContent()
  const file = new File([content], VCARD_FILENAME, { type: 'text/vcard;charset=utf-8' })

  // Mobile share sheet (includes a path to save the .vcf on many phones).
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: CARD.name,
        text: `${CARD.name} — ${CARD.organization}`,
      })
      return
    } catch {
      // User cancelled or share failed — fall through.
    }
  }

  // iOS: open the hosted .vcf when the server actually returns a contact file.
  if (isAppleMobile()) {
    try {
      const res = await fetch(VCARD_PATH, { method: 'GET', cache: 'no-store' })
      const type = res.headers.get('content-type') || ''
      const body = await res.text()
      if (res.ok && body.includes('BEGIN:VCARD') && !type.includes('text/html')) {
        window.location.assign(VCARD_PATH)
        return
      }
    } catch {
      // Fall through to blob download.
    }
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = VCARD_FILENAME
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
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
            <a
              className="bc__save"
              href={VCARD_PATH}
              download={VCARD_FILENAME}
              type="text/vcard"
              onClick={saveContact}
            >
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
                <a className="bc__action" href={`tel:${CARD.phone.replace(/\D/g, '')}`}>
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
