export const DIAGNOSTIC_STORAGE_KEY = 'mosaic-growth-diagnostic-v1'
export const DIAGNOSTIC_TOTAL_PAGES = 11
export const DIAGNOSTIC_RATING_COUNT = 30

export const DIAGNOSTIC_SCALE = [
  { value: 1, short: 'Not true', saying: 'Not true of us' },
  { value: 2, short: 'Rarely', saying: 'Rarely true' },
  { value: 3, short: 'Sometimes', saying: 'Sometimes true' },
  { value: 4, short: 'Mostly', saying: 'Mostly true' },
  { value: 5, short: 'Always', saying: 'Consistently true' },
] as const

export const SCALE_LEGEND =
  '1 Not true · 2 Rarely · 3 Sometimes · 4 Mostly · 5 Always'

export type BandId = 'gap' | 'leak' | 'working' | 'strength'
export type ServiceId =
  | 'creative-strategy'
  | 'cro'
  | 'media-mid'
  | 'attribution'
  | 'incrementality'
  | 'seo'
  | 'influencer'
  | 'upper-funnel'
  | 'brand-identity'
  | 'content'
export type ClusterId = 'craft' | 'conversion' | 'reach' | 'proof' | 'mixed'
export type CustomerSource =
  | 'referrals'
  | 'search'
  | 'paid'
  | 'outbound'
  | 'store'
  | 'unsure'
export type MarketingOwner = 'owner' | 'in-house' | 'agency' | 'mix' | 'nobody'
export type Goal12 = 'new-customers' | 'conversion' | 'brand' | 'proof' | 'all-in-order'

export type BandCopy = {
  means: string
  picture: string
  help: string
}

export type ServiceDef = {
  id: ServiceId
  name: string
  page: number
  line: string
  questions: [string, string, string]
  clusters: Exclude<ClusterId, 'mixed'>[]
  color: string
  cards: Record<BandId, BandCopy>
}

export const SOURCE_OPTIONS: { id: CustomerSource; label: string }[] = [
  { id: 'referrals', label: 'Referrals / people who already know us' },
  { id: 'search', label: 'Google / search' },
  { id: 'paid', label: 'Paid ads' },
  { id: 'outbound', label: 'Sales team or outbound' },
  { id: 'store', label: 'Store / location traffic' },
  { id: 'unsure', label: 'Not sure' },
]

export const OWNER_OPTIONS: { id: MarketingOwner; label: string }[] = [
  { id: 'owner', label: 'Me / owner' },
  { id: 'in-house', label: 'In-house marketer or team' },
  { id: 'agency', label: 'An agency or freelancer' },
  { id: 'mix', label: 'A mix' },
  { id: 'nobody', label: 'Nobody, really' },
]

export const GOAL_OPTIONS: { id: Goal12; label: string }[] = [
  { id: 'new-customers', label: 'More new customers' },
  { id: 'conversion', label: 'Better conversion of the traffic we already get' },
  { id: 'brand', label: 'A brand we can grow on' },
  { id: 'proof', label: 'Knowing what is actually working' },
  { id: 'all-in-order', label: 'All of it, in the right order' },
]

export const BAND_META: Record<
  BandId,
  { label: string; range: string; color: string }
> = {
  gap: {
    label: 'Needs assistance now',
    range: '1.0 – 2.4',
    color: '#B95820',
  },
  leak: {
    label: 'Inconsistent — this is costing you',
    range: '2.5 – 3.4',
    color: '#9B6E0C',
  },
  working: {
    label: 'In place — still worth tightening',
    range: '3.5 – 4.2',
    color: '#26796F',
  },
  strength: {
    label: 'Protect this',
    range: '4.3 – 5.0',
    color: '#2B62A2',
  },
}

export const CLUSTER_META: Record<
  ClusterId,
  {
    id: ClusterId
    name: string
    color: string
    image: string
    imageAlt: string
    picture: string
  }
