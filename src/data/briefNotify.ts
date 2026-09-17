const FORMSPREE_ID =
  (import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined) || 'xpqvjowe'

export const BRIEF_NOTIFY_EMAIL =
  (import.meta.env.VITE_BRIEF_NOTIFY_EMAIL as string | undefined)?.trim() ||
  'skye@hellomosaic.ai'

const BRIEF_NOTIFY_EMAILS = [
  BRIEF_NOTIFY_EMAIL,
  'skye@marketingbymosaic.com',
].filter((email, index, all) => all.indexOf(email) === index)

type StringPayload = Record<string, string>

function asStringPayload(payload: Record<string, unknown>): StringPayload {
  return Object.fromEntries(
    Object.entries(payload).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && entry[1].trim().length > 0,
    ),
  )
}

function isFormSubmitOk(result: unknown) {
  if (!result || typeof result !== 'object') return false
  const success = (result as { success?: unknown }).success
  if (success === true || success === 'true') return true
  const message = String((result as { message?: unknown }).message || '')
  // First submission only emails an activation link. That still counts as delivered.
  return /activat/i.test(message)
}

async function postJson(url: string, fields: StringPayload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: 'MOSAIC program brief',
      _captcha: 'false',
      _template: 'box',
      ...fields,
    }),
  })
  // FormSubmit returns JSON with a text/html content type.
  const text = await response.text()
  let result: unknown = null
  try {
    result = JSON.parse(text)
  } catch {
    result = null
  }
  if (!response.ok || !isFormSubmitOk(result)) {
    const message =
      result && typeof result === 'object' && 'message' in result
        ? String((result as { message: unknown }).message)
        : ''
    throw new Error(message || `Notify failed (${response.status})`)
  }
  return result
}

async function postFormSubmit(fields: StringPayload) {
  const attempts = await Promise.allSettled(
    BRIEF_NOTIFY_EMAILS.map((email) =>
      postJson(
        `https://formsubmit.co/ajax/${encodeURIComponent(email)}`,
        fields,
      ),
    ),
  )
  if (attempts.some((attempt) => attempt.status === 'fulfilled')) return
  const firstError = attempts.find(
    (attempt): attempt is PromiseRejectedResult => attempt.status === 'rejected',
  )
  throw firstError?.reason ?? new Error('FormSubmit did not accept the brief')
}

async function postFormspree(fields: StringPayload) {
  const body = new FormData()
  Object.entries(fields).forEach(([key, value]) => body.append(key, value))
  const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body,
  })
  const result = (await response.json().catch(() => null)) as {
    ok?: boolean
    error?: string
  } | null
  if (!response.ok || result?.error) {
    throw new Error(result?.error || 'Formspree did not accept the brief')
  }
  return result
}

export async function sendBriefNotification(payload: Record<string, unknown>) {
  const fields = asStringPayload(payload)
  await postFormSubmit(fields)
  void postFormspree(fields).catch(() => undefined)
}
