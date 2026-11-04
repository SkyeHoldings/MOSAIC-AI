import { SAMPLE_ROWS } from './catalog'
import {
  addExclusion,
  analysisRange,
  applyBudgets,
  audienceEdit,
  changeMode,
  createCohort,
  deleteCohort,
  deployAssetGroup,
  extractAssetGroup,
  preflightAssetGroup,
  saveBlueprint,
  updatePilot,
  type Blueprint,
  type Cohort,
  type Exclusion,
  type Mode,
  type Result,
} from './client'
import { writeAllowed } from './pacing'

const KEY = 'hellomosaic-keel-api'
const LEGACY_COHORTS = 'hellomosaic-keel-cohorts'

export type AuditEntry = {
  id: string
  at: string
  action: string
  result: 'ok' | 'refused'
  actor: string
  detail: string
}

export type Member = { email: string; role: 'admin' | 'trader' }

export type Check = { name: string; ok: boolean; detail: string }

export type Review = { seed: string; token: string; assetGroup: string; storeId: string }

export type KeelDb = {
  mode: Mode
  pilot: string[]
  cohorts: Cohort[]
  exclusions: Exclusion[]
  blueprints: Blueprint[]
  audiences: { name: string; storeIds: string[] }[]
  review: Review | null
  audit: AuditEntry[]
  members: Member[]
  actor: string
}

function empty(): KeelDb {
  return {
    mode: 'OBSERVE',
    pilot: ['1'],
    cohorts: [],
    exclusions: [],
    blueprints: [],
    audiences: [],
    review: null,
    audit: [],
    members: [{ email: 'skye@surfaceagency.co', role: 'admin' }],
    actor: 'skye@surfaceagency.co',
  }
}

function legacyCohorts(): Cohort[] {
  try {
    const raw = localStorage.getItem(LEGACY_COHORTS)
    return raw ? JSON.parse(raw) as Cohort[] : []
  } catch {
    return []
  }
}

export function loadDb(): KeelDb {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const db = { ...empty(), cohorts: legacyCohorts() }
      localStorage.setItem(KEY, JSON.stringify(db))
      return db
    }
    return { ...empty(), ...JSON.parse(raw) as KeelDb }
  } catch {
    return empty()
  }
}

function save(db: KeelDb) {
  localStorage.setItem(KEY, JSON.stringify(db))
  return db
}

function note(db: KeelDb, action: string, ok: boolean, detail: string) {
  db.audit.unshift({
    id: `audit-${Date.now()}`,
    at: new Date().toISOString(),
    action,
    result: ok ? 'ok' : 'refused',
    actor: db.actor,
    detail,
  })
}

function gate(db: KeelDb, storeIds: string[], channel: string): string | null {
  for (const storeId of storeIds) {
    const allowed = writeAllowed({
      mode: db.mode.toLowerCase(),
      storeId,
      channel,
      allowlist: db.pilot.map((id) => ({ storeId: id, channel })),
    })
    if (!allowed) {
      return db.mode === 'OBSERVE'
        ? 'Observe writes nothing.'
        : `Store ${storeId} is not on the Pilot allowlist.`
    }
  }
  return null
}

function storesFor(ids: string[]) {
  return [...new Set(SAMPLE_ROWS.filter((row) => ids.includes(row.id)).map((row) => row.storeId))]
}

export function apiChangeMode(input: { mode: Mode; confirm?: boolean }): Result<{ mode: Mode; db: KeelDb }> {
  const result = changeMode(input)
  const db = loadDb()
  if (!result.ok) {
    note(db, 'config.mode', false, result.error)
    save(db)
    return result
  }
  db.mode = result.mode
  note(db, 'config.mode', true, `Mode is ${result.mode}.`)
  return { ok: true, mode: result.mode, db: save(db) }
}

export function apiUpdatePilot(input: { entries: string[]; channel?: string; enabled?: boolean; confirm?: boolean }): Result<{ entries: string[]; db: KeelDb }> {
  const result = updatePilot(input)
  const db = loadDb()
  if (!result.ok) {
    note(db, 'config.pilot', false, result.error)
    save(db)
    return result
  }
  db.pilot = result.entries
  note(db, 'config.pilot', true, `Allowlist has ${result.entries.length} stores.`)
  return { ok: true, entries: result.entries, db: save(db) }
}

export function apiCreateCohort(input: { name: string; storeIds: string[]; source: Cohort['source'] }): Result<{ cohort: Cohort; db: KeelDb }> {
  const result = createCohort(input)
  const db = loadDb()
  if (!result.ok) return result
  db.cohorts = [...db.cohorts, result.cohort]
  note(db, 'labels.create', true, `Saved ${result.cohort.name}.`)
  return { ok: true, cohort: result.cohort, db: save(db) }
}

