import type { PacedAssignment } from './client'

export const BOARD_CHANNELS = ['PMAX', 'SEM', 'YouTube', 'Meta', 'TTD', 'Apple'] as const
export const MAP_LAYERS = ['PMAX CPA', 'SEM CPA', 'YouTube CPA', 'Meta CPA', 'Guest Δ %', 'Spend', 'Ownership', 'Off-plan'] as const
export type MapLayer = (typeof MAP_LAYERS)[number]
export const PMAX_RADIUS_MILES = 150

const CPA_STOPS = [
  { max: 26.01, label: '< $26.01', color: '#1f7a4d' },
  { max: 34.32, label: '$26.01 – $34.32', color: '#7dcea0' },
  { max: 38.45, label: '$34.32 – $38.45', color: '#d4a017' },
  { max: 50.19, label: '$38.45 – $50.19', color: '#e67e22' },
  { max: Number.POSITIVE_INFINITY, label: '≥ $50.19', color: '#c0392b' },
]

const WEST = -125
const EAST = -66
const NORTH = 49
const SOUTH = 24

export function paceReason(row: Pick<PacedAssignment, 'block' | 'pacingRatio' | 'abovePacePct'>) {
  if (row.block) return 'Spend without a matching budget.'
  if (row.pacingRatio == null || row.abovePacePct == null) return 'No expected pace.'
  const pct = Math.abs(row.abovePacePct).toFixed(1)
  if (row.pacingRatio > 1) return `Spend is ${pct}% above expected pace.`
  if (row.pacingRatio < 1) return `Spend is ${pct}% below expected pace.`
  return 'On expected pace.'
}

export function cpaBand(cpa: number | null) {
  if (cpa == null) return { label: 'no data', color: '#b7b1a8' }
  return CPA_STOPS.find((stop) => cpa < stop.max) ?? CPA_STOPS[CPA_STOPS.length - 1]
}

export function cpaStops() {
  return CPA_STOPS
}

export function project(lat: number, lng: number) {
  return {
    x: ((lng - WEST) / (EAST - WEST)) * 800,
    y: ((NORTH - lat) / (NORTH - SOUTH)) * 500,
  }
}

export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earth = 3958.8
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earth * Math.asin(Math.sqrt(h))
}

export function overlapPairs<T extends { lat: number; lng: number }>(stores: T[], radiusMiles: number) {
  const pairs: [T, T][] = []
  for (let i = 0; i < stores.length; i += 1) {
    for (let j = i + 1; j < stores.length; j += 1) {
      if (milesBetween(stores[i], stores[j]) < radiusMiles * 2) pairs.push([stores[i], stores[j]])
    }
  }
  return pairs
}

export function channelSummary(rows: PacedAssignment[]) {
  const actual = rows.reduce((sum, row) => sum + row.actual, 0)
  const budget = rows.reduce((sum, row) => sum + row.budget, 0)
  const expected = rows.reduce((sum, row) => sum + (row.expected ?? 0), 0)
  const conversions = rows.reduce((sum, row) => sum + row.conversions, 0)
  return {
    stores: new Set(rows.map((row) => row.storeId)).size,
    budget,
    actual,
    pace: expected === 0 ? null : actual / expected,
    cpa: conversions === 0 ? null : actual / conversions,
    attention: rows.filter((row) => row.verdict !== 'OK').length,
  }
}