> = {
  craft: {
    id: 'craft',
    name: 'Craft',
    color: '#B95820',
    image: '/pillars/planning-creative.png',
    imageAlt: 'Editorial still used for MOSAIC planning and creative work',
    picture:
      'Your answers say the work does not look, sound, or feel like one company yet — or the creative is not tied to a test. Channels will keep feeling expensive until the story, the assets, and the brief are reusable. MOSAIC’s first job is a system you can make from: identity, a content rhythm, and creative that has a hypothesis.',
  },
  conversion: {
    id: 'conversion',
    name: 'Conversion',
    color: '#9B6E0C',
    image: '/pillars/strategy-optimization.png',
    imageAlt: 'Abstract study used for MOSAIC strategy and conversion work',
    picture:
      'Money is reaching people who are already close — and then leaking. Mid-funnel spend without a converting page, or a page nobody is allowed to test, is how good budgets look average. MOSAIC’s first job is the destination and the weekly test cadence, then the buy that feeds it.',
  },
  reach: {
    id: 'reach',
    name: 'Reach',
    color: '#26796F',
    image: '/pillars/stack/neon-city-horizon.png',
    imageAlt: 'City-horizon artwork used for MOSAIC activation and growth work',
    picture:
      'People who already know you can still find you. The next customer does not have a reliable path in. Search, paid, creators, or awareness may be on, but not as a planned mix. MOSAIC’s first job is one converting destination plus the channel that can prove the next customer — then, if it earns it, upper funnel.',
  },
  proof: {
    id: 'proof',
    name: 'Proof',
    color: '#2B62A2',
    image: '/pillars/stack/constellation-data.png',
    imageAlt: 'Constellation artwork used for MOSAIC reporting and proof work',
    picture:
      'You cannot yet defend the spend. Tracking, reporting, or incrementality is thin, so every meeting becomes an opinion. MOSAIC’s first job is to map one inquiry from click to booked or lost, automate what you can see, and stop funding vanity metrics.',
  },
  mixed: {
    id: 'mixed',
    name: 'Mixed',
    color: '#53687C',
    image: '/pillars/stack/holo-ui-panels.png',
    imageAlt: 'Interface artwork used when leaks sit in more than one part of the mix',
    picture:
      'There is not a single villain. A few services are ahead of the others, and the leaks sit in different parts of the mix. That is common. MOSAIC would not “do everything.” We would take your three lowest scores, in order, and make the first 90 days about those only.',
  },
}

export const CLUSTER_RADAR_ORDER: Exclude<ClusterId, 'mixed'>[] = [
  'craft',
  'reach',
  'proof',
  'conversion',
]

