const NOTIFY_EMAILS = ['skye@hellomosaic.ai', 'skye@marketingbymosaic.com']

function isFormSubmitOk(result) {
  if (!result || typeof result !== 'object') return false
  if (result.success === true || result.success === 'true') return true
  return /activat/i.test(String(result.message || ''))
}

async function sendTo(email, payload) {
  const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: 'MOSAIC program brief',
      _captcha: 'false',
      _template: 'box',
      ...payload,
    }),
  })
  const text = await response.text()
  let result
  try {
    result = JSON.parse(text)
  } catch {
    result = { success: false, message: text }
  }
  return { email, ok: response.ok && isFormSubmitOk(result), result }
}

export async function onRequestPost(context) {
  let payload
  try {
    payload = await context.request.json()
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'invalid json' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const results = await Promise.all(NOTIFY_EMAILS.map((email) => sendTo(email, payload)))
  const ok = results.some((item) => item.ok)
  return new Response(
    JSON.stringify({
      success: ok,
      message: ok
        ? 'Brief emailed'
        : results.map((item) => item.result?.message).filter(Boolean).join(' '),
    }),
    {
      status: ok ? 200 : 502,
      headers: { 'content-type': 'application/json' },
    },
  )
}