export function apiDeleteCohort(id: string): Result<{ db: KeelDb }> {
  const db = loadDb()
  const result = deleteCohort(db.cohorts, id)
  if (!result.ok) return result
  db.cohorts = result.cohorts
  note(db, 'labels.delete', true, `Deleted cohort ${id}.`)
  return { ok: true, db: save(db) }
}

export function apiAudience(input: { method: 'POST' | 'DELETE'; audience: string; storeIds: string[] }): Result<{ audience: string; db: KeelDb }> {
  const result = audienceEdit(input)
  const db = loadDb()
  if (!result.ok) return result
  const blocked = gate(db, input.storeIds, 'Meta')
  if (blocked) {
    note(db, 'audience.edit', false, blocked)
    save(db)
    return { ok: false, error: blocked }
  }
  db.audiences = db.audiences.filter((item) => item.name !== result.audience)
  if (input.method === 'POST') db.audiences.push({ name: result.audience, storeIds: result.storeIds })
  note(db, 'audience.edit', true, `${input.method} ${result.audience}.`)
  return { ok: true, audience: result.audience, db: save(db) }
}

export function apiSaveBlueprint(input: Blueprint): Result<{ blueprint: Blueprint; db: KeelDb }> {
  const result = saveBlueprint(input)
  const db = loadDb()
  if (!result.ok) return result
  db.blueprints = [result.blueprint, ...db.blueprints.filter((item) => item.name !== result.blueprint.name)]
  note(db, 'creative.blueprint', true, `Saved ${result.blueprint.name}.`)
  return { ok: true, blueprint: result.blueprint, db: save(db) }
}

export function apiRefresh(): Result<{ runId: string; db: KeelDb }> {
  const db = loadDb()
  const runId = `run-${Date.now()}`
  note(db, 'actuation.refresh', true, `Proposals refreshed. runId ${runId}. ${SAMPLE_ROWS.length} rows.`)
  return { ok: true, runId, db: save(db) }
}

export function apiApply(input: {
  channel: string
  proposalIds: string[]
  dryRun?: boolean
  confirm?: boolean
  reviewedFingerprint?: string
  currentFingerprint: string
}): Result<{ log: string; db: KeelDb }> {
  const checked = applyBudgets(input)
  const db = loadDb()
  if (!checked.ok) {
    note(db, 'actuation.apply', false, checked.error)
    save(db)
    return checked
  }
  if (!input.dryRun) {
    const blocked = gate(db, storesFor(input.proposalIds), input.channel)
    if (blocked) {
      note(db, 'actuation.apply', false, blocked)
      save(db)
      return { ok: false, error: blocked }
    }
    const excluded = db.exclusions.find((item) => storesFor(input.proposalIds).includes(item.storeId) && item.channel === input.channel)
    if (excluded) {
      const error = `Store ${excluded.storeId} is excluded: ${excluded.reason}`
      note(db, 'actuation.apply', false, error)
      save(db)
      return { ok: false, error }
    }
  }
  const log = input.dryRun
    ? `Dry run recorded for ${input.proposalIds.length} proposals.`
    : `Apply recorded for ${input.proposalIds.length} proposals on ${input.channel}.`
  note(db, 'actuation.apply', true, log)
  return { ok: true, log, db: save(db) }
}

export function apiExclude(input: Exclusion): Result<{ exclusion: Exclusion; db: KeelDb }> {
  const result = addExclusion(input)
  const db = loadDb()
  if (!result.ok) return result
  db.exclusions = [...db.exclusions, result.exclusion]
  note(db, 'actuation.exclusion', true, `${result.exclusion.storeId} ${result.exclusion.channel}: ${result.exclusion.reason}`)
  return { ok: true, exclusion: result.exclusion, db: save(db) }
}

export function apiExtract(input: { storeId?: string; assetGroup: string }): Result<{ seed: string; db: KeelDb }> {
  const result = extractAssetGroup(input)
  const db = loadDb()
  if (!result.ok) return result
  const rows = SAMPLE_ROWS.filter((row) => row.storeId === input.storeId)
  if (input.storeId && rows.length === 0) return { ok: false, error: `Store ${input.storeId} is not in the snapshot.` }
  const seed = JSON.stringify({
    assetGroup: input.assetGroup.trim(),
    storeId: input.storeId ?? '',
    channels: rows.map((row) => ({ channel: row.channel, budget: row.budget })),
  })
  db.review = null
  note(db, 'assetgroup.extract', true, seed)
  return { ok: true, seed, db: save(db) }
}

