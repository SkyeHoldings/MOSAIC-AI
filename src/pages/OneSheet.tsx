import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { MosaicLogo } from '../components/MosaicLogo'
import { OneSheetHorizon } from '../components/OneSheetHorizon'

const BUSINESS_CARD_URL = 'https://hellomosaic.ai/businesscard'
const SITE_URL = 'https://hellomosaic.ai/'

const CLIENTS = ['GUCCI', 'Red Robin', 'Bass Pro Shops / Cabela’s'] as const

export function OneSheet() {
  const [qrSvg, setQrSvg] = useState('')

  useEffect(() => {
    const previous = document.title
    document.title = 'MOSAIC AI · Flyer'

    void QRCode.toString(BUSINESS_CARD_URL, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0d0d0d',
        light: '#ffffff',
      },
    }).then(setQrSvg)

    return () => {
      document.title = previous
    }
  }, [])

  return (
    <section className="os" aria-label="MOSAIC AI flyer">
      <div className="os__toolbar no-print">
        <p className="os__toolbar-hint">Flyer · US Letter · Print full color</p>
        <button type="button" className="os__print" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>

      <article className="os__sheet">
        <div className="os__visual" aria-hidden="true">
          <OneSheetHorizon />
        </div>

        <div className="os__content">
          <header className="os__brand">
            <a className="os__logo" href={SITE_URL} aria-label="MOSAIC home">
              <MosaicLogo />
            </a>
            <p className="os__place">Women-Owned &amp; Operated</p>
          </header>

          <div className="os__copy">
            <h1 className="os__headline">Ready to reshape your future?</h1>
            <p className="os__lede">
              Marketing and AI for local business owners. Enterprise expertise,
              locally crafted.
            </p>
          </div>

          <footer className="os__footer">
            <div className="os__clients">
              <p className="os__clients-label">Brands We’ve Worked With</p>
              <ul className="os__client-list">
                {CLIENTS.map((client) => (
                  <li key={client}>{client}</li>
                ))}
              </ul>
            </div>

            <figure className="os__qr">
              <div
                className="os__qr-mark"
                role="img"
                aria-label="QR code linking to digital business card"
                dangerouslySetInnerHTML={qrSvg ? { __html: qrSvg } : undefined}
              />
              <figcaption>
                <span className="os__qr-label">Scan for card</span>
                <span className="os__url">hellomosaic.ai</span>
              </figcaption>
            </figure>
          </footer>
        </div>
      </article>
    </section>
  )
}
