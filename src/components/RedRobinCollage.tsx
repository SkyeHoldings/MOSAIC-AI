import {
  EditorialScreen,
  ProductScreen,
  SearchScreen,
  SocialPostScreen,
  SocialStoryScreen,
} from './shop-frames/ShopScreens'
import { ShopCollage } from './shop-frames/ShopCollage'

const assets = {
  drinkSpecials: '/work/red-robin/drink-specials.png',
  chickenClub: '/work/red-robin/chicken-bacon-club.png',
  toweringSliders: '/work/red-robin/towering-sliders.png',
  bigYummDeals: '/work/red-robin/big-yumm-deals.png',
  appetizerPlatter: '/work/red-robin/appetizer-platter.png',
  whiskeyRiverWrap: '/work/red-robin/whiskey-river-wrap.png',
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
  | { kind: 'editorial'; title: string; body: string; src?: string }
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
    src: assets.drinkSpecials,
    query: "You're looking for something?",
    ideas: '48 yummm finds',
  },
  {
    kind: 'product',
    src: assets.appetizerPlatter,
    name: 'Shareable Triple',
    price: 'Appetizer',
    similar: 'Show me similar plates',
  },
  {
    kind: 'social-post',
    src: assets.bigYummDeals,
    handle: 'redrobin',
    caption: 'Big Yummm Deals — all day, every day.',
    likes: '24,108',
  },
  {
    kind: 'product',
    src: assets.chickenClub,
    name: 'Bacon Club Crispy Chicken',
    price: '14.99',
  },
  {
    kind: 'social-story',
    src: assets.toweringSliders,
    handle: 'redrobin',
    label: 'New · Towering Sliders',
  },
  {
    kind: 'social-post',
    src: assets.whiskeyRiverWrap,
    handle: 'redrobin',
    caption: 'Whiskey River Wrap hitting the feed.',
    likes: '9,842',
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
    case 'editorial':
      return (
        <EditorialScreen title={card.title} body={card.body} src={card.src} />
      )
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

export function RedRobinCollage() {
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
