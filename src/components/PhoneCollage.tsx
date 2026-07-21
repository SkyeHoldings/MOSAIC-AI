import { useEffect, useRef, useState } from 'react'

const assets = [
  '/work/gucci/harry-styles.png',
  '/work/gucci/models-turquoise.png',
  '/work/gucci/ryan-gosling.png',
  '/work/gucci/celestial-bag.png',
  '/work/gucci/pair-sunglasses.png',
  '/work/gucci/travel-duo.png',
  '/work/gucci/adidas-collab.png',
  '/work/gucci/emerald-portrait.png',
] as const

type Size = 'tall' | 'mid' | 'short' | 'wide'

type Card =
  | { kind: 'image'; src: string; size: Size }
  | {
      kind: 'product'
      src: string
      size: Size
      name: string
      price: string
      swatches: string[]
    }
  | {
      kind: 'editorial'
      src: string
      size: Size
      title: string
      body: string
    }
  | {
      kind: 'search'
      src: string
      size: Size
      query: string
      ideas: string
    }
  | {
      kind: 'actions'
      src: string
      size: Size
      actions: string[]
    }

/** Mixed sizes — longer panels + short/wide ones like the reference */
const cards: Card[] = [
  {
    kind: 'search',
    src: assets[4],
    size: 'tall',
    query: "You're looking for something?",
    ideas: '280 ideas',
  },
  {
    kind: 'product',
    src: assets[3],
    size: 'mid',
    name: 'Celestial Bucket Bag',
    price: '2 450.00',
    swatches: ['#1a1a1a', '#5c2a2a', '#c4b59a'],
  },
  {
    kind: 'image',
    src: assets[5],
    size: 'wide',
  },
  {
    kind: 'editorial',
    src: assets[7],
    size: 'tall',
    title: 'This is our best seller this year',
    body: 'When choosing a go-to everyday piece, focus on effortless function and quiet presence.',
  },
  {
    kind: 'product',
    src: assets[6],
    size: 'short',
    name: 'Court Duffel',
    price: '1 650.00',
    swatches: ['#6f9476', '#7c3aed', '#eab308'],
  },
  {
    kind: 'image',
    src: assets[0],
    size: 'mid',
  },
  {
    kind: 'product',
    src: assets[4],
    size: 'tall',
    name: 'Aviator Blue Lens',
    price: '520.00',
    swatches: ['#1e3a8a', '#111', '#c4b59a'],
  },
  {
    kind: 'actions',
    src: assets[1],
    size: 'tall',
    actions: [
      'Discover kindred pieces',
      'Delve into the story',
      'Curate complete looks',
      'Set aside for now',
    ],
  },
  {
    kind: 'image',
    src: assets[2],
    size: 'short',
  },
  {
    kind: 'product',
    src: assets[5],
    size: 'mid',
    name: 'Travel Companion',
    price: '3 200.00',
    swatches: ['#111', '#6b5b4a', '#ece7df'],
  },
  {
    kind: 'product',
    src: assets[7],
    size: 'wide',
    name: 'Emerald Pendant',
    price: '4 800.00',
    swatches: ['#064e3b', '#6b21a8', '#7f1d1d'],
  },
  {
    kind: 'image',
    src: assets[6],
    size: 'tall',
  },
  {
    kind: 'editorial',
    src: assets[5],
    size: 'mid',
    title: 'Gifts for her',
    body: 'Curated pieces with quiet weight — made to be lived in, not just looked at.',
  },
  {
    kind: 'product',
    src: assets[1],
    size: 'short',
    name: 'Noir Soft Shoulder',
    price: '1 890.00',
    swatches: ['#111', '#d9d2c5', '#6b5b4a'],
  },
  {
    kind: 'image',
    src: assets[4],
    size: 'mid',
  },
  {
    kind: 'search',
    src: assets[7],
    size: 'short',
    query: "You're looking for something?",
    ideas: '280 ideas',
  },
]

function CardContent({ card }: { card: Card }) {
  switch (card.kind) {
    case 'image':
      return <img src={card.src} alt="" loading="lazy" />
    case 'product':
      return (
        <>
          <img src={card.src} alt="" loading="lazy" />
          <div className="shop-frame__chrome shop-frame__chrome--product">
            <div className="shop-frame__product-name">{card.name}</div>
            <div className="shop-frame__product-price">{card.price}</div>
            <div className="shop-frame__swatches" aria-hidden="true">
              {card.swatches.map((color) => (
                <span key={color} style={{ background: color }} />
              ))}
            </div>
          </div>
        </>
      )
    case 'editorial':
      return (
        <>
          <img src={card.src} alt="" loading="lazy" />
          <div className="shop-frame__chrome shop-frame__chrome--feed">
            <div className="shop-frame__feed-title">{card.title}</div>
            <p>{card.body}</p>
          </div>
        </>
      )
    case 'search':
      return (
        <>
          <img src={card.src} alt="" loading="lazy" />
          <div className="shop-frame__chrome shop-frame__chrome--search">
            <div className="shop-frame__status" aria-hidden="true">
              <span>9:41</span>
              <span className="shop-frame__status-dots" />
            </div>
            <div className="shop-frame__nav" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="shop-frame__search">
              <span>{card.query}</span>
              <em aria-hidden="true">✦</em>
            </div>
            <div className="shop-frame__ideas">{card.ideas}</div>
          </div>
        </>
      )
    case 'actions':
      return (
        <>
          <img src={card.src} alt="" loading="lazy" />
          <div className="shop-frame__chrome shop-frame__chrome--actions">
            {card.actions.map((label) => (
              <div key={label} className="shop-frame__action">
                {label}
              </div>
            ))}
          </div>
        </>
      )
  }
}

/** Masonry shopping posts — mixed sizes on desktop, snap carousel on mobile */
export function PhoneCollage(_props: { images: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [inColor, setInColor] = useState(false)

  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInColor(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={rootRef}
      className={`phone-collage phone-collage--masonry${inColor ? ' is-color' : ''}`}
      aria-hidden="true"
    >
      {cards.map((card, index) => (
        <div
          key={`${card.kind}-${index}`}
          className={`phone-collage__phone shop-frame shop-frame--${card.kind} is-${card.size}`}
        >
          <CardContent card={card} />
        </div>
      ))}
    </div>
  )
}
