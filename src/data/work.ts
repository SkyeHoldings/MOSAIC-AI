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
    title: 'Restaurant brand and content system',
    summary:
      'Brand and content systems for Red Robin — warm, approachable storytelling that scales across locations and channels.',
    tags: ['Brand', 'Content', 'QSR'],
    tileBg:
      'radial-gradient(120% 100% at 35% 25%, #6b2a2a 0%, transparent 55%), #1a1010',
    tileImage: '/work/red-robin.png',
    tileCollage: [
      '/work/red-robin/drink-specials.png',
      '/work/red-robin/chicken-bacon-club.png',
      '/work/red-robin/towering-sliders.png',
      '/work/red-robin/big-yumm-deals.png',
      '/work/red-robin/appetizer-platter.png',
      '/work/red-robin/whiskey-river-wrap.png',
    ],
    wide: true,
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