export const SERVICES: ServiceDef[] = [
  {
    id: 'creative-strategy',
    name: 'Creative Strategy',
    page: 2,
    line: 'Creative that is not tied to a test is a wish, not a plan.',
    questions: [
      'We brief new creative against a hypothesis we can test — audience, offer, or format — not only a look we like.',
      'When a piece of creative works, we can say why, and we make the next round from that — not from scratch.',
      'We have a testing cadence for ads and content. We do not wait until everything is fatigued and then scramble.',
    ],
    clusters: ['craft'],
    color: '#B95820',
    cards: {
      gap: {
        means: 'Creative is being made as art or as panic. There is no brief tied to a test.',
        picture:
          'You are paying to produce, then hoping. When something works, nobody can say why, so the next round starts at zero. That is how ad accounts fill with “new” work that is not actually learning.',
        help: 'A creative testing program — hypothesis, brief, production, read, next round. Media and creative in the same conversation, not two vendors guessing at each other.',
      },
      leak: {
        means: 'You test sometimes. You also still ship looks because someone liked them.',
        picture: 'Wins do not compound. Fatigue still surprises you.',
        help: 'A monthly testing roadmap and a kill/keep rule so “new creative” has a job.',
      },
      working: {
        means: 'The habit is there. The cadence or the read can still tighten.',
        picture: '',
        help: 'Faster iteration and clearer hypotheses — especially pairing tests with landing pages and the buy.',
      },
      strength: {
        means:
          'Protect the discipline. Do not let a rebrand or a new channel throw you back to taste-only briefs.',
        picture: '',
        help: '',
      },
    },
  },
  {
    id: 'cro',
    name: 'CRO / Website / Landing Page',
    page: 3,
    line: 'Spend without a converting destination is a leak with a budget.',
    questions: [
      'Paid and campaign traffic lands on a page built for that offer — not a generic homepage.',
      'We can launch a landing-page or form test in days or weeks, without waiting a quarter on another team.',
      'We know which step loses the most people between click and inquiry (or booked job), and we have changed something there in the last 90 days.',
    ],
    clusters: ['conversion'],
    color: '#9B6E0C',
    cards: {
      gap: {
        means: 'Traffic is landing on a site that was not built to convert that click.',
        picture:
          'This is the quiet tax on every other service. Strong ads into a weak page look like “ads don’t work.” Internal delay — waiting on another team, waiting on a redesign — is how tests happen quarterly instead of weekly.',
        help: 'Offer-specific destinations, form and page tests you can ship without begging a product queue, and a read on the step that actually loses the lead.',
      },
      leak: {
        means: 'You have pages. You do not have a testing rhythm.',
        picture: 'Small leaks (slow forms, vague offers, homepage catch-alls) sit for months.',
        help: 'A landing-page and offer testing cadence on the live campaigns, not a someday redesign.',
      },
      working: {
        means: '',
        picture: '',
        help: 'Tighter experiments and better match between ad promise and page.',
      },
      strength: {
        means: 'Protect the right to test. Do not fold campaign pages back into a generic homepage.',
        picture: '',
        help: '',
      },
    },
  },
  {
    id: 'media-mid',
    name: 'Media Buying (Mid–Lower Funnel)',
    page: 4,
    line: 'Master the channel that can prove a customer before you chase the next platform.',
    questions: [
      'Search, paid social, or retargeting — people already looking, or already on the site — has an owner and a weekly rhythm.',
      'Budget is concentrated where we can prove a customer. We are not spreading spend thin across every new platform.',
      'We have a written plan for the next dollar of mid-funnel spend (who, offer, destination, kill rule) — not just “keep it on.”',
    ],
    clusters: ['conversion', 'reach'],
    color: '#26796F',
    cards: {
      gap: {
        means: 'The channels that should prove a customer are unowned, thin, or scattered.',
        picture:
          'Chasing the next platform (or running everything at once) without mastering one is a gamble. Mid-funnel is where intent already exists — search, retargeting, people on the site. If this is weak, upper funnel and brand spend have nowhere to land.',
        help: 'One planned buy at a time. Who, offer, destination, weekly rhythm, and a kill rule. Then scale. We do not spread a small budget across five networks to look busy.',
      },
      leak: {
        means: 'Something is on. The plan is not.',
        picture: '',
        help: 'Concentrate spend, name the primary channel, pause what cannot explain a customer.',
      },
      working: {
        means: '',
        picture: '',
        help: 'Better structure, tighter match to creative and pages, cleaner scaling rules.',
      },
      strength: {
        means: 'Protect concentration. New platforms wait until this one is boringly solid.',
        picture: '',
        help: '',
      },
    },
  },
  {
    id: 'attribution',
    name: 'Attribution and Analysis',
    page: 5,
    line: 'If you cannot name what booked the job, you are funding a guess.',
    questions: [
      'Conversion tracking is automated. We do not rebuild the week in a spreadsheet to know what happened.',
      'I can name which source booked the last real customer — not only which ad got clicks.',
      'Reporting is built for keep / kill / pause decisions. We look at it on a set cadence, not only when something feels off.',
    ],
    clusters: ['proof'],
    color: '#2B62A2',
    cards: {
      gap: {
        means: 'You cannot see the path from click to booked work without a scavenger hunt.',
        picture:
          'Spreadsheets, missing pixels, and vanity dashboards add up to wasted money. Meetings become opinions. Good channels get cut; weak ones survive because someone liked the screenshot.',
        help: 'Tracking that is actually connected, a report you can make a keep/kill decision from, and a cadence so you are not only looking when something feels off.',
      },
      leak: {
        means: 'You can see clicks. You cannot always see the customer.',
        picture: '',
        help: 'Close the last-mile (calls, forms, booked jobs) and stop calling platform ROAS the whole story.',
      },
      working: {
        means: '',
        picture: '',
        help: 'Cleaner automation and decision-grade reporting — less archaeology.',
      },
      strength: {
        means: 'Protect the cadence. Do not add tools that nobody reads.',
        picture: '',
        help: '',
      },
    },
  },
  {
    id: 'incrementality',
    name: 'Incrementality Testing',
    page: 6,
    line: 'Platform ROAS can look healthy while you pay for people who would have bought anyway.',
    questions: [
      'We have a way to tell whether ads are finding new customers or talking to people who would have bought anyway.',
      'We have run — or have a plan to run — a holdout, geo test, or similar check. We do not rely only on the platform’s ROAS screenshot.',
      'We judge campaigns on incremental customers and wasted overlap, not only CTR, CPC, or vanity reach.',
    ],
    clusters: ['proof'],
    color: '#1E4A7A',
    cards: {
      gap: {
        means: 'You may be paying for people who were going to buy anyway.',
        picture:
          'This is the expensive blind spot. Platform metrics can look healthy while ads hit current customers, branded search, or demand that was already there. Ignoring incrementality is how “good ROAS” still fails to grow the business.',
        help: 'We start simple — branded vs. non-branded, geo or holdout where it is feasible, and a definition of incremental customer you can live with. You do not need a data-science team to stop funding overlap.',
      },
      leak: {
        means: 'You suspect the overlap. You have not measured it.',
        picture: '',
        help: 'One honest test in the next cycle, not a year of theory.',
      },
      working: {
        means: '',
        picture: '',
        help: 'A repeatable incrementality check so scaling does not quietly buy the same buyer twice.',
      },
      strength: {
        means: 'Protect the habit of asking “would they have come anyway?” before you scale.',
        picture: '',
        help: '',
      },
    },
  },
  {
    id: 'seo',
    name: 'SEO',
    page: 7,
    line: 'The next customer should be able to find you without already knowing your name.',
    questions: [
      'Someone new can find us on Google for the work we actually want to sell — not only for our brand name.',
      'The site has a plan for pages that match search intent (services, locations, offers). It is not just a homepage and a blog that went quiet.',
      'We can see which search terms and pages lead to inquiries, not only which keywords rank.',
    ],
    clusters: ['reach'],
    color: '#1F6B64',
    cards: {
      gap: {
        means: 'The next customer cannot find you unless they already know your name.',
        picture:
          'Paid then has to do 100% of discovery. That is a fragile mix. A homepage and a quiet blog are not a search program.',
        help: 'Pages that match how people search for the work you sell, technical basics that do not fight you, and a way to see which terms become inquiries.',
      },
      leak: {
        means: 'Some pages exist. There is no plan, or rankings never get tied to leads.',
        picture: '',
        help: 'A short list of pages worth owning, and measurement that cares about inquiries, not only positions.',
      },
      working: {
        means: '',
        picture: '',
        help: 'Sharper pages and a cleaner path from search to offer.',
      },
      strength: {
        means: 'Protect the pages that already convert. Do not chase every keyword.',
        picture: '',
        help: '',
      },
    },
  },
  {
    id: 'influencer',
    name: 'Influencer',
    page: 8,
    line: 'A follower count is not a brief. A collaboration has a job.',
    questions: [
      'Creator or influencer work is briefed against an audience and an offer — not only a follower count or a complimentary post.',
      'Before we pay, we can say what the collaboration is supposed to produce: traffic, usable content, trust, or a measurable inquiry.',
      'We reuse creator content in ads and on the site. A post is not a one-week splash that disappears.',
    ],
    clusters: ['reach'],
    color: '#3D8B82',
    cards: {
      gap: {
        means: 'Creators are a favor, a one-off, or not in the mix with any brief.',
        picture:
          'Follower count is not a strategy. If you pay and cannot say the job of the post — traffic, assets, trust, inquiries — you bought a moment. MOSAIC would either brief it properly or keep the budget in channels you can read.',
        help: 'A brief, a usage plan (ads and site, not only their grid), and a definition of done before money moves.',
      },
      leak: {
        means: 'You have tried it. The work dies on their page.',
        picture: '',
        help: 'Rights and cutdowns so one collaboration feeds paid and the website.',
      },
      working: {
        means: '',
        picture: '',
        help: 'Tighter creator fit and a reuse system so you are not starting over each time.',
      },
      strength: {
        means: 'Protect the brief. Do not add creators who cannot feed the rest of the mix.',
        picture: '',
        help: '',
      },
    },
  },
  {
    id: 'upper-funnel',
    name: 'Upper Funnel (YouTube / Display)',
    page: 9,
    line: 'Awareness spend needs a job, an audience, and a next step — or it is expensive wallpaper.',
    questions: [
      'YouTube, display, or other awareness spend has a defined audience, a message, and a next step (site, search, offer).',
      'We turn on upper funnel because it has a role in the mix — not because mid-funnel felt expensive this month.',
      'We have a directional way to connect upper-funnel exposure to later search, site visits, or sales. We are not flying blind after the impression.',
    ],
    clusters: ['reach'],
    color: '#155E57',
    cards: {
      gap: {
        means: 'Awareness is off, random, or running without a next step.',
        picture:
          'Turning on YouTube or display because mid-funnel felt expensive is how budgets disappear. Upper funnel is useful when it has an audience, a message, and a place to send people — and when you can see something downstream. Until mid-funnel and the destination work, this is usually later, not first.',
        help: 'If this is a true gap and mid-funnel is already standing, we build a real awareness job. If mid-funnel is also weak, we say so, and we do not sell you wallpaper.',
      },
      leak: {
        means: 'Impressions are happening. The handoff is not.',
        picture: '',
        help: 'Audience, message, destination, and a directional read into search and site.',
      },
      working: {
        means: '',
        picture: '',
        help: 'Cleaner frequency, better creative for the format, tighter connection to the rest of the funnel.',
      },
      strength: {
        means:
          'Protect the job of the spend. Do not let it become “always on” with no downstream question.',
        picture: '',
        help: '',
      },
    },
  },
  {
    id: 'brand-identity',
    name: 'Brand Identity',
    page: 10,
    line: 'If a stranger cannot tell why they would choose you, every channel works harder than it should.',
    questions: [
      'Someone new can tell what we do and why they would choose us in a few seconds — site, profile, or ad.',
      'Ads, the website, and sales materials look and sound like one company, not several.',
      'We have a reusable visual and message system, so new work does not start from a blank page every time.',
    ],
    clusters: ['craft'],
    color: '#C47A45',
    cards: {
      gap: {
        means: 'A stranger still has to work to understand you.',
        picture:
          'Inconsistent look and language makes every ad, page, and sales conversation start over. Teams argue taste because there is no system. This is not vanity. It is why creative and CRO feel harder than they should.',
        help: 'Positioning, a visual and message system you can reuse, and launch materials that the site and ads can actually run.',
      },
      leak: {
        means: 'You have a look. It does not show up everywhere, or it does not say why you.',
        picture: '',
        help: 'Tighten the system and roll it into the destinations and ads you already pay for.',
      },
      working: {
        means: '',
        picture: '',
        help: 'Extend the system into campaign work so new channels do not invent a second brand.',
      },
      strength: {
        means: 'Protect consistency. New campaigns borrow from the system; they do not replace it.',
        picture: '',
        help: '',
      },
    },
  },
  {
    id: 'content',
    name: 'Content (Video / Photos)',
    page: 11,
    line: 'One burst of content, then silence, is not a system. Ads and the site starve.',
    questions: [
      'We produce video and photo on a rhythm — not one shoot, then months of recycling the same three assets.',
      'Content is made to work as ads, site, and follow-up, not only as a social post.',
      'We have current footage of the real business, so creative does not stall because nobody has anything to shoot with.',
    ],
    clusters: ['craft'],
    color: '#8C3D16',
    cards: {
      gap: {
        means: 'The account is hungry and the cupboard is empty.',
        picture:
          'Strategy without current video and photo is a brief nobody can fill. One shoot a year, then silence, is why ads get generic and the site looks dated. MOSAIC runs content as part of the growth system — monthly rhythm, shot for ads and web, not only for the grid.',
        help: 'A production cadence (video + photo) with cutdowns and variants so paid and the site are fed on purpose.',
      },
      leak: {
        means: 'You make things. Not often enough, or not in the formats the channels need.',
        picture: '',
        help: 'One shoot, many uses. Ad cutdowns, page stills, follow-up. Stop treating production as a separate hobby.',
      },
      working: {
        means: '',
        picture: '',
        help: 'More usable variants and a tighter brief so each shoot works harder.',
      },
      strength: {
        means:
          'Protect the rhythm. Do not pause production every time media feels “fine.” Fine is when you stock the cupboard.',
        picture: '',
        help: '',
      },
    },
  },
]

