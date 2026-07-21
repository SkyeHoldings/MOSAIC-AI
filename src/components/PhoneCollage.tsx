const assets = [
  '/work/gucci/harry-styles.png',
  '/work/gucci/models-turquoise.png',
  '/work/gucci/ryan-gosling.png',
  '/work/gucci/celestial-bag.png',
] as const

type Card =
  | { kind: 'image'; src: string }
  | {
      kind: 'product'
      src: string
      name: string
      price: string
      swatches: string[]
    }
  | {
      kind: 'editorial'
      src: string
      title: string
      body: string
    }
  | {
      kind: 'search'
      src: string
      query: string
      ideas: string
    }
  | {
      kind: 'actions'
      src: string
      actions: string[]
    }

const products = [
  { name: 'Celestial Bucket Bag', price: '2 450.00', swatches: ['#1a1a1a', '#5c2a2a', '#c4b59a'] },
  { name: 'Noir Soft Shoulder', price: '1 890.00', swatches: ['#111', '#d9d2c5', '#6b5b4a'] },
  { name: 'Turquoise Fur Stole', price: '2 100.00', swatches: ['#2f6f6a', '#0d0d0d', '#d9d2c5'] },
  { name: 'Travel Companion', price: '3 200.00', swatches: ['#111', '#6b5b4a', '#ece7df'] },
]

/** Four horizontal rows of make-believe shopping posts */
const rows: Card[][] = [
  [
    {
      kind: 'search',
      src: assets[1],
      query: "You're looking for something?",
      ideas: '280 ideas',
    },
    {
      kind: 'product',
      src: assets[3],
      ...products[0],
    },
    { kind: 'image', src: assets[0] },
    {
      kind: 'editorial',
      src: assets[2],
      title: 'This is our best seller this year',
      body: 'When choosing a go-to everyday piece, focus on effortless function and quiet presence.',
    },
    {
      kind: 'product',
      src: assets[1],
      ...products[1],
    },
  ],
  [
    { kind: 'image', src: assets[2] },
    {
      kind: 'product',
      src: assets[0],
      ...products[2],
    },
    {
      kind: 'actions',
      src: assets[3],
      actions: [
        'Discover kindred pieces',
        'Delve into the story',
        'Curate complete looks',
        'Set aside for now',
      ],
    },
    { kind: 'image', src: assets[1] },
    {
      kind: 'product',
      src: assets[3],
      ...products[3],
    },
  ],
  [
    {
      kind: 'product',
      src: assets[1],
      ...products[0],
    },
    { kind: 'image', src: assets[0] },
    {
      kind: 'editorial',
      src: assets[2],
      title: 'Gifts for her',
      body: 'Curated pieces with quiet weight — made to be lived in, not just looked at.',
    },
    {
      kind: 'product',
      src: assets[3],
      ...products[1],
    },
    { kind: 'image', src: assets[1] },
  ],
  [
    { kind: 'image', src: assets[3] },
    {
      kind: 'search',
      src: assets[0],
      query: "You're looking for something?",
      ideas: '280 ideas',
    },
    {
      kind: 'product',
      src: assets[2],
      ...products[2],
    },
    { kind: 'image', src: assets[1] },
    {
      kind: 'product',
      src: assets[0],
      ...products[3],
    },
  ],
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

/** Four rows of luxury shopping posts on a black field */
export function PhoneCollage(_props: { images: string[] }) {
  return (
    <div className="phone-collage phone-collage--rows" aria-hidden="true">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="phone-collage__row">
          {row.map((card, cardIndex) => (
            <div
              key={`${rowIndex}-${cardIndex}`}
              className={`phone-collage__phone shop-frame shop-frame--${card.kind}`}
            >
              <CardContent card={card} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
