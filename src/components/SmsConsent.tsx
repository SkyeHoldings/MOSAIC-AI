import { Link } from 'react-router-dom'

/** TCPA / CTIA-style consent copy for MOSAIC SMS (SimpleTexting-compatible). */
export const SMS_CONSENT_TEXT =
  'By checking this box, you agree to receive recurring promotional and informational text messages from MOSAIC via an autodialer. Consent is not a condition of any purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out; HELP for help.'

type SmsConsentProps = {
  id: string
  name?: string
  required?: boolean
  checked: boolean
  onChange: (checked: boolean) => void
  /** Use light text styles when nested in the dark contact form. */
  tone?: 'light' | 'dark'
}

export function SmsConsent({
  id,
  name = 'sms_consent',
  required = false,
  checked,
  onChange,
  tone = 'light',
}: SmsConsentProps) {
  return (
    <label
      className={`sms-consent${tone === 'dark' ? ' sms-consent--dark' : ''}`}
      htmlFor={id}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        value="yes"
        checked={checked}
        required={required}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        {SMS_CONSENT_TEXT}{' '}
        View our <Link to="/privacy">Privacy Policy</Link> and{' '}
        <Link to="/terms">Terms &amp; Conditions</Link>.
      </span>
    </label>
  )
}
