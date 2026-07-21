import {
  SearchScreen,
  SerpResultScreen,
  SerpSitelinksScreen,
  SocialPostScreen,
  SocialStoryScreen,
  StillScreen,
} from './shop-frames/ShopScreens'
import { ShopCollage } from './shop-frames/ShopCollage'

const assets = {
  fishingCenter: '/work/bass-pro-fishing-center.png',
  mooseHall: '/work/bass-pro-moose-hall.png',
  storefront: '/work/bass-pro-cabelas.png',
  bassProPla: '/work/bass-pro/bass-pro-pla.png',
  shoesPla: '/work/bass-pro/shoes-pla.png',
  cabelasPla: '/work/bass-pro/cabelas-pla.png',
} as const

type Card =
  | { kind: 'search'; src: string; query: string; ideas?: string }
  | {
      kind: 'serp-result'
      site: string
      domain: string
      url: string
      title: string
      snippet: string
      rating?: string
      reviews?: string
      replyTime?: string
      plaSrc?: string
    }
  | {
      kind: 'serp-sitelinks'
      query?: string
      plaSrc?: string
      links: { title: string; description: string; url: string }[]
    }
  | { kind: 'pla'; src: string }
  | {
      kind: 'social-post'
      src: string
      handle: string
      caption: string
      likes: string
    }
  | { kind: 'social-story'; src: string; handle: string; label?: string }

const cards: Card[] = [
  {
    kind: 'search',
    src: assets.fishingCenter,
    query: "You're looking for something?",
    ideas: '120 outdoors finds',
  },
  {
    kind: 'serp-result',
    site: 'Bass Pro Shops',
    domain: 'basspro.com',
    url: 'https://www.basspro.com › official › store',
    title: 'Bass Pro Shops® Official Site',
    snippet:
      'Shop Online or In-Stores — Outfit Your Next Adventure with Quality Gear at Great Prices. Shop Online or In-Store Now! Discover Top-Rated Outdoor Gear for Fishing, Hunting, Boating & More at Bass Pro Shops®.',
    rating: '4.9',
    reviews: '715 reviews',
    replyTime: '3 hours',
    plaSrc: assets.bassProPla,
  },
  {
    kind: 'social-post',
    src: assets.storefront,
    handle: 'bassproshops',
    caption: 'Outdoor World — destination retail, live.',
    likes: '56,210',
  },
  {
    kind: 'social-story',
    src: assets.mooseHall,
    handle: 'bassproshops',
    label: 'Moose Hall · Story',
  },
  {
    kind: 'serp-sitelinks',
    query: 'Bass Pro Shops',
    plaSrc: assets.shoesPla,
    links: [
      {
        title: 'Bass Pro® Bargain Cave',
        description: 'Check Out These Clearance Deals! Save up to 50% off',
        url: 'https://basspro.com › bargain-cave-sale-and-...',
      },
      {
        title: 'Shop Fishing, Hunting & More',
        description: 'Save on Premium Outdoor Brands You Love Today. Free Shipping on Orders $50+.',
        url: 'https://basspro.com',
      },
      {
        title: "Bass Pro Shops® CLUB Card",
        description: 'Earn Points Toward Free Gear. Apply Today!',
        url: 'https://basspro.com › club',
      },
    ],
  },
  {
    kind: 'pla',
    src: assets.cabelasPla,
  },
]

function CardContent({ card }: { card: Card }) {
  switch (card.kind) {
    case 'search':
      return <SearchScreen src={card.src} query={card.query} ideas={card.ideas} />
    case 'serp-result':
      return (
        <SerpResultScreen
          site={card.site}
          domain={card.domain}
          url={card.url}
          title={card.title}
          snippet={card.snippet}
          rating={card.rating}
          reviews={card.reviews}
          replyTime={card.replyTime}
          plaSrc={card.plaSrc}
          query={card.site}
        />
      )
    case 'serp-sitelinks':
      return (
        <SerpSitelinksScreen
          links={card.links}
          query={card.query}
          plaSrc={card.plaSrc}
        />
      )
    case 'pla':
      return <StillScreen src={card.src} />
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

export function BassProCollage() {
  return (
    <ShopCollage columns={3}>
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
