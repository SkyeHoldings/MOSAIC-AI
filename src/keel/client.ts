import { paceRow, type PaceInput } from './pacing'

export type Ok<T> = { ok: true } & T
export type Err = { ok: false; error: string }
export type Result<T> = Ok<T> | Err

export type Mode = 'OBSERVE' | 'PILOT' | 'LIVE'

export type Assignment = {
  id: string
  storeId: string
  storeName: string
  channel: string
  locationType: string
  clusterName: string
  budget: number
  actual: number
  conversions: number
}

export type PacedAssignment = Assignment & ReturnType<typeof paceRow> & {
  status: string
  verdict: string
}

export type Cohort = {
  id: string
  name: string
  storeIds: string[]
  source: 'PASTE' | 'ANALYSIS'
}

export type Exclusion = {
  storeId: string
  channel: string
  reason: string
}

export type Blueprint = {
  name: string
  assets: string
  bodies: string
  titles: string
  cta: string
  linkUrl: string
  urlTags: string
  startDate: string
}

export const DEFAULT_URL_TAGS = 'utm_content={{ad.name}}&utm_term={{adset.name}}'
export const PILOT_ENTRY_CAP = 1000

export function withPace(row: Assignment, period: Pick<PaceInput, 'dayOfPeriod' | 'daysInPeriod'>): PacedAssignment {
  const paced = paceRow({ ...row, ...period })
  let status = 'OK'
  let verdict = 'OK'
  if (paced.block) {
    status = 'NOT_FUNDED'
    verdict = 'BLOCK'
  } else if (row.actual === 0) {
    status = 'NO_SPEND'
  } else if (paced.spendPct != null && paced.spendPct >= 1) {
    status = 'BUDGET_SPENT'
  } else if (paced.pacingRatio != null && paced.pacingRatio > 1) {
    status = 'OVERPACING'
    verdict = 'WARN'
  } else if (paced.pacingRatio != null && paced.pacingRatio < 1) {
    status = 'UNDERPACING'
    verdict = 'WARN'
  }
  return { ...row, ...paced, conversions: row.conversions, status, verdict }
}

export type SortKey = 'store' | 'channel' | 'budget' | 'spent' | 'pace' | 'cpa' | 'conv' | 'rec'
export type FilterName =
  | 'All'
  | 'BLOCK only'
  | 'Over-pacing'
  | 'Under-pacing'
  | 'Off-plan'
  | 'No spend'
  | 'Unfunded'
  | 'Completed'
  | 'Franchise'

export function sortRows(rows: PacedAssignment[], key: SortKey, dir: 'asc' | 'desc') {
  const sign = dir === 'asc' ? 1 : -1
  const value = (row: PacedAssignment) => {
    switch (key) {
      case 'store':
        return Number(row.storeId)
      case 'channel':
        return row.channel
      case 'budget':
        return row.budget
      case 'spent':
        return row.actual
      case 'pace':
        return row.pacingRatio ?? -1
      case 'cpa':
        return row.cpa ?? -1
      case 'conv':
        return row.conversions
      case 'rec':
        return row.requiredDaily ?? -1
    }
  }
  return [...rows].sort((a, b) => {
    const left = value(a)
    const right = value(b)
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sign
    return String(left).localeCompare(String(right)) * sign
  })
}

export function filterRows(rows: PacedAssignment[], filter: FilterName) {
  return rows.filter((row) => {
    switch (filter) {
      case 'BLOCK only':
        return row.verdict === 'BLOCK'
      case 'Over-pacing':
        return row.status === 'OVERPACING'
      case 'Under-pacing':
        return row.status === 'UNDERPACING'
      case 'Off-plan':
        return row.verdict !== 'OK'
      case 'No spend':
        return row.status === 'NO_SPEND'
      case 'Unfunded':
        return row.status === 'NOT_FUNDED'
      case 'Completed':
        return row.status === 'BUDGET_SPENT'
      case 'Franchise':
        return row.locationType === 'Franchise'
      default:
        return true
    }
  })
}

export function matchStorePaste(text: string, directory: { storeId: string; storeName: string }[]) {
  const tokens = text.split(/[\s,]+/).map((token) => token.trim()).filter(Boolean)
  const seen = new Set<string>()
  const matched: { storeId: string; storeName: string }[] = []
  const unmatched: string[] = []
  const duplicates: string[] = []
  for (const token of tokens) {
    const store = directory.find((item) => item.storeId === token || item.storeName.toLowerCase() === token.toLowerCase())
    if (!store) {
      unmatched.push(token)
      continue
    }
    if (seen.has(store.storeId)) {
      duplicates.push(store.storeId)
      continue
    }
    seen.add(store.storeId)
    matched.push(store)
  }
  return { matched, unmatched, duplicates, totalTokens: tokens.length }
}

export function changeMode(input: { mode: Mode; confirm?: boolean }): Result<{ mode: Mode }> {
  if (input.mode !== 'OBSERVE' && !input.confirm) {
    return { ok: false, error: 'Pilot and Live need confirm.' }
  }
  return { ok: true, mode: input.mode }
}

