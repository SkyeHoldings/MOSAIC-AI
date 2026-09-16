export const BRIEF_STORAGE_KEY = 'mosaic-program-brief-v1'

const FALLBACK_CODES = ['MOSAIC', 'CHAMBER', 'REFERRAL'] as const

export function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase().replace(/[\s_-]/g, '')
}

export function allowedInviteCodes() {
  const fromEnv = (import.meta.env.VITE_BRIEF_CODES as string | undefined)
    ?.split(',')
    .map(normalizeInviteCode)
    .filter(Boolean)

  return fromEnv && fromEnv.length > 0 ? fromEnv : [...FALLBACK_CODES]
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

export type BriefAnswers = {
  name: string
  email: string
  company: string
  role: RoleId | ''
  goals6: string
  goals12: string
  support: SupportId[]
  kpis: string
  growthPast: string
  growthWanted: string
  team: string
  duration: DurationId | ''
  inHouseWhen: string
  budget: BudgetId | ''
  pastAgency: string
  process: ProcessId | ''
  questionsForMosaic: string
  working: string
  notWorking: string
  consent: boolean
}

export type BriefReport = {
  firstName: string
  companyLine: string
  headline: string
  overview: string
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
    name: '',
    email: '',
    company: '',
    role: 'owner',
    goals6: '',
    goals12: '',
    support: [],
    kpis: '',
    growthPast: '',
    growthWanted: '',
    team: '',
    duration: '',
    inHouseWhen: '',
    budget: '',
    pastAgency: '',
    process: '',
    questionsForMosaic: '',
    working: '',
    notWorking: '',
    consent: false,
  }
}

export function parseStoredBrief(raw: string | null): BriefAnswers | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<BriefAnswers>
    const base = emptyBriefAnswers()
    const support = Array.isArray(parsed.support)
      ? parsed.support.filter((item): item is SupportId =>
          SUPPORT_OPTIONS.some((option) => option.id === item),
        )
      : []

    return {
      ...base,
      ...parsed,
      support,
      role: ROLE_OPTIONS.find((option) => option.id === parsed.role)?.id ?? base.role,
      duration:
        DURATION_OPTIONS.find((option) => option.id === parsed.duration)?.id ?? '',
      budget: BUDGET_OPTIONS.find((option) => option.id === parsed.budget)?.id ?? '',
      process:
        PROCESS_OPTIONS.find((option) => option.id === parsed.process)?.id ?? '',
      consent: parsed.consent === true,
    }
  } catch {
    return null
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

export function buildBriefReport(answers: BriefAnswers): BriefReport {
  const firstName = answers.name.trim().split(/\s+/)[0] || 'there'
  const company = answers.company.trim()
  const companyLine = company || 'your business'
  const wantsExecution = answers.support.includes('execution')
  const wantsTeaching = answers.support.includes('teaching')
  const wantsStrategy = answers.support.includes('strategy')
  const goals =
    sentence(answers.goals6) ||
    sentence(answers.goals12) ||
    'You have not named a 6-month or 1-year target yet — that is the first thing to make concrete.'
  const working = sentence(answers.working)
  const notWorking = sentence(answers.notWorking)

  let headline = `A working picture of ${companyLine}.`
  if (wantsExecution && wantsStrategy && !wantsTeaching) {
    headline = 'You want the work done, and you want to know it is the right work.'
  } else if (wantsTeaching && !wantsExecution) {
    headline = 'You want a team that can run this without buying another forever retainer.'
  } else if (wantsStrategy && !wantsExecution && !wantsTeaching) {
    headline = 'You want peace of mind before you put more spend or more people on the plan.'
  } else if (wantsExecution && !wantsStrategy && !wantsTeaching) {
    headline = 'You need a partner in the work — not another slide deck.'
  }

  const overviewParts = [
    `${firstName}, here is what your answers bring into focus for ${companyLine}.`,
    goals,
  ]
  if (working) overviewParts.push(`What already works: ${working}`)
  if (notWorking) overviewParts.push(`Where it breaks down: ${notWorking}`)

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

  const measure = answers.kpis.trim()
    ? `You would track success with: ${sentence(answers.kpis)} We should pick one primary number for the first 30 days so the rest of the dashboard does not hide the leak.`
    : 'You have not named KPIs yet. Before we talk tactics, we should pick one number that means the partnership is working — usually booked jobs, revenue, or qualified conversations — not clicks.'

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
    {
      label: 'Support',
      value:
        answers.support.length > 0
          ? supportTitles(answers.support)
          : 'Not named yet',
    },
    {
      label: 'Horizon',
      value:
        DURATION_OPTIONS.find((option) => option.id === answers.duration)
          ?.label ?? 'Not named yet',
    },
    {
      label: 'Investment',
      value:
        BUDGET_OPTIONS.find((option) => option.id === answers.budget)?.label ??
        'Not named yet',
    },
    {
      label: 'Process',
      value:
        PROCESS_OPTIONS.find((option) => option.id === answers.process)
          ?.label ?? 'Not named yet',
    },
  ]

  return {
    firstName,
    companyLine,
    headline,
    overview: overviewParts.join(' '),
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

export function briefPayload(answers: BriefAnswers, report: BriefReport) {
  return {
    form_type: 'program_brief',
    _subject: `Program brief — ${answers.company || answers.name || 'hellomosaic.ai'}`,
    name: answers.name,
    email: answers.email,
    company: answers.company,
    role: ROLE_OPTIONS.find((option) => option.id === answers.role)?.label ?? '',
    goals_6_months: answers.goals6,
    goals_1_year: answers.goals12,
    support: supportTitles(answers.support),
    kpis: answers.kpis,
    growth_past_year: answers.growthPast,
    growth_wanted: answers.growthWanted,
    team: answers.team,
    duration:
      DURATION_OPTIONS.find((option) => option.id === answers.duration)?.label ??
      '',
    in_house_when: answers.inHouseWhen,
    budget:
      BUDGET_OPTIONS.find((option) => option.id === answers.budget)?.label ?? '',
    past_agency: answers.pastAgency,
    selection_process:
      PROCESS_OPTIONS.find((option) => option.id === answers.process)?.label ??
      '',
    questions_for_mosaic: answers.questionsForMosaic,
    what_is_working: answers.working,
    what_is_not_working: answers.notWorking,
    report_headline: report.headline,
    report_overview: report.overview,
    report_first_move: report.firstMove,
    report_fit: `${report.fitLabel}. ${report.fitNote}`,
    consent: answers.consent ? 'yes' : 'no',
  }
}
