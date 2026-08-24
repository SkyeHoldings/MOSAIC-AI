type BrandLogo = {
  id: string
  label: string
  src: string
  widthRem: number
  heightRem?: number
  shiftY?: string
}

const logos: BrandLogo[] = [
  {
    id: 'goldman-sachs',
    label: 'Goldman Sachs',
    src: '/brands/goldman-sachs.png',
    widthRem: 5.8,
  },
  { id: 'truist', label: 'Truist', src: '/brands/truist.png', widthRem: 10.6 },
  { id: 'invesco', label: 'Invesco', src: '/brands/invesco.png', widthRem: 11.2 },
  { id: 'gucci', label: 'GUCCI', src: '/brands/gucci.png', widthRem: 11.2 },
  {
    id: 'red-robin',
    label: 'Red Robin',
    src: '/brands/red-robin.png',
    widthRem: 8.4,
    heightRem: 3.15,
    shiftY: '-0.38rem',
  },
  {
    id: 'bass-pro-shops',
    label: 'Bass Pro Shops',
    src: '/brands/bass-pro-shops.png',
    widthRem: 4.25,
    heightRem: 3.7,
  },
  {
    id: 'cabelas',
    label: "Cabela's",
    src: '/brands/cabelas.png',
    widthRem: 8.6,
    heightRem: 2.45,
  },
]

function BrandBarcode({ brand }: { brand: BrandLogo }) {
  return (
    <span
      className="brand-mark"
      role="img"
      aria-label={brand.label}
      style={{
        ['--brand-width' as string]: `${brand.widthRem}rem`,
        ...(brand.heightRem
          ? { ['--brand-height' as string]: `${brand.heightRem}rem` }
          : {}),
        ...(brand.shiftY
          ? { ['--brand-shift' as string]: brand.shiftY }
          : {}),
      }}
    >
      <img className="brand-mark__image" src={brand.src} alt="" aria-hidden="true" />
    </span>
  )
}

export function BrandMarquee() {
  const repeatedLogos = [...logos, ...logos]

  return (
    <section className="brand-marquee" aria-labelledby="brand-marquee-heading">
      <p className="brand-marquee__banner" id="brand-marquee-heading">
        Clients We&apos;ve Served
      </p>
      <div className="brand-marquee__viewport">
        <div className="brand-marquee__track">
          {repeatedLogos.map((logo, index) => (
            <span
              className="brand-marquee__item"
              key={`${logo.id}-${index}`}
              aria-hidden={index >= logos.length}
            >
              <BrandBarcode brand={logo} />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
