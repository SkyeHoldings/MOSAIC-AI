export type CaseStudyStat = {
  value: string
  label: string
}

export type CaseStudySolution = {
  eyebrow: string
  heading: string
  body: string[]
}

export type CaseStudyQuote = {
  text: string
  attribution: string
}

export type CaseStudyStory = {
  date: string
  seoTitle: string
  heroImage: string
  heroImageAlt: string
  /** CSS object-position for the hero crop. Defaults to center. */
  heroObjectPosition?: string
  results: CaseStudyStat[]
  services: string[]
  startingPoint: string[]
  solution: CaseStudySolution[]
  impact: CaseStudyStat[]
  impactBody: string[]
  methodNote: string
  quote?: CaseStudyQuote
}

export type CaseStudy = {
  id: string
  client: string
  title: string
  summary: string
  tags: string[]
  /** Gradient fallback when no tileImage / tileCollage is set */
  tileBg: string
  /** Optional photo for the work tile (public URL path) */
  tileImage?: string
  /** Optional multi-photo strip for the work tile */
  tileImages?: string[]
  /** Optional phone-collage images (AKQA-style featured tile) */
  tileCollage?: string[]
  /** Span full grid width for featured tiles */
  wide?: boolean
  /** Live case-study writeup at /case-studies/:id */
  published?: boolean
  story?: CaseStudyStory
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'gucci',
    client: 'GUCCI',
    title: 'First adopters of Performance Max',
    summary:
      'Campaign and brand systems for GUCCI — high-craft visual language with AI-assisted production that still feels couture.',
    tags: ['Brand', 'Campaign', 'Luxury'],
    tileBg: '#0a0a0a',
    tileCollage: [
      '/work/gucci/harry-styles.png',
      '/work/gucci/models-turquoise.png',
      '/work/gucci/ryan-gosling.png',
      '/work/gucci/celestial-bag.png',
      '/work/gucci/pair-sunglasses.png',
      '/work/gucci/travel-duo.png',
      '/work/gucci/adidas-collab.png',
      '/work/gucci/emerald-portrait.png',
    ],
    wide: true,
  },
  {
    id: 'bass-pro-cabelas',
    client: "Bass Pro Shops/Cabela's",
    title: 'Outdoor retail brand experience',
    summary:
      'Brand and experience work for Bass Pro Shops and Cabela’s — destination retail storytelling that feels authentic to the outdoors.',
    tags: ['Brand', 'Retail', 'Experience'],
    tileBg:
      'radial-gradient(120% 100% at 30% 20%, #3d5a3a 0%, transparent 55%), radial-gradient(100% 90% at 80% 80%, #1a2a1c 0%, transparent 55%), #121812',
    tileImages: [
      '/work/bass-pro-fishing-center.png',
      '/work/bass-pro-moose-hall.png',
      '/work/bass-pro-cabelas.png',
    ],
    tileCollage: [
      '/work/bass-pro-fishing-center.png',
      '/work/bass-pro-moose-hall.png',
      '/work/bass-pro-cabelas.png',
    ],
    wide: true,
  },
  {
    id: 'red-robin',
    client: 'Red Robin',
    title: 'YouTube + Performance Max guest lift',
    summary:
      'Units with YouTube on top of Performance Max grew guests +14.5% year-over-year. PMax-only units in those same markets were −1.5%.',
    tags: ['Paid Media', 'YouTube', 'Performance Max'],
    tileBg:
      'radial-gradient(120% 100% at 35% 25%, #6b2a2a 0%, transparent 55%), #1a1010',
    tileImage: '/work/red-robin/appetizer-platter.png',
    tileCollage: [
      '/work/red-robin/drink-specials.png',
      '/work/red-robin/chicken-bacon-club.png',
      '/work/red-robin/towering-sliders.png',
      '/work/red-robin/big-yumm-deals.png',
      '/work/red-robin/appetizer-platter.png',
      '/work/red-robin/whiskey-river-wrap.png',
    ],
    wide: true,
    published: true,
    story: {
      date: 'September 2026',
      seoTitle: 'How MOSAIC grew Red Robin guest traffic with YouTube + Performance Max',
      heroImage: '/work/red-robin/appetizer-platter.png',
      heroImageAlt:
        'Red Robin appetizer platter with chicken, pretzel bites, and dipping sauces',
      results: [
        { value: '+14.5%', label: 'Guest YoY' },
        { value: '+19.5%', label: 'Net sales YoY' },
      ],
      services: ['Paid Media', 'Performance Max', 'YouTube', 'Measurement'],
      startingPoint: [
        'Red Robin already had Performance Max in market. In casual dining, the number that matters is guests through the door — not last-click conversions. Units running PMax without YouTube were essentially flat year-over-year on guest count. Spend was working. It just was not compounding.',
        'The question was specific: when a unit also received YouTube (Demand Gen) on top of Performance Max, did guest traffic actually lift relative to PMax-only units in the same market, in the same period?',
      ],
      solution: [
        {
          eyebrow: 'Media mix',
          heading: 'YouTube as the top-of-funnel layer',
          body: [
            'We did not treat YouTube as a brand tax sitting next to search. It sat on top of Performance Max as the awareness layer — the same creative system, a different altitude.',
            'Because the YouTube roster changes every period, we scored each store-period on whether it actually received both: $50+ YouTube and $50+ PMax. If YouTube dropped off, that unit moved back into the PMax-only set. No static “YouTube markets.”',
          ],
        },
        {
          eyebrow: 'Measurement',
          heading: 'Same-market isolation',
          body: [
            'A national average would have hidden the story. We compared YouTube + PMax units to PMax-only units in the same DMA and the same operating period, on comparable stores with a year-ago guest base. That keeps regional weather, local events, and period length from pretending to be media mix.',
            'Chicago is the cleanest multi-unit read: in P9, YouTube-supported units at Norridge and Valparaiso posted +26.3% and +15.3% guest comps, while PMax-only units in that market were −0.8%. South Plainfield repeated the pattern — +13.8% in P8, then +26.7% in P9 — against PMax-only in New York at −3.7%.',
          ],
        },
        {
          eyebrow: 'Proof points',
          heading: 'The +10% set, rolled together',
          body: [
            'The case-study number is not the average of every YouTube unit. It is the units where YouTube + PMax posted +10% or better guest comps, added together, then compared with PMax-only units sitting in those same markets and periods. Thirteen store-periods, twelve restaurants, ten DMAs.',
          ],
        },
      ],
      impact: [
        { value: '+14.5%', label: 'Guest YoY' },
        { value: '+19.5%', label: 'Net sales YoY' },
      ],
      impactBody: [
        'Those YouTube + PMax units grew guests +14.5% versus last year — +18,848 guests — while PMax-only units in the same markets were −1.5%. Net sales in that same set: +19.5%, or +$475k versus year-ago.',
        'Across every YouTube + PMax unit in P7–P8, not just the +10% tail, guests were +2.0% versus +0.1% for PMax-only, and net sales were +5.4% versus +3.5%. The proof points sit on top of a program that was already ahead — they are not a substitute for it.',
      ],
      methodNote:
        'Comparable stores only. YouTube = Demand Gen with $50+ spend in the period. Guest count and net sales versus year-ago POS. Operating periods P7–P9, FY2026.',
    },
  },
  {
    id: 'bass-pro-high-margin',
    client: 'Bass Pro Shops',
    title: 'High-margin products, up 38% with Performance Max',
    summary:
      'A daily margin label in the feed let clothing and fishing Performance Max campaigns cover the most profitable SKUs. Those products grew revenue 38% year over year, with ROAS up 30%.',
    tags: ['Paid Media', 'Performance Max', 'Retail'],
    tileBg:
      'radial-gradient(120% 100% at 30% 20%, #3d5a3a 0%, transparent 55%), radial-gradient(100% 90% at 80% 80%, #1a2a1c 0%, transparent 55%), #121812',
    tileImage: '/work/bass-pro/high-margin-boat.png',
    published: true,
    story: {
      date: '2025',
      seoTitle:
        'How Bass Pro Shops grew high-margin revenue 38% with Performance Max',
      heroImage: '/work/bass-pro/high-margin-boat.png',
      heroImageAlt:
        'An angler on a Nitro bass boat holding a fish along a tree-lined river',
      heroObjectPosition: '68% 42%',
      results: [
        { value: '+38%', label: 'Revenue' },
        { value: '+30%', label: 'ROAS' },
        { value: '+25%', label: 'Conversions' },
      ],
      services: ['Paid Media', 'Performance Max', 'Product feed', 'Retail'],
      startingPoint: [
        'Bass Pro Shops wanted incremental revenue from the products that actually carry margin. Performance Max could already spend against the catalog. What it could not see was profitability. The feed had no way to mark the most profitable SKUs, so those products could not be pulled into campaigns built to give them more coverage.',
        'The goal was specific: label the highest-margin products in the feed, then use that label inside dedicated Performance Max campaigns — and keep the profitability target when items moved on and off sale.',
      ],
      solution: [
        {
          eyebrow: 'Product feed',
          heading: 'A margin tier that refreshes daily',
          body: [
            'Bass Pro Shops added a dynamic margin rule in the product feed and labeled each SKU low, medium, or high. The labels refreshed every day. During a sale, a product could move tiers, and the campaigns could keep the profitability percentage they were built to hold.',
          ],
        },
        {
          eyebrow: 'Performance Max',
          heading: 'Clothing and fishing, built for the high-margin set',
          body: [
            'iProspect then stood up clothing and fishing Performance Max campaigns dedicated to high-margin support. Volume on those SKUs went up by raising campaign budgets and setting lower ROAS targets — more coverage, still aimed at the profitable products.',
            'Bass Pro Shops and iProspect built the margin label together. Once the high-margin products were marked, the media plan put more budget behind them instead of treating every SKU in the catalog the same.',
          ],
        },
      ],
      impact: [
        { value: '+38%', label: 'Revenue YoY' },
        { value: '+30%', label: 'ROAS YoY' },
        { value: '+25%', label: 'Conversions YoY' },
      ],
      impactBody: [
        'Products in the high-margin custom label picked up additional support year over year, because they finally had Performance Max campaigns built around that label. Revenue on those SKUs rose 38%, with ROAS up 30% and conversions up 25%.',
        'More revenue and a higher return, together, is the signal that the extra coverage was reaching buyers. Bass Pro Shops and iProspect then looked at other categories where the same margin label could run.',
      ],
      quote: {
        text: "Performance Max and dynamic feed rules have allowed us to amplify coverage for our most profitable products and as a result, generate more revenue. Our client couldn't be happier.",
        attribution: 'Skye Smith, Paid Search Manager, iProspect',
      },
      methodNote:
        'Year-over-year results for SKUs in the high-margin custom label, in clothing and fishing Performance Max. Prepared for the Google + dentsu 2025 Case Study Competition.',
    },
  },
  {
    id: 'northline',
    client: 'Northline',
    title: 'A brand system that learns as the product ships',
    summary:
      'Identity, messaging, and generative campaign tools for a climate-tech platform — built so the brand stays coherent while the product moves weekly.',
    tags: ['Brand', 'AI systems', 'Campaign'],
    tileBg:
      'radial-gradient(120% 100% at 20% 25%, #3c4a41 0%, transparent 60%), radial-gradient(100% 90% at 80% 80%, #22282a 0%, transparent 55%), #141518',
  },
  {
    id: 'harbor',
    client: 'Harbor Collective',
    title: 'Turning research into a living content engine',
    summary:
      'We trained a studio workflow on their voice, then shipped a content system that drafts, scores, and publishes without sounding automated.',
    tags: ['Content', 'AI workflow', 'Web'],
    tileBg:
      'radial-gradient(110% 90% at 70% 30%, #46545e 0%, transparent 55%), #121417',
  },
  {
    id: 'kiln',
    client: 'Kiln',
    title: 'Launch creative that adapts in market',
    summary:
      'Paid and organic creative for a DTC launch — modular assets, real-time iteration loops, and a narrative that stayed human at scale.',
    tags: ['Performance', 'Creative', 'AI'],
    tileBg:
      'radial-gradient(110% 90% at 35% 70%, #5c4a3a 0%, transparent 55%), #16130f',
  },
]

