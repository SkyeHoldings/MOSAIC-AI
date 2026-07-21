import { Link } from 'react-router-dom'
import { MosaicLogo } from './MosaicLogo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <p>
            An AI marketing studio in the Pacific Northwest. The future,
            carefully made.
          </p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <a href="/#how-we-work">How we work</a>
          <a href="/#contact">Contact</a>
        </div>

        <div className="footer-col">
          <h4>Studio</h4>
          <p>Pacific Northwest</p>
          <a href="mailto:hello@understory.studio">hello@understory.studio</a>
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
