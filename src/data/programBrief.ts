import {
  DIAGNOSTIC_RATING_COUNT,
  QUESTIONS,
  SERVICES,
  answeredRatingCount,
  buildDiagnosticReport,
  emptyDiagnosticAnswers,
  parseStoredDiagnostic,
  type DiagnosticAnswers,
  type DiagnosticReport,
} from './growthDiagnostic'

export const BRIEF_STORAGE_KEY = 'mosaic-program-brief-v4'

const FALLBACK_CODES = ['MOSAIC', 'CHAMBER', 'REFERRAL', 'VERIFY'] as const

export function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase().replace(/[\s_-]/g, '')
}

export function allowedInviteCodes() {
  const fromEnv = (import.meta.env.VITE_BRIEF_CODES as string | undefined)
    ?.split(',')
    .map(normalizeInviteCode)
    .filter(Boolean) ?? []

  return [...new Set([...FALLBACK_CODES, ...fromEnv])]
}

export function isValidInviteCode(value: string) {
  const code = normalizeInviteCode(value)
  return code.length > 0 && allowedInviteCodes().includes(code)
}

export const SUPPORT_OPTIONS = [
  {
    id: 'execution',
    title: 'Executional support',
    body: 'Doing the work with you — campaigns, systems, and follow-through.',
  },
  {
    id: 'teaching',
    title: 'Teaching',
    body: 'Teaching your team how to do the work so it can live in-house.',
  },
  {
    id: 'strategy',
    title: 'Strategy',
    body: 'Peace of mind that you are doing the right work, in the right order.',
  },
] as const

export const ROLE_OPTIONS = [
  { id: 'owner', label: 'Owner / founder' },
  { id: 'marketing', label: 'Marketing lead' },
  { id: 'operations', label: 'Operations' },
  { id: 'other', label: 'Other' },
] as const

export const DURATION_OPTIONS = [
  {
    id: 'project',
    label: 'A defined project',
    hint: 'Usually under 3 months',
  },
  {
    id: 'six-month',
    label: 'A 6-month partnership',
    hint: 'How most MOSAIC retainers begin',
  },
  {
    id: 'ongoing',
    label: 'Ongoing',
    hint: 'As long as the work is useful',
  },
  {
    id: 'in-house',
    label: 'Until we can bring it in-house',
    hint: 'Handoff is the goal',
  },
] as const

export const BUDGET_OPTIONS = [
  {
    id: 'audit',
    label: 'Discovery audit',
    hint: 'Typically around $5,000',
  },
  {
    id: 'retainer',
    label: 'Monthly partnership',
    hint: 'Base fees start at $20,000 / month for 6 months',
  },
  {
    id: 'below',
    label: 'Not in that range yet',
    hint: 'We should say so before a working session',
  },
  {
    id: 'discuss',
    label: 'Prefer to discuss',
    hint: 'Scope first, then the number',
  },
] as const

export const PROCESS_OPTIONS = [
  { id: 'starting', label: 'Just starting to look' },
  { id: 'comparing', label: 'Talking with a few partners' },
  { id: 'ready', label: 'Ready to choose a partner' },
  { id: 'urgent', label: 'Need something in place this month' },
] as const

export type SupportId = (typeof SUPPORT_OPTIONS)[number]['id']
export type RoleId = (typeof ROLE_OPTIONS)[number]['id']
export type DurationId = (typeof DURATION_OPTIONS)[number]['id']
export type BudgetId = (typeof BUDGET_OPTIONS)[number]['id']
export type ProcessId = (typeof PROCESS_OPTIONS)[number]['id']

export type BriefAnswers = DiagnosticAnswers & {
  role: RoleId | ''
  incrementalRevenue: string
  topProducts: string
  currentRoasCpa: string
  support: SupportId[]
  team: string
  duration: DurationId | ''
  inHouseWhen: string
  budget: BudgetId | ''
  pastAgency: string
  process: ProcessId | ''
  questionsForMosaic: string
  working: string
  notWorking: string
}

