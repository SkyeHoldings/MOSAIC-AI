import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BassProCollage } from './BassProCollage'
import { PhoneCollage } from './PhoneCollage'
import { RedRobinCollage } from './RedRobinCollage'
import { getCaseStudy } from '../data/work'

type CollageVariant = 'gucci' | 'red-robin' | 'bass-pro'

type Slide = {
  id: string
  client: string
  href: string
  kind: 'collage'
  variant: CollageVariant
}

const gucci = getCaseStudy('gucci')

const slides: Slide[] = [
  {
    id: 'gucci',
    client: 'GUCCI',
    href: '/work/gucci',
    kind: 'collage',
    variant: 'gucci',
  },
  {
    id: 'red-robin',
    client: 'Red Robin',
    href: '/work/red-robin',
    kind: 'collage',
    variant: 'red-robin',
  },
  {
    id: 'bass-pro-cabelas',
    client: "Bass Pro Shops / Cabela's",
    href: '/work/bass-pro-cabelas',
    kind: 'collage',
    variant: 'bass-pro',
  },
]

function CollageForVariant({ variant }: { variant: CollageVariant }) {
  switch (variant) {
    case 'gucci':
      return <PhoneCollage images={gucci?.tileCollage ?? []} />
    case 'red-robin':
      return <RedRobinCollage />
    case 'bass-pro':
      return <BassProCollage />
  }
}

export function ShippedShowcase() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const loopSlides = [...slides, ...slides]

  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) return

    let raf = 0
    let x = 0
    let last = performance.now()
    let playing = true

    const speedPx = () =>
      window.matchMedia('(max-width: 900px)').matches ? 42 : 55

    const tick = (now: number) => {
      if (playing) {
        const dt = Math.min(0.064, (now - last) / 1000)
        last = now
        x -= speedPx() * dt
        const half = track.scrollWidth / 2
        if (half > 0 && -x >= half) x += half
        track.style.transform = `translate3d(${x}px, 0, 0)`
      } else {
        last = now
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    const io = new IntersectionObserver(
      ([entry]) => {
        playing = Boolean(entry?.isIntersecting)
        if (playing) last = performance.now()
      },
      { threshold: 0.12 },
    )
    io.observe(viewport)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  return (
    <section className="shipped-showcase" aria-label="Work in Circulation">
      <div className="shipped-showcase__header">
        <h2>Work in Circulation</h2>
      </div>

      <div className="shipped-showcase__viewport" ref={viewportRef}>
        <div className="shipped-showcase__track" ref={trackRef}>
          {loopSlides.map((slide, index) => (
            <Link
              key={`${slide.id}-${index}`}
              to={slide.href}
              className="shipped-panel shipped-panel--wide"
              aria-label={slide.client}
              aria-hidden={index >= slides.length ? true : undefined}
              tabIndex={index >= slides.length ? -1 : undefined}
            >
              <div className="shipped-panel__media shipped-panel__media--collage">
                <CollageForVariant variant={slide.variant} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
