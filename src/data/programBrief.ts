import {
  DIAGNOSTIC_STORAGE_KEY,
  GOAL_OPTIONS,
  OWNER_OPTIONS,
  QUESTIONS,
  SERVICES,
  SOURCE_OPTIONS,
  answeredRatingCount,
  buildDiagnosticReport,
  emptyDiagnosticAnswers,
  parseStoredDiagnostic,
  resolvedRevenue,
  resolvedSpend,
  type DiagnosticAnswers,
  type DiagnosticReport,
} from './growthDiagnostic'

export const BRIEF_STORAGE_KEY = DIAGNOSTIC_STORAGE_KEY

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

export type BriefAnswers = DiagnosticAnswers
export type BriefReport = DiagnosticReport

export function emptyBriefAnswers() {
  return emptyDiagnosticAnswers()
}

export function parseStoredBrief(raw: string | null) {
  return parseStoredDiagnostic(raw)
}

export function buildBriefReport(answers: DiagnosticAnswers) {
  return buildDiagnosticReport(answers)
}

export function briefPayload(answers: DiagnosticAnswers, report: DiagnosticReport) {
  return {
    form_type: 'growth_diagnostic',
    _subject: `Growth diagnostic — ${answers.company || answers.name || 'hellomosaic.ai'}`,
    name: answers.name,
    email: answers.email,
    company: answers.company,
    annual_revenue: answers.revenuePreferNot
      ? 'Prefer not to say'
      : resolvedRevenue(answers)?.toString() ?? '',
    monthly_ad_spend: answers.spendPreferNot
      ? 'Prefer not to say'
      : resolvedSpend(answers)?.toString() ?? '',
    customer_source:
      SOURCE_OPTIONS.find((option) => option.id === answers.source)?.label ?? '',
    marketing_owner:
      OWNER_OPTIONS.find((option) => option.id === answers.owner)?.label ?? '',
    goal_12mo: GOAL_OPTIONS.find((option) => option.id === answers.goal)?.label ?? '',
    ratings_answered: `${answeredRatingCount(answers)} / ${QUESTIONS.length}`,
    service_scores: report.ranked
      .map((item) => `${item.name} ${item.score.toFixed(1)}/5 (${item.band})`)
      .join('\n'),
    cluster: report.cluster.name,
    headline: report.headline,
    overview: report.overview,
    start_here: report.priority
      .map((item) => `${item.name} ${item.score.toFixed(1)}/5 — ${item.bandLabel}`)
      .join('\n'),
    protect_this: report.strengthLine,
    mosaic_help_prefix: report.helpPrefix,
    close: report.close,
    quiz_answers: QUESTIONS.map((question) => {
      const rating = answers.ratings[question.index]
      const service = SERVICES.find((item) => item.id === question.serviceId)?.name
      return `${question.index + 1}. [${rating ?? '—'}] ${service}: ${question.text}`
    }).join('\n'),
    consent: answers.consent ? 'yes' : 'no',
  }
}
