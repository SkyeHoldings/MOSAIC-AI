import {
  ActionsScreen,
  EditorialScreen,
  PairScreen,
  ProductScreen,
  SearchScreen,
  SocialPostScreen,
  SocialStoryScreen,
} from './shop-frames/ShopScreens'
import { ShopCollage } from './shop-frames/ShopCollage'

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

type Card =
  | { kind: 'search'; src: string; query: string; ideas?: string }
  | {
      kind: 'product'
      src: string
      name: string
      price: string
      similar?: string
    }
  | {
      kind: 'pair'
      heading?: string
      left: { src: string; name: string; price: string }
      right: { src: string; name: string; price: string }
    }
  | { kind: 'editorial'; title: string; body: string; src?: string }
  | {
      kind: 'actions'
      src?: string
      actions: { label: string; icon?: 'eye' | 'book' | 'spark' | 'pin' | 'bag' }[]
    }
  | {
      kind: 'social-post'
      src: string
      handle: string
      caption: string
      likes: string
    }
  | { kind: 'social-story'; src: string; handle: string; label?: string }

/** Each Gucci asset appears once. */
const cards: Card[] = [
  {
    kind: 'search',
    src: assets[4],
    query: "You're looking for something?",
    ideas: '280 ideas',
  },
  {
    kind: 'product',
    src: assets[3],
    name: 'Celestial Bucket Bag',
    price: '2 450,00€',
    similar: 'Show me similar shapes',
  },
  {
    kind: 'social-post',
    src: assets[0],
    handle: 'gucci',
    caption: 'Quiet presence for the season ahead.',
    likes: '128,430',
  },
  {
    kind: 'actions',
    src: assets[1],
    actions: [
      { label: 'Discover kindred pieces', icon: 'eye' },
      { label: 'Delve into the story', icon: 'book' },
      { label: 'Curate complete looks', icon: 'spark' },
      { label: 'Set aside for now', icon: 'pin' },
    ],
  },
  {
    kind: 'social-story',
    src: assets[2],
    handle: 'gucci',
    label: 'New arrivals · Story',
  },
  {
    kind: 'product',
    src: assets[5],
    name: 'Travel Companion',
    price: '3 200,00€',
  },
  {
    kind: 'pair',
    heading: 'Gifts for her',
    left: {
      src: assets[6],
      name: 'Court Duffel',
      price: '1 650,00€',
    },
    right: {
      src: assets[7],
      name: 'Emerald Pendant',
      price: '4 800,00€',
    },
  },
  {
    kind: 'editorial',
    title: 'Quiet presence',
    body: 'Curated pieces with quiet weight — made to be lived in, not just looked at.',
  },
]

function CardContent({ card }: { card: Card }) {
  switch (card.kind) {
    case 'search':
      return <SearchScreen src={card.src} query={card.query} ideas={card.ideas} />
    case 'product':
      return (
        <ProductScreen
          src={card.src}
          name={card.name}
          price={card.price}
          similar={card.similar}
        />
      )
    case 'pair':
      return (
        <PairScreen heading={card.heading} left={card.left} right={card.right} />
      )
    case 'editorial':
      return (
        <EditorialScreen title={card.title} body={card.body} src={card.src} />
      )
    case 'actions':
      return <ActionsScreen src={card.src} actions={card.actions} />
    case 'social-post':
      return (
        <SocialPostScreen
          src={card.src}
          handle={card.handle}
          caption={card.caption}
          likes={card.likes}
        />
      )
    case 'social-story':
      return (
        <SocialStoryScreen
          src={card.src}
          handle={card.handle}
          label={card.label}
        />
      )
  }
}

export function PhoneCollage(_props: { images: string[] }) {
  return (
    <ShopCollage columns={4}>
      {cards.map((card, index) => (
        <div
          key={`${card.kind}-${index}`}
          className={`phone-collage__phone shop-frame shop-frame--${card.kind}`}
        >
          <CardContent card={card} />
        </div>
      ))}
    </ShopCollage>
  )
}