export const QUESTIONS = SERVICES.flatMap((service) =>
  service.questions.map((text, offset) => ({
    index: (service.page - 2) * 3 + offset,
    serviceId: service.id,
    text,
  })),
)

export type DiagnosticAnswers = {
  name: string
  email: string
  company: string
  consent: boolean
  revenueInput: string
  revenuePreferNot: boolean
  spendInput: string
  spendPreferNot: boolean
  source: CustomerSource | ''
  owner: MarketingOwner | ''
  goal: Goal12 | ''
  ratings: Record<number, number>
}

export function emptyDiagnosticAnswers(): DiagnosticAnswers {
  return {
    name: '',
    email: '',
    company: '',
    consent: false,
    revenueInput: '',
    revenuePreferNot: false,
    spendInput: '',
    spendPreferNot: false,
    source: '',
    owner: '',
    goal: '',
    ratings: {},
  }
}

export function parseDollars(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const value = Number(cleaned)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value)
}

export function formatMoney(value: number): string {
  if (value === 0) return '$0'
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    const text =
      millions >= 10 || Number.isInteger(millions)
        ? String(Math.round(millions))
        : millions.toFixed(1).replace(/\.0$/, '')
    return `$${text}M`
  }
  if (value >= 1_000) {
    const thousands = value / 1_000
    const text =
      thousands >= 10 || Number.isInteger(thousands)
        ? String(Math.round(thousands))
        : thousands.toFixed(1).replace(/\.0$/, '')
    return `$${text}k`
  }
  return `$${Math.round(value).toLocaleString('en-US')}`
}

