import { useEffect, useId, useState, type ReactNode } from 'react'

type Inputs = {
  revenue: number
  deal: number
  dialToConnect: number
  connectToMeeting: number
  showRate: number
  showToOpp: number
  oppToClose: number
  dialsPerRep: number
}

type Preset = Inputs & {
  id: string
  name: string
  acv: string
}

const BENCHMARK: Omit<Inputs, 'deal'> = {
  revenue: 1_000_000,
  dialToConnect: 5,
  connectToMeeting: 7,
  showRate: 70,
  showToOpp: 90,
  oppToClose: 20,
  dialsPerRep: 4_000,
}

const PRESETS: Preset[] = [
  { id: 'saas', name: 'SaaS', acv: '$25k', deal: 25_000, ...BENCHMARK },
  { id: 'enterprise', name: 'Enterprise', acv: '$150k', deal: 150_000, ...BENCHMARK },
  { id: 'smb', name: 'SMB', acv: '$5k', deal: 5_000, ...BENCHMARK },
  { id: 'agency', name: 'Agency', acv: '$36k', deal: 36_000, ...BENCHMARK },
]

type Funnel = {
  closed: number
  opps: number
  held: number
  booked: number
  conversations: number
  dials: number
  perMonth: number
  reps: number
}

function stepUp(value: number, rate: number) {
  if (rate <= 0) return Number.POSITIVE_INFINITY
  return value / (rate / 100)
}

function compute(input: Inputs): Funnel | null {
  if (input.revenue <= 0 || input.deal <= 0) return null
  const closed = input.revenue / input.deal
  const opps = stepUp(closed, input.oppToClose)
  const held = stepUp(opps, input.showToOpp)
  const booked = stepUp(held, input.showRate)
  const conversations = stepUp(booked, input.connectToMeeting)
  const dials = stepUp(conversations, input.dialToConnect)
  return {
    closed,
    opps,
    held,
    booked,
    conversations,
    dials,
    perMonth: dials / 12,
    reps: input.dialsPerRep > 0 ? dials / (input.dialsPerRep * 12) : Number.POSITIVE_INFINITY,
  }
}

function formatCount(value: number) {
  if (!Number.isFinite(value)) return '—'
  return Math.round(value).toLocaleString('en-US')
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return '—'
  return `$${Math.round(value).toLocaleString('en-US')}`
}

