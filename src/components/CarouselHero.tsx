import { useEffect, useId, useRef, useState } from 'react'
import { expertise, getCaseStudy, industries } from '../data/work'
import { BassProCollage } from './BassProCollage'
import { PhoneCollage } from './PhoneCollage'
import { RedRobinCollage } from './RedRobinCollage'

type CollageVariant = 'gucci' | 'red-robin' | 'bass-pro'
type MenuKey = 'capabilities' | 'industries' | null

const slides: { id: string; variant: CollageVariant }[] = [
  { id: 'gucci', variant: 'gucci' },
  { id: 'red-robin', variant: 'red-robin' },
  { id: 'bass-pro-cabelas', variant: 'bass-pro' },
]

function CollageForVariant({ variant }: { variant: CollageVariant }) {
  const gucci = getCaseStudy('gucci')
  switch (variant) {
    case 'gucci':
      return <PhoneCollage images={gucci?.tileCollage ?? []} />
    case 'red-robin':
      return <RedRobinCollage />
    case 'bass-pro':
      return <BassProCollage />
  }
}

export function CarouselHero() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<MenuKey>(null)
  const capabilitiesId = useId()
  const industriesId = useId()
  const loopSlides = [...slides, ...slides]

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null)
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

  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const setWidth = () => {
      viewport.style.setProperty('--carousel-hero-w', `${viewport.clientWidth}px`)
    }
    setWidth()

    if (reduceMotion.matches) {
      window.addEventListener('resize', setWidth)
      return () => window.removeEventListener('resize', setWidth)
    }

    let raf = 0
    let x = 0
    let last = performance.now()
    let playing = true

    const speedPx = () => (window.matchMedia('(max-width: 900px)').matches ? 36 : 48)

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
      { threshold: 0.08 },
    )
    io.observe(viewport)
    window.addEventListener('resize', setWidth)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', setWidth)
    }
  }, [])

  return (
    <section
      className="carousel-hero"
      aria-label="MOSAIC is your growth marketing partner"
      ref={rootRef}
    >
      <div className="carousel-hero__viewport" ref={viewportRef} aria-hidden="true">
        <div className="carousel-hero__track" ref={trackRef}>
          {loopSlides.map((slide, index) => (
            <div className="carousel-hero__panel" key={`${slide.id}-${index}`}>
              <div className="shipped-panel__media shipped-panel__media--collage">
                <CollageForVariant variant={slide.variant} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-hero__card assist-hero assist-hero--partner">
        <div className="assist-hero__copy">
          <h1>
            Meet your growth marketing <span className="carousel-hero__partner">partner.</span>
          </h1>
          <p>Ads. Creative. Reporting. AI. We do it all.</p>

          <div className="assist-menus">
            <div className="assist-menu">
              <button
                type="button"
                className="assist-trigger"
                aria-expanded={open === 'capabilities'}
                aria-controls={capabilitiesId}
                onClick={() =>
                  setOpen((current) => (current === 'capabilities' ? null : 'capabilities'))
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
                        href={`/?capability=${encodeURIComponent(item.title)}#book`}
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
                  setOpen((current) => (current === 'industries' ? null : 'industries'))
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
                        href={`/?industry=${encodeURIComponent(label)}#book`}
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
      </div>
    </section>
  )
}