export function resolvedRevenue(answers: DiagnosticAnswers): number | null {
  if (answers.revenuePreferNot) return null
  return parseDollars(answers.revenueInput)
}

export function resolvedSpend(answers: DiagnosticAnswers): number | null {
  if (answers.spendPreferNot) return null
  return parseDollars(answers.spendInput)
}

export function isYouReady(answers: DiagnosticAnswers) {
  return (
    answers.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email) &&
    answers.consent
  )
}

export function isFactsReady(answers: DiagnosticAnswers) {
  const revenueOk = answers.revenuePreferNot || resolvedRevenue(answers) !== null
  const spendOk = answers.spendPreferNot || resolvedSpend(answers) !== null
  return (
    revenueOk &&
    spendOk &&
    Boolean(answers.source) &&
    Boolean(answers.owner) &&
    Boolean(answers.goal)
  )
}

export function ratingsOnPage(answers: DiagnosticAnswers, serviceIndex: number) {
  const start = serviceIndex * 3
  return [0, 1, 2].every((offset) => {
    const value = answers.ratings[start + offset]
    return value >= 1 && value <= 5
  })
}

export function answeredRatingCount(answers: DiagnosticAnswers) {
  return QUESTIONS.filter((_, index) => {
    const value = answers.ratings[index]
    return value >= 1 && value <= 5
  }).length
}

