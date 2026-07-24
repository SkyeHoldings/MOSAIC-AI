import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { MosaicLogo } from '../components/MosaicLogo'
import { OneSheetHorizon } from '../components/OneSheetHorizon'

const BUSINESS_CARD_URL = 'https://hellomosaic.ai/businesscard'
const SITE_URL = 'https://hellomosaic.ai/'
const CHAMBER_URL = 'https://cdachamber.com/'

const CLIENTS = ['GUCCI', 'Red Robin', 'Bass Pro Shops / Cabela’s'] as const

export function OneSheet() {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    const previous = document.title
    document.title = 'MOSAIC AI · Flyer'

    void QRCode.toDataURL(BUSINESS_CARD_URL, {
      margin: 1,
      width: 512,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0d0d0d',
        light: '#ffffff',
      },
    }).then(setQrDataUrl)

    void document.fonts.ready.then(() => {
      void document.fonts.load('400 48px Armata').then(() => setFontsReady(true))
    })

    return () => {
      document.title = previous
    }
  }, [])

  const printReady = Boolean(qrDataUrl) && fontsReady

  return (
    <section
      className="os"
      aria-label="MOSAIC AI flyer"
      data-print-ready={printReady ? 'true' : 'false'}
    >
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
              {qrDataUrl ? (
                <img
                  className="os__qr-mark"
                  src={qrDataUrl}
                  width={512}
                  height={512}
                  alt="QR code linking to digital business card"
                />
              ) : (
                <div className="os__qr-mark" aria-hidden="true" />
              )}
              <figcaption>
                <span className="os__qr-label">Scan for card</span>
                <span className="os__url">hellomosaic.ai</span>
              </figcaption>
            </figure>

            <a
              className="os__chamber"
              href={CHAMBER_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/partners/cda-chamber-flyer.png"
                alt="Proud member of Coeur d’Alene Regional Chamber"
                width={220}
                height={132}
              />
            </a>
          </footer>
        </div>
      </article>
    </section>
  )
}
