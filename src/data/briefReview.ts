import { DIAGNOSTIC_RATING_COUNT } from './growthDiagnostic'
import { emptyBriefAnswers, type BriefAnswers } from './programBrief'

type PackedBrief = {
  v: 1
  ir: string
  tp: string
  rc: string
  r: string
}

function pack(answers: BriefAnswers): PackedBrief {
  const r = Array.from({ length: DIAGNOSTIC_RATING_COUNT }, (_, index) => {
    const value = answers.ratings[index]
    return value >= 1 && value <= 5 ? String(value) : '0'
  }).join('')

  return {
    v: 1,
    ir: answers.incrementalRevenue,
    tp: answers.topProducts,
    rc: answers.currentRoasCpa,
    r,
  }
}

function unpack(packed: PackedBrief): BriefAnswers {
  const answers = emptyBriefAnswers()
  answers.incrementalRevenue = packed.ir
  answers.topProducts = packed.tp
  answers.currentRoasCpa = packed.rc
  packed.r.split('').forEach((character, index) => {
    const value = Number(character)
    if (value >= 1 && value <= 5) answers.ratings[index] = value
  })
  return answers
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(token: string) {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/')
  const withPad = padded + '='.repeat((4 - (padded.length % 4)) % 4)
  const binary = atob(withPad)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export function encodeBriefReview(answers: BriefAnswers) {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(pack(answers))))
}

export function decodeBriefReview(token: string): BriefAnswers | null {
  try {
    const packed = JSON.parse(new TextDecoder().decode(fromBase64Url(token))) as PackedBrief
    if (packed.v !== 1 || typeof packed.r !== 'string') return null
    if (typeof packed.ir !== 'string' || typeof packed.tp !== 'string' || typeof packed.rc !== 'string') {
      return null
    }
    return unpack(packed)
  } catch {
    return null
  }
}

export function briefReviewUrl(
  answers: BriefAnswers,
  origin = typeof window !== 'undefined' ? window.location.origin : 'https://hellomosaic.ai',
) {
  return `${origin}/brief/review#${encodeBriefReview(answers)}`
}