export function ratingsComplete(answers: DiagnosticAnswers) {
  return answeredRatingCount(answers) === DIAGNOSTIC_RATING_COUNT
}

export function bandFor(score: number): BandId {
  if (score <= 2.4) return 'gap'
  if (score <= 3.4) return 'leak'
  if (score <= 4.2) return 'working'
  return 'strength'
}

export type ServiceScore = {
  id: ServiceId
  name: string
  score: number
  percent: number
  band: BandId
  color: string
  bandColor: string
}

export type ClusterScore = {
  id: Exclude<ClusterId, 'mixed'>
  name: string
  score: number
  percent: number
  color: string
}

export type PriorityCard = {
  id: ServiceId
  name: string
  score: number
  band: BandId
  bandLabel: string
  means: string
  picture: string
  help: string
  color: string
}

export type DiagnosticReport = {
  firstName: string
  companyLine: string
  summaryLine: string
  headline: string
  overview: string
  cluster: (typeof CLUSTER_META)[ClusterId]
  scores: ServiceScore[]
  ranked: ServiceScore[]
  clusterScores: ClusterScore[]
  priority: PriorityCard[]
  strength: ServiceScore | null
  strengthLine: string
  close: string
  helpPrefix: string
  snapshot: string
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10
}

export function scoreServices(ratings: Record<number, number>): ServiceScore[] {
  return SERVICES.map((service, serviceIndex) => {
    const values = [0, 1, 2].map((offset) => ratings[serviceIndex * 3 + offset] ?? 0)
    const answered = values.filter((value) => value >= 1)
    const score = answered.length
      ? roundOne(answered.reduce((sum, value) => sum + value, 0) / answered.length)
      : 0
    const band = bandFor(score || 1) // unanswered stays in the gap band visually
    return {
      id: service.id,
      name: service.name,
      score,
      percent: Math.max(0, Math.min(100, ((Math.max(score, 1) - 1) / 4) * 100)),
      band,
      color: service.color,
      bandColor: BAND_META[band].color,
    }
  })
}

export function rankServices(scores: ServiceScore[]) {
  return [...scores].sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score
    return SERVICES.findIndex((item) => item.id === a.id) -
      SERVICES.findIndex((item) => item.id === b.id)
  })
}

export function scoreClusters(scores: ServiceScore[]): ClusterScore[] {
  return CLUSTER_RADAR_ORDER.map((id) => {
    const members = scores.filter((item) =>
      SERVICES.find((service) => service.id === item.id)?.clusters.includes(id),
    )
    const score = members.length
      ? roundOne(members.reduce((sum, item) => sum + item.score, 0) / members.length)
      : 0
    return {
      id,
      name: CLUSTER_META[id].name,
      score,
      percent: Math.max(0, Math.min(100, ((Math.max(score, 1) - 1) / 4) * 100)),
      color: CLUSTER_META[id].color,
    }
  })
}

