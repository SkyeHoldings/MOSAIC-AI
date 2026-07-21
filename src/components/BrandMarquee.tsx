type BrandLogo = {
  id: string
  label: string
  src: string
  widthRem: number
}

const logos: BrandLogo[] = [
  {
    id: 'bass-pro-shops',
    label: 'Bass Pro Shops',
    src: '/brands/bass-pro-shops.png',
    widthRem: 13,
  },
  { id: 'cabelas', label: "Cabela's", src: '/brands/cabelas.png', widthRem: 10.2 },
  { id: 'gucci', label: 'GUCCI', src: '/brands/gucci.png', widthRem: 7.4 },
  { id: 'red-robin', label: 'Red Robin', src: '/brands/red-robin.png', widthRem: 10.4 },
]

function BrandBarcode({ brand }: { brand: BrandLogo }) {
  return (
    <span
      className="brand-mark"
      role="img"
      aria-label={brand.label}
      style={{ ['--brand-width' as string]: `${brand.widthRem}rem` }}
    >
      <img className="brand-mark__image" src={brand.src} alt="" aria-hidden="true" />
    </span>
  )
}

export function BrandMarquee() {
  const repeatedLogos = [...logos, ...logos]

  return (
    <section className="brand-marquee" aria-label="Client brands">
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
    </section>
  )
}