export type BriefReport = DiagnosticReport & {
  keep: string
  leak: string
  partnership: string
  measure: string
  engagement: string
  budgetNote: string
  firstMove: string
  fitLabel: string
  fitNote: string
  tiles: { label: string; value: string }[]
}

export function emptyBriefAnswers(): BriefAnswers {
  return {
    ...emptyDiagnosticAnswers(),
    role: '',
    incrementalRevenue: '',
    topProducts: '',
    currentRoasCpa: '',
    support: [],
    team: '',
    duration: '',
    inHouseWhen: '',
    budget: '',
    pastAgency: '',
    process: '',
    questionsForMosaic: '',
    working: '',
    notWorking: '',
  }
}

export function parseStoredBrief(raw: string | null): BriefAnswers | null {
  const diagnostic = parseStoredDiagnostic(raw)
  if (!diagnostic) return null
  try {
    const parsed = JSON.parse(raw as string) as Partial<BriefAnswers>
    const support = Array.isArray(parsed.support)
      ? parsed.support.filter((item): item is SupportId =>
          SUPPORT_OPTIONS.some((option) => option.id === item),
        )
      : []

    return {
      ...emptyBriefAnswers(),
      ...diagnostic,
      support,
      role: ROLE_OPTIONS.find((option) => option.id === parsed.role)?.id ?? '',
      incrementalRevenue:
        (typeof parsed.incrementalRevenue === 'string' && parsed.incrementalRevenue) ||
        (typeof (parsed as { goals12?: string }).goals12 === 'string'
          ? ((parsed as { goals12?: string }).goals12 ?? '')
          : ''),
      topProducts: typeof parsed.topProducts === 'string' ? parsed.topProducts : '',
      currentRoasCpa:
        (typeof parsed.currentRoasCpa === 'string' && parsed.currentRoasCpa) ||
        (typeof (parsed as { kpis?: string }).kpis === 'string'
          ? ((parsed as { kpis?: string }).kpis ?? '')
          : ''),
      team: typeof parsed.team === 'string' ? parsed.team : '',
      duration:
        DURATION_OPTIONS.find((option) => option.id === parsed.duration)?.id ?? '',
      inHouseWhen: typeof parsed.inHouseWhen === 'string' ? parsed.inHouseWhen : '',
      budget: BUDGET_OPTIONS.find((option) => option.id === parsed.budget)?.id ?? '',
      pastAgency: typeof parsed.pastAgency === 'string' ? parsed.pastAgency : '',
      process:
        PROCESS_OPTIONS.find((option) => option.id === parsed.process)?.id ?? '',
      questionsForMosaic:
        typeof parsed.questionsForMosaic === 'string' ? parsed.questionsForMosaic : '',
      working: typeof parsed.working === 'string' ? parsed.working : '',
      notWorking: typeof parsed.notWorking === 'string' ? parsed.notWorking : '',
    }
  } catch {
    return {
      ...emptyBriefAnswers(),
      ...diagnostic,
    }
  }
}