export function updatePilot(input: {
  entries: string[]
  channel?: string
  enabled?: boolean
  confirm?: boolean
}): Result<{ entries: string[]; autoChannel?: { channel: string; enabled: boolean } }> {
  const entries = [...new Set(input.entries.map((entry) => entry.trim()).filter(Boolean))]
  if (entries.length > PILOT_ENTRY_CAP) {
    return { ok: false, error: `Max ${PILOT_ENTRY_CAP} entries per request — this paste has ${entries.length}, including duplicates.` }
  }
  if (input.channel != null && !input.confirm) {
    return { ok: false, error: 'Auto-apply needs confirm.' }
  }
  return {
    ok: true,
    entries,
    autoChannel: input.channel == null ? undefined : { channel: input.channel, enabled: Boolean(input.enabled) },
  }
}

export function createCohort(input: { name: string; storeIds: string[]; source: Cohort['source'] }): Result<{ cohort: Cohort }> {
  const name = input.name.trim()
  if (!name) return { ok: false, error: 'Name is required.' }
  if (input.storeIds.length === 0) return { ok: false, error: 'No matched store ids.' }
  return {
    ok: true,
    cohort: { id: `cohort-${Date.now()}`, name, storeIds: input.storeIds, source: input.source },
  }
}

export function deleteCohort(cohorts: Cohort[], id: string): Result<{ cohorts: Cohort[] }> {
  if (!cohorts.some((cohort) => cohort.id === id)) return { ok: false, error: 'Cohort not found.' }
  return { ok: true, cohorts: cohorts.filter((cohort) => cohort.id !== id) }
}

export function audienceEdit(input: { method: 'POST' | 'DELETE'; audience: string; storeIds: string[] }): Result<{ audience: string; storeIds: string[] }> {
  if (!input.audience.trim()) return { ok: false, error: 'Audience name is required.' }
  return { ok: true, audience: input.audience.trim(), storeIds: input.method === 'DELETE' ? [] : input.storeIds }
}

export function saveBlueprint(input: Blueprint): Result<{ blueprint: Blueprint }> {
  return {
    ok: true,
    blueprint: { ...input, name: input.name.trim() || 'Untitled creative', urlTags: input.urlTags || DEFAULT_URL_TAGS },
  }
}

export function fingerprint(channel: string, proposalIds: string[]) {
  return `${channel}:${[...proposalIds].sort().join(',')}`
}

export function applyBudgets(input: {
  channel: string
  proposalIds: string[]
  dryRun?: boolean
  confirm?: boolean
  reviewedFingerprint?: string
  currentFingerprint: string
}): Result<{ dryRun: boolean; applied: number; log: string }> {
  if (input.reviewedFingerprint && input.reviewedFingerprint !== input.currentFingerprint) {
    return { ok: false, error: 'the diff changed since you reviewed it — re-review the current selection before applying' }
  }
  if (input.proposalIds.length === 0) return { ok: false, error: 'Select at least one proposal.' }
  if (!input.dryRun && !input.confirm) return { ok: false, error: 'A real apply needs confirm.' }
  return {
    ok: true,
    dryRun: Boolean(input.dryRun),
    applied: input.proposalIds.length,
    log: input.dryRun ? 'Dry run only. Nothing was written.' : 'Apply recorded locally. No ad platform was called.',
  }
}

export function refreshProposals(): Result<{ runId: string }> {
  return { ok: true, runId: `run-${Date.now()}` }
}

export function addExclusion(input: Exclusion): Result<{ exclusion: Exclusion }> {
  if (!input.storeId.trim() || !input.reason.trim()) return { ok: false, error: 'Store and reason are required.' }
  return { ok: true, exclusion: { ...input, storeId: input.storeId.trim(), reason: input.reason.trim() } }
}

export function healthCheck(): Result<{ runId: string }> {
  return { ok: true, runId: `health-${Date.now()}` }
}

export function analysisRange(input: { start: string; end: string }): Result<{ start: string; end: string }> {
  if (!input.start || !input.end) return { ok: false, error: 'Start and end are required.' }
  if (input.start > input.end) return { ok: false, error: 'Start is after end.' }
  return { ok: true, start: input.start, end: input.end }
}

export function extractAssetGroup(input: { storeId?: string; customerId?: string; campaignName?: string; assetGroup: string }): Result<{ seed: string }> {
  if (!input.assetGroup.trim()) return { ok: false, error: 'Asset group is required.' }
  if (input.storeId?.trim()) return { ok: true, seed: `${input.storeId.trim()} / ${input.assetGroup.trim()}` }
  if (input.customerId?.trim() && input.campaignName?.trim()) {
    return { ok: true, seed: `${input.customerId.trim()} / ${input.campaignName.trim()} / ${input.assetGroup.trim()}` }
  }
  return { ok: false, error: 'Give a store id, or a customer id and campaign name.' }
}

export function preflightAssetGroup(seed: string | null): Result<{ reviewToken: string }> {
  if (!seed) return { ok: false, error: 'Extract a seed before preflight.' }
  return { ok: true, reviewToken: `review-${seed.length}-${Date.now()}` }
}

export function deployAssetGroup(input: { seed: string | null; reviewToken: string | null; confirm?: boolean }): Result<{ log: string }> {
  if (!input.seed || !input.reviewToken) return { ok: false, error: 'Preflight has to finish before deploy.' }
  if (!input.confirm) return { ok: false, error: 'Deploy needs confirm.' }
  return { ok: true, log: 'Deploy recorded locally. No asset group was sent to a platform.' }
}