export function apiPreflight(seed: string | null): Result<{ reviewToken: string; db: KeelDb }> {
  const result = preflightAssetGroup(seed)
  const db = loadDb()
  if (!result.ok || !seed) return result.ok ? { ok: false, error: 'Extract a seed before preflight.' } : result
  let parsed: { assetGroup?: string; storeId?: string }
  try {
    parsed = JSON.parse(seed) as { assetGroup?: string; storeId?: string }
  } catch {
    return { ok: false, error: 'Seed is not a frozen extract.' }
  }
  const token = `review-${seed.length}-${Date.now()}`
  db.review = { seed, token, assetGroup: parsed.assetGroup ?? '', storeId: parsed.storeId ?? '' }
  note(db, 'assetgroup.preflight', true, `Froze ${db.review.assetGroup} as ${token}.`)
  return { ok: true, reviewToken: token, db: save(db) }
}

export function apiDeploy(input: { seed: string | null; reviewToken: string | null; confirm?: boolean }): Result<{ log: string; db: KeelDb }> {
  const result = deployAssetGroup(input)
  const db = loadDb()
  if (!result.ok) {
    note(db, 'assetgroup.deploy', false, result.error)
    save(db)
    return result
  }
  if (!db.review || db.review.seed !== input.seed || db.review.token !== input.reviewToken) {
    const error = 'the diff changed since you reviewed it — re-review the current selection before applying'
    note(db, 'assetgroup.deploy', false, error)
    save(db)
    return { ok: false, error }
  }
  const blocked = gate(db, [db.review.storeId], 'PMAX')
  if (blocked) {
    note(db, 'assetgroup.deploy', false, blocked)
    save(db)
    return { ok: false, error: blocked }
  }
  const log = `Deploy recorded for ${db.review.assetGroup} on store ${db.review.storeId}.`
  note(db, 'assetgroup.deploy', true, log)
  return { ok: true, log, db: save(db) }
}

export function apiAnalysis(input: { start: string; end: string }): Result<{ start: string; end: string; rows: typeof SAMPLE_ROWS; db: KeelDb }> {
  const result = analysisRange(input)
  const db = loadDb()
  if (!result.ok) return result
  note(db, 'analysis.range', true, `${result.start} to ${result.end}.`)
  return { ok: true, start: result.start, end: result.end, rows: SAMPLE_ROWS, db: save(db) }
}

export function apiHealth(): Result<{ runId: string; checks: Check[]; db: KeelDb }> {
  const db = loadDb()
  const runId = `health-${Date.now()}`
  const fields = ['storeId', 'channel', 'budget', 'actual', 'conversions']
  const missing = fields.filter((field) => SAMPLE_ROWS.some((row) => !(field in row)))
  const checks: Check[] = [
    { name: 'Snapshot', ok: SAMPLE_ROWS.length > 0, detail: `${SAMPLE_ROWS.length} sample rows in this copy.` },
    { name: 'Schema', ok: missing.length === 0, detail: missing.length ? `Missing ${missing.join(', ')}.` : 'store, channel, budget, actual, and conversions are present.' },
    { name: 'BigQuery', ok: false, detail: 'This copy has no warehouse login. The snapshot is the bundled sample.' },
    { name: 'Mode', ok: true, detail: `Mode is ${db.mode}. Pilot allowlist has ${db.pilot.length} stores.` },
  ]
  note(db, 'health.full', true, `${runId}: ${checks.filter((item) => item.ok).length}/${checks.length} checks passed.`)
  return { ok: true, runId, checks, db: save(db) }
}

export function apiAddMember(input: { email: string; role: Member['role'] }): Result<{ db: KeelDb }> {
  const db = loadDb()
  const actor = db.members.find((member) => member.email === db.actor)
  if (!actor || actor.role !== 'admin') {
    const error = 'Membership changes need settings-manage.'
    note(db, 'team.memberships', false, error)
    save(db)
    return { ok: false, error }
  }
  const email = input.email.trim()
  if (!email.includes('@')) return { ok: false, error: 'Email is required.' }
  db.members = [...db.members.filter((member) => member.email !== email), { email, role: input.role }]
  note(db, 'team.memberships', true, `${email} is ${input.role}.`)
  return { ok: true, db: save(db) }
}

export function auditJsonl(entries: AuditEntry[]) {
  return entries.map((entry) => JSON.stringify(entry)).join('\n')
}
