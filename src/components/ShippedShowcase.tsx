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
  const loopSlides = [...slides, ...slides]

  return (
    <section className="shipped-showcase" aria-label="Shipped with MOSAIC">
      <div className="shipped-showcase__header">
        <h2>Shipped with MOSAIC</h2>
      </div>

      <div className="shipped-showcase__viewport">
        <div className="shipped-showcase__track">
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
