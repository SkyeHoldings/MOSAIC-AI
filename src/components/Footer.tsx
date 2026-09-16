import { Link } from 'react-router-dom'
import { MosaicLogo } from './MosaicLogo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a
            className="footer-partner"
            href="https://cdachamber.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="footer-partner-label">Proud Member of</span>
            <img
              src="/partners/cda-chamber-light.png"
              alt="Coeur d'Alene Regional Chamber"
              width={220}
              height={132}
            />
          </a>
        </div>

        <div className="footer-col footer-about">
          <h4>About Us</h4>
          <p>
            Based in Coeur d&apos;Alene, MOSAIC partners with Inland Northwest
            business owners to shape marketing and AI systems that feel grounded —
            practical, consistent, and built for the long haul.
          </p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <nav className="footer-nav" aria-label="Footer">
            <Link to="/">Home</Link>
            <Link to="/brief">Program brief</Link>
            <Link to="/sms-opt-in">SMS Opt-In</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <Link to="/" className="footer-logo" aria-label="MOSAIC home">
          <MosaicLogo />
        </Link>
        <span>© {new Date().getFullYear()} MOSAIC</span>
      </div>
    </footer>
  )
}