function pickCluster(ranked: ServiceScore[], source: CustomerSource | ''): ClusterId {
  const lowestThree = ranked.slice(0, 3)
  const counts: Record<Exclude<ClusterId, 'mixed'>, number> = {
    craft: 0,
    conversion: 0,
    reach: 0,
    proof: 0,
  }

  lowestThree.forEach((item) => {
    const service = SERVICES.find((entry) => entry.id === item.id)
    service?.clusters.forEach((cluster) => {
      counts[cluster] += 1
    })
  })

  const winners = (Object.entries(counts) as [Exclude<ClusterId, 'mixed'>, number][])
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])

  const leanReach = source === 'referrals' && counts.reach >= 1
  const leanConversion = source === 'paid' && counts.conversion >= 1
  const leanProof = source === 'paid' && counts.proof >= 1

  if (!winners.length) {
    if (leanReach) return 'reach'
    if (leanConversion) return 'conversion'
    if (leanProof) return 'proof'
    return 'mixed'
  }

  if (winners.length > 1) {
    if (leanReach && winners.some(([id]) => id === 'reach')) return 'reach'
    if (leanConversion && winners.some(([id]) => id === 'conversion')) return 'conversion'
    if (leanProof && winners.some(([id]) => id === 'proof')) return 'proof'
  }

  return winners[0][0]
}

function ownerHelpPrefix(owner: MarketingOwner | '') {
  if (owner === 'owner' || owner === 'nobody') {
    return 'MOSAIC would do this work with you.'
  }
  if (owner === 'in-house') {
    return 'MOSAIC would teach and put a system under the team.'
  }
  if (owner === 'agency') {
    return 'MOSAIC would put a spine under the existing spend so it has an owner.'
  }
  if (owner === 'mix') {
    return 'MOSAIC would name who owns what in the first 90 days.'
  }
  return 'MOSAIC would take this picture and put an owner on the first leak.'
}

function sourceColor(cluster: ClusterId, source: CustomerSource | '') {
  if (source === 'referrals' && cluster === 'reach') {
    return 'You already said most customers come from people who know you. That matches this picture: the next customer still needs a path in.'
  }
  if (source === 'paid' && (cluster === 'conversion' || cluster === 'proof')) {
    return 'You already spend on ads. The leak is what happens after the click, or whether you can defend that spend.'
  }
  return ''
}

function goalClose(goal: Goal12 | '') {
  if (goal === 'new-customers') {
    return 'You said the next year has to mean more new customers — that is the job of this order.'
  }
  if (goal === 'conversion') {
    return 'You said the next year has to mean better conversion of the traffic you already get — that is the job of this order.'
  }
  if (goal === 'brand') {
    return 'You said the next year has to mean a brand you can grow on — that is the job of this order.'
  }
  if (goal === 'proof') {
    return 'You said the next year has to mean knowing what is actually working — that is the job of this order.'
  }
  if (goal === 'all-in-order') {
    return 'You asked for all of it, in the right order. The order is the point.'
  }
  return ''
}

function toPriorityCard(score: ServiceScore): PriorityCard {
  const service = SERVICES.find((item) => item.id === score.id)!
  const copy = service.cards[score.band]
  return {
    id: score.id,
    name: score.name,
    score: score.score,
    band: score.band,
    bandLabel: BAND_META[score.band].label,
    means: copy.means,
    picture: copy.picture,
    help: copy.help,
    color: score.bandColor,
  }
}

