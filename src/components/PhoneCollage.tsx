import {
  ActionsScreen,
  PairScreen,
  ProductScreen,
  SearchScreen,
  SerpPlaScreen,
  SocialPostScreen,
  SocialStoryScreen,
} from './shop-frames/ShopScreens'
import { ShopCollage } from './shop-frames/ShopCollage'

const assets = {
  harryStyles: '/work/gucci/harry-styles.png',
  modelsTurquoise: '/work/gucci/models-turquoise.png',
  ryanGosling: '/work/gucci/ryan-gosling.png',
  celestialBag: '/work/gucci/celestial-bag.png',
  pairSunglasses: '/work/gucci/pair-sunglasses.png',
  travelDuo: '/work/gucci/travel-duo.png',
  adidasCollab: '/work/gucci/adidas-collab.png',
  emeraldPortrait: '/work/gucci/emerald-portrait.png',
  pla: '/work/gucci/gucci-pla.png',
  searchAd: '/work/gucci/gucci-search-ad.png',
  sitelinks: '/work/gucci/gucci-sitelinks.png',
} as const

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
  | { kind: 'pla'; src: string; query?: string; sitelinksSrc?: string | string[] }
  | {
      kind: 'actions'
      src?: string
      actions: { label: string; icon?: 'eye' | 'book' | 'spark' | 'pin' | 'bag' }[]
      mediaFit?: 'cover' | 'contain' | 'top'
    }
  | {
      kind: 'social-post'
      src: string
      handle: string
      caption: string
      likes: string
      mediaFit?: 'cover' | 'contain' | 'top'
    }
  | { kind: 'social-story'; src: string; handle: string; label?: string }

/** Each Gucci asset appears once. */
const cards: Card[] = [
  {
    kind: 'search',
    src: assets.pairSunglasses,
    query: "You're looking for something?",
    ideas: '280 ideas',
  },
  {
    kind: 'product',
    src: assets.celestialBag,
    name: 'Celestial Bucket Bag',
    price: '2 450,00€',
    similar: 'Show me similar shapes',
  },
  {
    kind: 'social-post',
    src: assets.harryStyles,
    handle: 'gucci',
    caption: 'Quiet presence for the season ahead.',
    likes: '128,430',
    mediaFit: 'top',
  },
  {
    kind: 'actions',
    src: assets.modelsTurquoise,
    mediaFit: 'contain',
    actions: [
      { label: 'Discover kindred pieces', icon: 'eye' },
      { label: 'Delve into the story', icon: 'book' },
      { label: 'Curate complete looks', icon: 'spark' },
      { label: 'Set aside for now', icon: 'pin' },
    ],
  },
  {
    kind: 'social-story',
    src: assets.ryanGosling,
    handle: 'gucci',
    label: 'New arrivals · Story',
  },
  {
    kind: 'product',
    src: assets.travelDuo,
    name: 'Travel Companion',
    price: '3 200,00€',
  },
  {
    kind: 'pair',
    heading: 'GUCCI x adidas · High Jewelry',
    left: {
      src: assets.adidasCollab,
      name: 'Court Duffel',
      price: '1 650,00€',
    },
    right: {
      src: assets.emeraldPortrait,
      name: 'Emerald Pendant',
      price: '4 800,00€',
    },
  },
  {
    kind: 'pla',
    src: assets.pla,
    query: 'Gucci tote bag',
    sitelinksSrc: [assets.searchAd, assets.sitelinks],
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
    case 'pla':
      return (
        <SerpPlaScreen
          src={card.src}
          query={card.query}
          sitelinksSrc={card.sitelinksSrc}
        />
      )
    case 'actions':
      return (
        <ActionsScreen
          src={card.src}
          actions={card.actions}
          mediaFit={card.mediaFit}
        />
      )
    case 'social-post':
      return (
        <SocialPostScreen
          src={card.src}
          handle={card.handle}
          caption={card.caption}
          likes={card.likes}
          mediaFit={card.mediaFit}
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
