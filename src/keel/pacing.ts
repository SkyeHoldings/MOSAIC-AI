export function roundTo(value: number, places: number) {
  const factor = 10 ** places
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export type PaceInput = {
  budget: number
  actual: number
  dayOfPeriod: number
  daysInPeriod: number
  conversions?: number | null
}

export function paceRow(input: PaceInput) {
  const budget = Number(input.budget)
  const actual = Number(input.actual)
  const dayOfPeriod = Number(input.dayOfPeriod)
  const daysInPeriod = Number(input.daysInPeriod)
  const daysRemaining = daysInPeriod - dayOfPeriod
  const elapsedPct = daysInPeriod === 0 ? null : dayOfPeriod / daysInPeriod
  const expectedRaw = elapsedPct == null ? null : budget * elapsedPct
  const expected = expectedRaw == null ? null : roundTo(expectedRaw, 2)
  const variance = expected == null ? null : roundTo(actual - expected, 2)
  const pacingRatio =
    expected == null || expected === 0 ? null : roundTo(actual / expected, 4)
  const spendPct = budget === 0 ? null : roundTo(actual / budget, 4)
  const remaining = roundTo(budget - actual, 2)
  const requiredDaily =
    daysRemaining <= 0 ? null : roundTo(remaining / daysRemaining, 2)
  const runRateDaily = dayOfPeriod <= 0 ? null : roundTo(actual / dayOfPeriod, 2)
  const conversions = input.conversions == null ? null : Number(input.conversions)
  const cpa =
    conversions == null || conversions === 0 ? null : roundTo(actual / conversions, 2)
  const abovePacePct =
    pacingRatio == null ? null : roundTo((pacingRatio - 1) * 100, 1)

  return {
    elapsedPct,
    expected,
    variance,
    pacingRatio,
    spendPct,
    remaining,
    requiredDaily,
    runRateDaily,
    conversions,
    cpa,
    abovePacePct,
    block: actual > 0 && budget === 0,
  }
}

export function writeAllowed({
  mode,
  storeId,
  channel,
  allowlist = [],
}: {
  mode: string
  storeId: string
  channel: string
  allowlist?: { storeId: string; channel: string }[]
}) {
  if (mode === 'observe') return false
  if (mode === 'live') return true
  if (mode === 'pilot') {
    return allowlist.some(
      (entry) => entry.storeId === String(storeId) && entry.channel === channel,
    )
  }
  return false
}