function sentence(value: string) {
  const text = value.trim().replace(/\s+/g, ' ')
  if (!text) return ''
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function supportTitles(ids: SupportId[]) {
  const names = ids.flatMap((id) => {
    const title = SUPPORT_OPTIONS.find((option) => option.id === id)?.title
    return title ? [title] : []
  })

  if (names.length <= 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

export function isDirectionReady(answers: BriefAnswers) {
  return (
    answers.incrementalRevenue.trim().length > 0 &&
    answers.topProducts.trim().length > 0 &&
    answers.currentRoasCpa.trim().length > 0
  )
}

export function isPartnershipReady(answers: BriefAnswers) {
  return answers.support.length > 0 && Boolean(answers.duration)
}

export function isFitReady(answers: BriefAnswers) {
  return Boolean(answers.budget) && Boolean(answers.process)
}

export function buildBriefReport(answers: BriefAnswers): BriefReport {
  const diagnostic = buildDiagnosticReport(answers)
  const wantsExecution = answers.support.includes('execution')
  const wantsTeaching = answers.support.includes('teaching')
  const wantsStrategy = answers.support.includes('strategy')
  const goals = sentence(answers.incrementalRevenue)
  const products = sentence(answers.topProducts)
  const working = sentence(answers.working)
  const notWorking = sentence(answers.notWorking)

  const overviewParts = [diagnostic.overview]
  if (goals) {
    overviewParts.push(`Incremental revenue you want in the next 12 months: ${goals}`)
  }
  if (products) {
    overviewParts.push(`Highest-revenue products and services: ${products}`)
  }
  if (working) overviewParts.push(`In your words, what already works: ${working}`)
  if (notWorking) overviewParts.push(`In your words, where it breaks down: ${notWorking}`)

  let partnership =
    'MOSAIC can meet you as a mix of operator, teacher, and sounding board. The next conversation should name which of those you actually need in the first 30 days.'
  if (answers.support.length === 1 && wantsExecution) {
    partnership =
      'You asked for executional support: MOSAIC in the work — offers, follow-up, creative, and the systems that turn inquiries into booked jobs. Strategy still has to sit underneath that, or we will just do more of the wrong activity faster.'
  } else if (answers.support.length === 1 && wantsTeaching) {
    partnership =
      'You asked for teaching. That only works if we pick one system the team will own, write down how it runs, and practice it with them — not a workshop that fades after a week.'
  } else if (answers.support.length === 1 && wantsStrategy) {
    partnership =
      'You asked for strategy: a clear order of work and a way to tell whether it is working. We should still name who executes, or the plan will sit in a folder.'
  } else if (answers.support.length > 1) {
    partnership = `You want ${supportTitles(answers.support).toLowerCase()}. That is doable if we sequence it. First we agree what “good” looks like, then we do a thin slice of the work, then we teach whoever should keep it.`
  }

  const measure = answers.currentRoasCpa.trim()
    ? `Current ROAS/CPA: ${sentence(answers.currentRoasCpa)} Hold that next to the 12-month revenue number so the conversation is about efficiency, not just spend.`
    : 'You have not named a current ROAS or CPA. That is one of the first numbers to put on the table in the working session.'

  let engagement =
    'We still need to name how long this should last, and whether the work is meant to stay with MOSAIC or move in-house.'
  if (answers.duration === 'six-month') {
    engagement =
      'A 6-month partnership is the right container: long enough to install a system, short enough that we have to prove it. Discovery first, then a retainer with a named handoff if you want one later.'
  } else if (answers.duration === 'project') {
    engagement =
      'A short project can diagnose and install one piece. It will not rebuild the whole growth system. We should be honest about what a few weeks can change, and what has to wait.'
  } else if (answers.duration === 'ongoing') {
    engagement =
      'Ongoing support works when the weekly work is visible: what we shipped, what it booked, what we will change next. It fails when it becomes an invisible subscription.'
  } else if (answers.duration === 'in-house') {
    engagement = answers.inHouseWhen.trim()
      ? `You want this in-house ${sentence(answers.inHouseWhen).replace(/\.$/, '')}. We should treat the engagement as a handoff: MOSAIC runs it, documents it, and puts your team on the controls against that date.`
      : 'You want the work to come in-house. We should name a date, a person who will own it, and what “in-house” actually includes — ads, follow-up, reporting, or all of it.'
  }

  let budgetNote =
    'MOSAIC usually starts with a discovery audit around $5,000. Base monthly fees start at $20,000 for a 6-month engagement. Ad spend sits with you.'
  if (answers.budget === 'audit') {
    budgetNote =
      'A discovery audit (~$5,000) is the right first move if we still need to see where booked work leaks before anyone commits to a retainer.'
  } else if (answers.budget === 'retainer') {
    budgetNote =
      'You are in range for a 6-month partnership. Discovery still comes first so the monthly work has a named leak to close, not a generic list of deliverables.'
  } else if (answers.budget === 'below') {
    budgetNote =
      'You said this is not in the $5,000 audit / $20,000-a-month range yet. We should not force a retainer conversation. A free Lead Leak Check or a later season may be the honest next step.'
  } else if (answers.budget === 'discuss') {
    budgetNote =
      'You would rather discuss budget after scope. Fair. The working numbers to hold: discovery around $5,000, and monthly partnerships starting at $20,000 for six months, with ad spend separate.'
  }

  const keep = working
    ? `Keep doing what already works. ${working} The first 30 days should protect that, not replace it with a new stack.`
    : 'Start from a recent win — a job that booked, a campaign that paid, a week the phone rang for the right reason — and write down what you actually did. That is the keep list.'

  const leak = notWorking
    ? `Look more closely here: ${notWorking} Until that is named, more creative or more spend usually makes the same leak more expensive.`
    : 'The usual leak for local owners is not awareness. It is what happens after someone reaches out — missed calls, slow follow-up, an offer that is hard to buy, or no way to see which source booked the job.'

  let firstMove =
    'In the next 30 days: pick one converting action (call, form, or booking), measure how many become real conversations, and close the slowest step.'
  if (wantsTeaching) {
    firstMove =
      'In the next 30 days: choose one system a named person on your team will own — missed-call follow-up, weekly reporting, or the offer page — and run it with them twice, in writing.'
  } else if (wantsStrategy && !wantsExecution) {
    firstMove =
      'In the next 30 days: keep, kill, or pause one channel. Write the KPI, the offer, and the next review date. Do not add a new platform until that is done.'
  } else if (wantsExecution) {
    firstMove =
      'In the next 30 days: map how a lead becomes a booked job today. Fix the slowest handoff (missed call, form sitting, no offer page) before we scale spend.'
  }
  if (answers.process === 'urgent') {
    firstMove = `You need movement this month. ${firstMove}`
  }

  let fitLabel = 'Worth a working conversation'
  let fitNote =
    'Your answers are enough to prepare a discovery call. Bring a recent week of leads if you have it.'
  if (answers.budget === 'below' && answers.process !== 'urgent') {
    fitLabel = 'Pause on a retainer'
    fitNote =
      'The work may still be useful, but a $20,000/month partnership is not the next honest step. We can look at a discovery audit or the free Lead Leak Check instead.'
  } else if (answers.process === 'urgent' && answers.budget === 'retainer') {
    fitLabel = 'Ready to move'
    fitNote =
      'You have urgency and a budget in range. The call should confirm the leak, the 6-month shape, and who decides.'
  } else if (answers.process === 'starting') {
    fitLabel = 'Early, still useful'
    fitNote =
      'You are early in the search. This brief is the conversation starter — not a bake-off. We can go slow on the close and still be specific about the work.'
  }

  const tiles = [
    ...(answers.support.length > 0
      ? [{ label: 'Support', value: supportTitles(answers.support) }]
      : []),
    ...(answers.duration
      ? [
          {
            label: 'Horizon',
            value:
              DURATION_OPTIONS.find((option) => option.id === answers.duration)
                ?.label ?? '',
          },
        ]
      : []),
    ...(answers.budget
      ? [
          {
            label: 'Investment',
            value:
              BUDGET_OPTIONS.find((option) => option.id === answers.budget)
                ?.label ?? '',
          },
        ]
      : []),
    ...(answers.process
      ? [
          {
            label: 'Process',
            value:
              PROCESS_OPTIONS.find((option) => option.id === answers.process)
                ?.label ?? '',
          },
        ]
      : []),
  ]

  const snapshot = [
    diagnostic.snapshot,
    '',
    'WORKING BRIEF',
    ...tiles.map((tile) => `${tile.label}: ${tile.value}`),
    goals ? `12-month incremental revenue: ${goals}` : '',
    products ? `Top products/services: ${products}` : '',
    answers.currentRoasCpa.trim()
      ? `Current ROAS/CPA: ${answers.currentRoasCpa.trim()}`
      : '',
    working ? `Working: ${working}` : '',
    notWorking ? `Not working: ${notWorking}` : '',
    `First 30 days: ${firstMove}`,
  ]
    .filter((line) => line !== '')
    .join('\n')

  return {
    ...diagnostic,
    overview: overviewParts.join(' '),
    snapshot,
    keep,
    leak,
    partnership,
    measure,
    engagement,
    budgetNote,
    firstMove,
    fitLabel,
    fitNote,
    tiles,
  }
}

function briefEmailSubject(answers: BriefAnswers) {
  const hint =
    answers.incrementalRevenue.trim() ||
    answers.topProducts.trim() ||
    answers.company.trim() ||
    answers.name.trim()
  const clipped = hint.replace(/\s+/g, ' ').slice(0, 70)
  return clipped ? `Program brief — ${clipped}` : 'Program brief — hellomosaic.ai'
}

function briefNotificationMessage(
  answers: BriefAnswers,
  report: BriefReport,
  privateReviewUrl: string,
) {
  const direction = [
    answers.incrementalRevenue.trim()
      ? `12-month incremental revenue: ${answers.incrementalRevenue.trim()}`
      : '',
    answers.topProducts.trim()
      ? `Highest-revenue products/services: ${answers.topProducts.trim()}`
      : '',
    answers.currentRoasCpa.trim()
      ? `Current ROAS/CPA: ${answers.currentRoasCpa.trim()}`
      : '',
  ].filter(Boolean)

  return [
    'PRIVATE REVIEW — open this for the pictured report (not shown to the client):',
    privateReviewUrl,
    '',
    'If that page says the link is incomplete, paste the full URL above, including everything after #.',
    '',
    'DIRECTION',
    ...(direction.length > 0 ? direction : ['No direction notes.']),
    '',
    'PICTURE',
    report.headline,
    report.overview,
    '',
    'START HERE',
    report.priority
      .map(
        (item) =>
          `${item.name} ${item.score.toFixed(1)}/5 — ${item.bandLabel}`,
      )
      .join('\n'),
    '',
    'SCORES',
    report.ranked
      .map((item) => `${item.name} ${item.score.toFixed(1)}/5 (${item.band})`)
      .join('\n'),
  ].join('\n')
}

export function briefPayload(
  answers: BriefAnswers,
  report: BriefReport,
  extras?: { privateReviewUrl?: string },
) {
  const privateReviewUrl = extras?.privateReviewUrl?.trim() ?? ''
  const payload = {
    form_type: 'program_brief',
    _subject: briefEmailSubject(answers),
    private_review_url: privateReviewUrl,
    message: privateReviewUrl
      ? briefNotificationMessage(answers, report, privateReviewUrl)
      : '',
    incremental_revenue_12mo: answers.incrementalRevenue,
    top_products_services: answers.topProducts,
    current_roas_cpa: answers.currentRoasCpa,
    ratings_answered: `${answeredRatingCount(answers)} / ${DIAGNOSTIC_RATING_COUNT}`,
    service_scores: report.ranked
      .map((item) => `${item.name} ${item.score.toFixed(1)}/5 (${item.band})`)
      .join('\n'),
    cluster: report.cluster.name,
    headline: report.headline,
    start_here: report.priority
      .map((item) => `${item.name} ${item.score.toFixed(1)}/5 — ${item.bandLabel}`)
      .join('\n'),
    quiz_answers: QUESTIONS.map((question) => {
      const rating = answers.ratings[question.index]
      const service = SERVICES.find((item) => item.id === question.serviceId)?.name
      return `${question.index + 1}. [${rating ?? '—'}] ${service}: ${question.text}`
    }).join('\n'),
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (typeof value !== 'string') return value != null && value !== ''
      return value.trim().length > 0
    }),
  )
}