export function buildDiagnosticReport(answers: DiagnosticAnswers): DiagnosticReport {
  const firstName = answers.name.trim().split(/\s+/)[0] || 'there'
  const company = answers.company.trim()
  const companyLine = company || 'Your marketing'
  const scores = scoreServices(answers.ratings)
  const ranked = rankServices(scores)
  const clusterScores = scoreClusters(scores)
  const gapCount = scores.filter((item) => item.band === 'gap').length
  const lowest = ranked[0]
  const tied = ranked.filter((item) => Math.abs(item.score - lowest.score) <= 0.1)
  const mostlyWorking = scores.every((item) => item.score >= 3.5)
  const clusterId = pickCluster(ranked, answers.source)
  const cluster = CLUSTER_META[clusterId]
  const priorityScores = ranked.slice(0, 3)
  if (ranked[3]?.band === 'gap') priorityScores.push(ranked[3])
  const priority = priorityScores.map(toPriorityCard)
  const strengthCandidate = [...scores].sort((a, b) => b.score - a.score)[0]
  const strength =
    strengthCandidate && strengthCandidate.score >= 3.5 ? strengthCandidate : null

  let headline = `${lowest.name} is where assistance would move the number first.`
  if (gapCount >= 4) {
    headline =
      'This is not one broken channel. The mix is running without a spine. MOSAIC would start by naming the order.'
  } else if (mostlyWorking) {
    headline = 'The system is standing. The work now is tightening, not rebuilding.'
  } else if (tied.length >= 2) {
    headline = `${tied[0].name} and ${tied[1].name} are the quiet leaks. That is the right place to start.`
  }

  const overviewParts = [cluster.picture]
  const sourceLine = sourceColor(clusterId, answers.source)
  if (sourceLine) overviewParts.push(sourceLine)

  const summaryBits = [companyLine]
  const revenue = resolvedRevenue(answers)
  const spend = resolvedSpend(answers)
  if (revenue !== null) summaryBits.push(`About ${formatMoney(revenue)} revenue`)
  if (spend !== null) summaryBits.push(`${formatMoney(spend)}/mo ads`)
  summaryBits.push('10 services scored 1–5')
  summaryBits.push('lowest = highest priority')

  const closeBits = [
    'We would not start with a new logo, a new platform, and a new dashboard in the same month. We would take this picture, pick the first leak, and run a defined 90-day pass: destination, creative, buy, and a way to see what booked. You would leave the working session knowing the order — and what we would actually do.',
  ]
  const goalLine = goalClose(answers.goal)
  if (goalLine) closeBits.push(goalLine)

  const helpPrefix = ownerHelpPrefix(answers.owner)
  const strengthLine = strength
    ? `${strength.name} is already working. Do not tear it down to “fix marketing.” Build next to it.`
    : ''

  const snapshot = [
    `MOSAIC | Growth diagnostic | ${companyLine}`,
    '',
    headline,
    summaryBits.join(' · '),
    '',
    cluster.picture,
    sourceLine,
    '',
    'SCORES (lowest first)',
    ...ranked.map((item) => `${item.name}: ${item.score.toFixed(1)}/5 · ${BAND_META[item.band].label}`),
    '',
    'START HERE',
    ...priority.map(
      (item) =>
        `${item.name} ${item.score.toFixed(1)}/5 — ${item.means || item.help}`,
    ),
    strengthLine ? `\nPROTECT THIS\n${strengthLine}` : '',
    '',
    closeBits.join(' '),
    '',
    'This is a self-score, not an audit. It is how we prepare a conversation. It is not a proposal or a contract.',
  ]
    .filter((line) => line !== '')
    .join('\n')

  return {
    firstName,
    companyLine,
    summaryLine: summaryBits.join(' · '),
    headline,
    overview: overviewParts.join(' '),
    cluster,
    scores,
    ranked,
    clusterScores,
    priority,
    strength,
    strengthLine,
    close: closeBits.join(' '),
    helpPrefix,
    snapshot,
  }
}

export function parseStoredDiagnostic(raw: string | null): DiagnosticAnswers | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<DiagnosticAnswers>
    const base = emptyDiagnosticAnswers()
    const ratings: Record<number, number> = {}
    const rawRatings =
      parsed.ratings && typeof parsed.ratings === 'object' ? parsed.ratings : {}
    Object.entries(rawRatings).forEach(([key, value]) => {
      const index = Number(key)
      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < DIAGNOSTIC_RATING_COUNT &&
        Number.isInteger(value) &&
        Number(value) >= 1 &&
        Number(value) <= 5
      ) {
        ratings[index] = Number(value)
      }
    })

    return {
      ...base,
      name: typeof parsed.name === 'string' ? parsed.name : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      company: typeof parsed.company === 'string' ? parsed.company : '',
      consent: parsed.consent === true,
      revenueInput: typeof parsed.revenueInput === 'string' ? parsed.revenueInput : '',
      revenuePreferNot: parsed.revenuePreferNot === true,
      spendInput: typeof parsed.spendInput === 'string' ? parsed.spendInput : '',
      spendPreferNot: parsed.spendPreferNot === true,
      source: SOURCE_OPTIONS.find((option) => option.id === parsed.source)?.id ?? '',
      owner: OWNER_OPTIONS.find((option) => option.id === parsed.owner)?.id ?? '',
      goal: GOAL_OPTIONS.find((option) => option.id === parsed.goal)?.id ?? '',
      ratings,
    }
  } catch {
    return null
  }
}
