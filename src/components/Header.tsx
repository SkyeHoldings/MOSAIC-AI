import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MosaicLogo } from './MosaicLogo'

const TICKER_LINES = [
  'Women-Owned & Operated',
  'Founded in the Inland Northwest',
  'Enterprise Expertise, Local Frontier',
] as const

const TEST4_TICKER_LINES = [
  'Women-Owned & Operated',
  'Founded in the Inland Northwest',
  'Managed +$200M of Ad Spend',
] as const

const HOLD_MS = 3200
const SPIN_MS = 650

function SlotTicker({ lines }: { lines: readonly string[] }) {
  // Extra first line at the end lets us loop forward, then snap.
  const reel = [...lines, lines[0]]
  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(true)
  const indexRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    let timeoutId = 0

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeoutId = window.setTimeout(resolve, ms)
      })

    const run = async () => {
      while (!cancelled) {
        await wait(HOLD_MS)
        if (cancelled) return

        const next = indexRef.current + 1
        setAnimate(true)
        setIndex(next)
        indexRef.current = next

        await wait(SPIN_MS)
        if (cancelled) return

        if (next >= lines.length) {
          // Snap from duplicate first line back to the real first line.
          setAnimate(false)
          setIndex(0)
          indexRef.current = 0
          await wait(32)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="slot-ticker" aria-live="polite" aria-atomic="true">
      <div className="slot-ticker__window">
        <div
          className={`slot-ticker__reel${animate ? ' is-animated' : ''}`}
          style={{
            transform: `translate3d(0, calc(${index} * var(--slot-line-h) * -1), 0)`,
          }}
        >
          {reel.map((line, i) => (
            <p className="slot-ticker__line" key={`${line}-${i}`}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const isNewHome = pathname === '/' || pathname === '/test4'
  const isDark = pathname === '/services' || isNewHome

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`site-header${scrolled ? ' is-scrolled' : ''}${isDark ? ' site-header--dark' : ''}${isNewHome ? ' site-header--on-test4' : ''}`}
    >
      <div className="header-inner">
        <Link to="/" className="logo" aria-label="MOSAIC home">
          <MosaicLogo />
        </Link>

        <SlotTicker
          key={isNewHome ? 'test4' : 'default'}
          lines={isNewHome ? TEST4_TICKER_LINES : TICKER_LINES}
        />
      </div>
    </header>
  )
}