export type Expertise = {
  title: string
  body: string
  tileBg: string
}

export const expertise: Expertise[] = [
  {
    title: 'AI Innovation',
    body: 'Harnessing the power of artificial intelligence to create the future of brands and businesses.',
    tileBg:
      'radial-gradient(120% 100% at 25% 30%, #3d4e59 0%, transparent 60%), radial-gradient(90% 80% at 75% 75%, #2a3438 0%, transparent 55%), #0e1113',
  },
  {
    title: 'Brand Storytelling and Content',
    body: 'Unforgettable narratives that build emotional resonance and inspire.',
    tileBg:
      'radial-gradient(110% 90% at 35% 65%, #5c4a3a 0%, transparent 55%), #16130f',
  },
  {
    title: 'Paid Media Support',
    body: 'Hands-on help with ads, targeting, and spend — clear, practical, and built for local growth.',
    tileBg:
      'radial-gradient(120% 100% at 55% 35%, #5e4034 0%, transparent 55%), #16110f',
  },
]

export const industries = [
  'Apartments & Housing',
  'Automotive',
  'Banking & Credit Unions',
  'Beauty, Hair, Nails & Massage',
  'Construction, Trades & Home Services',
  'Dentistry',
  'Education & Schools',
  'Energy & Industrial',
  'Engineering & Professional Services',
  'Fitness & Athletic Training',
  'Holistic, Naturopathic & Functional Medicine',
  'Home Care, Hospice & Senior Living',
  'Insurance & Financial Services',
  'Legal',
  'Maternity, Doula & Family Support',
  'Med Spa, Aesthetics & IV Wellness',
  'Media, Marketing & Technology',
  'Medical — Primary & Specialty Care',
  'Mental & Behavioral Health',
  'Mortgage & Lending',
  'Nonprofits, Charities & Community',
  'Nutrition & Weight Management',
  'Orthodontics',
  'Physical Therapy & Sports Medicine',
  'Prosthetics & Adaptive Medical',
  'Real Estate Brokerages',
  'Recreation, Tourism & Attractions',
  'Restaurants, Food & Beverage',
  'Retail & Consumer Goods',
  'Tattoo & Body Art',
  'Telecom',
  'Title & Escrow',
  'Tourism',
] as const

export function getCaseStudy(id: string) {
  return caseStudies.find((study) => study.id === id)
}

export function getPublishedCaseStudies() {
  return caseStudies.filter((study) => study.published && study.story)
}

export function getCaseStudyPath(study: Pick<CaseStudy, 'id' | 'published'>) {
  return study.published ? `/case-studies/${study.id}` : `/work/${study.id}`
}