function formatDeals(value: number) {
  if (!Number.isFinite(value)) return '—'
  const rounded = Math.round(value * 10) / 10
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

function formatInput(value: number) {
  if (!Number.isFinite(value)) return ''
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function parseInput(raw: string) {
  const cleaned = raw.replace(/[$,%\s,]/g, '')
  if (cleaned === '' || cleaned === '.') return 0
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : 0
}

function formatReps(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '—'
  return String(Math.max(1, Math.ceil(value - 1e-6)))
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  max,
}: {
  label: string
  value: number
  onChange: (next: number) => void
  prefix?: string
  suffix?: string
  max?: number
}) {
  const id = useId()
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState('')

  return (
    <div className="math-field">
      <label htmlFor={id}>{label}</label>
      <div className="math-field__box">
        {prefix ? <span className="math-field__affix">{prefix}</span> : null}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={focused ? draft : formatInput(value)}
          onFocus={() => {
            setFocused(true)
            setDraft(String(value))
          }}
          onBlur={() => setFocused(false)}
          onChange={(event) => {
            const raw = event.target.value.replace(/[^0-9.]/g, '')
            const singleDot = raw.replace(/(\..*)\./g, '$1')
            setDraft(singleDot)
            let next = parseInput(singleDot)
            if (max != null) next = Math.min(next, max)
            onChange(next)
          }}
        />
        {suffix ? <span className="math-field__affix">{suffix}</span> : null}
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="math-group">
      <legend>{title}</legend>
      {children}
    </fieldset>
  )
}

export function MathOfSales() {
  const [presetId, setPresetId] = useState<string>('saas')
  const [input, setInput] = useState<Inputs>(PRESETS[0])
  const funnel = compute(input)
  const ready = funnel != null && Number.isFinite(funnel.dials)
  const steps = ready
    ? [
        { label: 'Dials', value: funnel.dials },
        { label: 'Conversations', value: funnel.conversations },
        { label: 'Meetings booked', value: funnel.booked },
        { label: 'Meetings held', value: funnel.held },
        { label: 'Qualified opportunities', value: funnel.opps },
        { label: 'Closed deals', value: funnel.closed, emphasis: true },
      ]
    : []
  const maxStep = Math.max(...steps.map((step) => step.value), 1)

  useEffect(() => {
    const previous = document.title
    document.title = 'Math of Sales · MOSAIC'
    return () => {
      document.title = previous
    }
  }, [])

  function patch(partial: Partial<Inputs>) {
    setPresetId('custom')
    setInput((current) => ({ ...current, ...partial }))
  }

  function applyPreset(preset: Preset) {
    setPresetId(preset.id)
    setInput({
      revenue: preset.revenue,
      deal: preset.deal,
      dialToConnect: preset.dialToConnect,
      connectToMeeting: preset.connectToMeeting,
      showRate: preset.showRate,
      showToOpp: preset.showToOpp,
      oppToClose: preset.oppToClose,
      dialsPerRep: preset.dialsPerRep,
    })
  }

  return (
    <article className="math-page">
      <header className="math-intro">
        <p className="math-kicker">Math of sales</p>
        <h1>
          Plug in the number.
          <span>See the work behind it.</span>
        </h1>
        <p>
          Set a revenue target and the rates you actually see. This works
          backward through the funnel to the dials, meetings, and reps it takes
          to get there.
        </p>
      </header>

      <div className="math-presets" role="group" aria-label="Example deal sizes">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={presetId === preset.id ? 'is-active' : undefined}
            aria-pressed={presetId === preset.id}
            onClick={() => applyPreset(preset)}
          >
            <strong>{preset.name}</strong>
            <span>{preset.acv} deal</span>
          </button>
        ))}
      </div>

      <div className="math-layout">
        <form className="math-form" onSubmit={(event) => event.preventDefault()}>
          <Group title="Your goal">
            <NumberField
              label="Annual revenue target"
              prefix="$"
              value={input.revenue}
              onChange={(revenue) => patch({ revenue })}
            />
            <NumberField
              label="Average deal value"
              prefix="$"
              value={input.deal}
              onChange={(deal) => patch({ deal })}
            />
          </Group>

          <Group title="Conversion rates">
            <NumberField
              label="Dial to connect"
              suffix="%"
              max={100}
              value={input.dialToConnect}
              onChange={(dialToConnect) => patch({ dialToConnect })}
            />
            <NumberField
              label="Connect to meeting booked"
              suffix="%"
              max={100}
              value={input.connectToMeeting}
              onChange={(connectToMeeting) => patch({ connectToMeeting })}
            />
            <NumberField
              label="Meeting show rate"
              suffix="%"
              max={100}
              value={input.showRate}
              onChange={(showRate) => patch({ showRate })}
            />
            <NumberField
              label="Show to qualified opportunity"
              suffix="%"
              max={100}
              value={input.showToOpp}
              onChange={(showToOpp) => patch({ showToOpp })}
            />
            <NumberField
              label="Opportunity to closed won"
              suffix="%"
              max={100}
              value={input.oppToClose}
              onChange={(oppToClose) => patch({ oppToClose })}
            />
          </Group>

          <Group title="Team capacity">
            <NumberField
              label="Dials per rep per month"
              value={input.dialsPerRep}
              onChange={(dialsPerRep) => patch({ dialsPerRep })}
            />
          </Group>

          <p className="math-note">
            Example mixes start from a $1M year and the same outbound rates.
            Change any field. Reps are rounded up to a whole person.
          </p>
        </form>

        <section className="math-results" aria-live="polite">
          {ready && funnel ? (
            <>
              <p className="math-results__kicker">Total dials required</p>
              <p className="math-results__dial">{formatCount(funnel.dials)}</p>
              <p className="math-results__sub">
                to hit {formatMoney(input.revenue)}
                <span>{formatCount(funnel.perMonth)} per month</span>
              </p>

              <div className="math-funnel">
                <p className="math-funnel__label">The funnel, reverse-engineered</p>
                <ol>
                  {steps.map((step) => (
                    <li key={step.label} className={step.emphasis ? 'is-emphasis' : undefined}>
                      <span>{step.label}</span>
                      <span className="math-funnel__track" aria-hidden="true">
                        <span style={{ width: `${(step.value / maxStep) * 100}%` }} />
                      </span>
                      <strong>{formatCount(step.value)}</strong>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="math-reps">
                <p>Reps needed</p>
                <strong>{formatReps(funnel.reps)}</strong>
                <span>
                  {formatDeals(funnel.closed)} deals at {formatMoney(input.deal)} make the year
                </span>
              </div>
            </>
          ) : (
            <div className="math-results__empty">
              <p>The funnel needs a target, a deal value, and rates above zero.</p>
            </div>
          )}
        </section>
      </div>
    </article>
  )
}
