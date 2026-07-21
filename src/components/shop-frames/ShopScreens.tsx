import type { ReactNode } from 'react'

export type ShopSize = 'tall' | 'mid' | 'short' | 'wide'

export type ShopAction = {
  label: string
  icon?: 'eye' | 'book' | 'spark' | 'pin' | 'bag' | 'map'
}

function StatusBar() {
  return (
    <div className="shop-ui__status" aria-hidden="true">
      <span>9:41</span>
      <span className="shop-ui__status-signals" />
    </div>
  )
}

function NavIcons() {
  return (
    <div className="shop-ui__nav" aria-hidden="true">
      <span className="shop-ui__icon shop-ui__icon--menu" />
      <span className="shop-ui__icon shop-ui__icon--search" />
      <span className="shop-ui__icon shop-ui__icon--bag" />
    </div>
  )
}

function Dots({ active = 0, count = 3 }: { active?: number; count?: number }) {
  return (
    <div className="shop-ui__dots" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={i === active ? 'is-active' : undefined} />
      ))}
    </div>
  )
}

function ActionIcon({ type }: { type: ShopAction['icon'] }) {
  switch (type) {
    case 'book':
      return (
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path
            d="M3 2.5h4.2c.9 0 1.6.7 1.6 1.6v9.2L7 12.2l-1.8 1.1V4.1c0-.3-.3-.6-.6-.6H3V2.5Zm10 0H8.8c.5.4.8 1 .8 1.6v9.2l1.8-1.1 1.6 1.1V2.5Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path
            d="M8 1.5 9.2 6 14 7.2 9.2 8.4 8 13.5 6.8 8.4 2 7.2 6.8 6 8 1.5Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'pin':
      return (
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path
            d="M8 1.8a4.2 4.2 0 0 0-4.2 4.2c0 3.1 4.2 8.2 4.2 8.2s4.2-5.1 4.2-8.2A4.2 4.2 0 0 0 8 1.8Zm0 5.8a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'bag':
      return (
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path
            d="M4.2 5.2V4a3.8 3.8 0 0 1 7.6 0v1.2H14v8.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.7V5.2h2.2Zm1.4 0h4.8V4a2.4 2.4 0 0 0-4.8 0v1.2Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'map':
      return (
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path
            d="m1.8 3.2 4-1.4 4.4 1.4 4-1.4v11l-4 1.4-4.4-1.4-4 1.4V3.2Zm5.4.2v9.2l3.2 1V4.4l-3.2-1Zm-1.4 0-2.6.9v9.2l2.6-.9V3.4Zm7.2 1 2.6.9v9.2l-2.6-.9V4.4Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'eye':
    default:
      return (
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path
            d="M8 3.2C4.6 3.2 1.9 5.4 1 8c.9 2.6 3.6 4.8 7 4.8s6.1-2.2 7-4.8c-.9-2.6-3.6-4.8-7-4.8Zm0 7.6A2.8 2.8 0 1 1 8 5.2a2.8 2.8 0 0 1 0 5.6Z"
            fill="currentColor"
          />
        </svg>
      )
  }
}

function ScreenShell({
  children,
  className = '',
  withChrome = true,
}: {
  children: ReactNode
  className?: string
  withChrome?: boolean
}) {
  return (
    <div className={`shop-ui ${className}`.trim()}>
      {withChrome ? (
        <>
          <StatusBar />
          <NavIcons />
        </>
      ) : null}
      {children}
    </div>
  )
}

export function SearchScreen({
  src,
  query,
  ideas,
}: {
  src: string
  query: string
  ideas?: string
}) {
  return (
    <ScreenShell className="shop-ui--search">
      <div className="shop-ui__search-pill">
        <span>{query}</span>
        <em aria-hidden="true">⌥</em>
      </div>
      {ideas ? <div className="shop-ui__ideas">{ideas}</div> : null}
      <div className="shop-ui__media shop-ui__media--hero">
        <img src={src} alt="" loading="lazy" />
      </div>
    </ScreenShell>
  )
}

export function ProductScreen({
  src,
  name,
  price,
  similar,
}: {
  src: string
  name: string
  price: string
  similar?: string
}) {
  return (
    <ScreenShell className="shop-ui--product" withChrome={false}>
      <div className="shop-ui__media shop-ui__media--product">
        <img src={src} alt="" loading="lazy" />
      </div>
      <div className="shop-ui__product-meta">
        <div className="shop-ui__product-name">{name}</div>
        <div className="shop-ui__product-price">{price}</div>
        <Dots />
        {similar ? <button type="button" className="shop-ui__link">{similar}</button> : null}
      </div>
    </ScreenShell>
  )
}

export function PairScreen({
  heading,
  left,
  right,
}: {
  heading?: string
  left: { src: string; name: string; price: string }
  right: { src: string; name: string; price: string }
}) {
  return (
    <ScreenShell className="shop-ui--pair">
      {heading ? <h3 className="shop-ui__heading">{heading}</h3> : null}
      <div className="shop-ui__pair">
        {[left, right].map((item) => (
          <div key={item.src} className="shop-ui__pair-item">
            <div className="shop-ui__media shop-ui__media--pair">
              <img src={item.src} alt="" loading="lazy" />
            </div>
            <div className="shop-ui__product-name">{item.name}</div>
            <div className="shop-ui__product-price">{item.price}</div>
            <Dots count={3} />
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}

export function EditorialScreen({
  title,
  body,
  src,
}: {
  title: string
  body: string
  src?: string
}) {
  return (
    <ScreenShell
      className={`shop-ui--editorial${src ? '' : ' shop-ui--copy-only'}`}
      withChrome={Boolean(src)}
    >
      <div className="shop-ui__editorial-copy">
        <h3 className="shop-ui__heading">{title}</h3>
        <p>{body}</p>
      </div>
      {src ? (
        <div className="shop-ui__media shop-ui__media--editorial">
          <img src={src} alt="" loading="lazy" />
        </div>
      ) : null}
    </ScreenShell>
  )
}

export function ActionsScreen({
  src,
  actions,
}: {
  src?: string
  actions: ShopAction[]
}) {
  return (
    <ScreenShell className={`shop-ui--actions${src ? '' : ' shop-ui--actions-plain'}`}>
      {src ? (
        <div className="shop-ui__media shop-ui__media--actions">
          <img src={src} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className="shop-ui__action-list">
        {actions.map((action) => (
          <div key={action.label} className="shop-ui__action">
            <ActionIcon type={action.icon ?? 'eye'} />
            <span>{action.label}</span>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}

export function StillScreen({ src }: { src: string }) {
  return (
    <div className="shop-ui shop-ui--still">
      <img src={src} alt="" loading="lazy" />
    </div>
  )
}

/** Instagram-style feed post */
export function SocialPostScreen({
  src,
  handle,
  caption,
  likes,
}: {
  src: string
  handle: string
  caption: string
  likes: string
}) {
  return (
    <div className="shop-ui shop-ui--social-post">
      <div className="shop-ui__social-head">
        <span className="shop-ui__social-avatar" aria-hidden="true" />
        <div className="shop-ui__social-meta">
          <strong>{handle}</strong>
          <em>Sponsored</em>
        </div>
        <span className="shop-ui__social-more" aria-hidden="true">
          ···
        </span>
      </div>
      <div className="shop-ui__media shop-ui__media--social">
        <img src={src} alt="" loading="lazy" />
      </div>
      <div className="shop-ui__social-actions" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="11" height="11">
          <path
            d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8.2a3.8 3.8 0 0 1 7 2.6C19 15.6 12 20 12 20Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </svg>
        <svg viewBox="0 0 24 24" width="11" height="11">
          <path
            d="M5 18.5 6.4 14A7 7 0 1 1 10 19.2L5 18.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        <svg viewBox="0 0 24 24" width="11" height="11">
          <path
            d="m5 5 14 7-14 7 2.8-7L5 5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        <svg className="shop-ui__social-save" viewBox="0 0 24 24" width="11" height="11">
          <path
            d="M7 4h10v16l-5-3.2L7 20V4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="shop-ui__social-likes">{likes} likes</div>
      <p className="shop-ui__social-caption">
        <strong>{handle}</strong> {caption}
      </p>
    </div>
  )
}

/** Story / Reels-style vertical frame */
export function SocialStoryScreen({
  src,
  handle,
  label,
}: {
  src: string
  handle: string
  label?: string
}) {
  return (
    <div className="shop-ui shop-ui--social-story">
      <div className="shop-ui__story-progress" aria-hidden="true">
        <span className="is-done" />
        <span className="is-active" />
        <span />
      </div>
      <div className="shop-ui__story-head">
        <span className="shop-ui__social-avatar shop-ui__social-avatar--ring" />
        <strong>{handle}</strong>
        <em>2h</em>
      </div>
      <div className="shop-ui__media shop-ui__media--story">
        <img src={src} alt="" loading="lazy" />
      </div>
      {label ? <div className="shop-ui__story-label">{label}</div> : null}
    </div>
  )
}

function SerpSearchBar({ query }: { query: string }) {
  return (
    <div className="serp__searchbar" aria-hidden="true">
      <span className="serp__searchbar-plus" />
      <span className="serp__searchbar-query">{query}</span>
      <span className="serp__searchbar-actions">
        <span className="serp__searchbar-mic" />
        <span className="serp__searchbar-lens" />
        <span className="serp__searchbar-ai">
          <em />
          AI Mode
        </span>
      </span>
    </div>
  )
}

/** Google dark-mode organic / paid search result */
export function SerpResultScreen({
  site,
  domain,
  url,
  title,
  snippet,
  rating,
  reviews,
  replyTime,
  plaSrc,
  query,
}: {
  site: string
  domain: string
  url: string
  title: string
  snippet: string
  rating?: string
  reviews?: string
  replyTime?: string
  plaSrc?: string
  query?: string
}) {
  return (
    <div className="shop-ui shop-ui--serp shop-ui--serp-result">
      <SerpSearchBar query={query ?? site} />
      <div className="serp__head">
        <span className="serp__favicon">{site.charAt(0)}</span>
        <div className="serp__identity">
          <strong>{site}</strong>
          <span>{url}</span>
        </div>
        <span className="serp__more">⋮</span>
      </div>
      <div className="serp__title">{title}</div>
      <p className="serp__snippet">{snippet}</p>
      {rating ? (
        <div className="serp__rating">
          <span className="serp__stars">★★★★★</span>
          <span>
            Rating for {domain}: {rating}
            {reviews ? ` · ${reviews}` : ''}
            {replyTime ? ` · Email reply time: ${replyTime}` : ''}
          </span>
        </div>
      ) : null}
      {plaSrc ? (
        <div className="serp__pla">
          <img src={plaSrc} alt="" loading="lazy" />
        </div>
      ) : null}
    </div>
  )
}

export type SerpSitelink = {
  title: string
  description: string
  url: string
}

/** Google sitelinks block */
export function SerpSitelinksScreen({
  links,
  query,
  plaSrc,
}: {
  links: SerpSitelink[]
  query?: string
  plaSrc?: string
}) {
  return (
    <div className="shop-ui shop-ui--serp shop-ui--serp-sitelinks">
      <SerpSearchBar query={query ?? 'Bass Pro Shops'} />
      <div className="serp-sitelinks__list">
        {links.map((link) => (
          <div key={link.title} className="serp-sitelink">
            <div className="serp-sitelink__copy">
              <strong>{link.title}</strong>
              <p>{link.description}</p>
              <span>{link.url}</span>
            </div>
            <span className="serp-sitelink__chevron" aria-hidden="true">
              ›
            </span>
          </div>
        ))}
      </div>
      {plaSrc ? (
        <div className="serp__pla">
          <img src={plaSrc} alt="" loading="lazy" />
        </div>
      ) : null}
    </div>
  )
}

export type SponsoredProduct = {
  src: string
  name: string
  price: string
  wasPrice?: string
  merchant: string
  rating?: string
  reviews?: string
  sale?: boolean
}

/** Google Sponsored Products carousel */
export function SponsoredProductsScreen({
  products,
}: {
  products: SponsoredProduct[]
}) {
  return (
    <div className="shop-ui shop-ui--serp shop-ui--serp-products">
      <div className="serp-products__head">
        <strong>Sponsored Products</strong>
        <span aria-hidden="true">⋮</span>
      </div>
      <div className="serp-products__row">
        {products.map((product) => (
          <div key={`${product.name}-${product.price}`} className="serp-product">
            <div className="serp-product__media">
              {product.sale ? <span className="serp-product__sale">SALE</span> : null}
              <img src={product.src} alt="" loading="lazy" />
            </div>
            <div className="serp-product__name">{product.name}</div>
            <div className="serp-product__price">
              <em className={product.wasPrice ? 'is-sale' : undefined}>{product.price}</em>
              {product.wasPrice ? <s>{product.wasPrice}</s> : null}
            </div>
            <div className="serp-product__merchant">{product.merchant}</div>
            {product.rating ? (
              <div className="serp-product__rating">
                <span aria-hidden="true">★★★★☆</span>
                <span>({product.reviews ?? '1k+'})</span>
              </div>
            ) : null}
            <div className="serp-product__cta">Visit {product.merchant}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
