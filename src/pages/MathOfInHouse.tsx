import { useEffect, useId, useState, type ReactNode } from 'react'

type Plan = {
  feePct: number
  inHouse: number
  team: string
}

type Preset = {
  id: string
  name: string
  detail: string
  spend: number
}

const PRESETS: Preset[] = [
  { id: 'mid', name: 'Mid-market', detail: '$8M', spend: 8_000_000 },
  { id: 'national', name: 'National', detail: '$20M', spend: 20_000_000 },
  { id: 'enterprise', name: 'Enterprise', detail: '$50M', spend: 50_000_000 },
  { id: 'global', name: 'Global', detail: '$100M', spend: 100_000_000 },
]

function planForSpend(spend: number): Plan {
  if (spend < 5_000_000) {
    return { feePct: 10, inHouse: 220_000, team: 'One paid-media lead and tools' }
  }
  if (spend < 12_000_000) {
    return { feePct: 8, inHouse: 360_000, team: 'A lead, a specialist, and tools' }
  }
  if (spend < 30_000_000) {
    return { feePct: 4, inHouse: 625_000, team: 'A director, two channel leads, and tools' }
  }
  if (spend < 70_000_000) {
    return { feePct: 4, inHouse: 1_190_000, team: 'A director, four specialists, and tools' }
  }
  return { feePct: 4, inHouse: 1_870_000, team: 'A full in-house desk and tools' }
}

type Result = {
  fee: number
  savings: number
  feePortion: number
  spendPortion: number
}

function compute(spend: number, feePct: number, inHouse: number): Result | null {
  if (spend <= 0) return null
  const fee = spend * (feePct / 100)
  const team = Math.max(0, inHouse)
  const savings = fee - team
  return {
    fee,
    savings,
    feePortion: fee > 0 ? (savings / fee) * 100 : 0,
    spendPortion: (savings / spend) * 100,
  }
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return '—'
  return `$${Math.round(Math.abs(value)).toLocaleString('en-US')}`
}

function formatPct(value: number) {
  if (!Number.isFinite(value)) return '—'
  const rounded = Math.round(Math.abs(value) * 10) / 10
  return `${rounded.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`
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

export function MathOfInHouse() {
  const opening = planForSpend(PRESETS[1].spend)
  const [presetId, setPresetId] = useState('national')
  const [linked, setLinked] = useState(true)
  const [spend, setSpend] = useState(PRESETS[1].spend)
  const [feePct, setFeePct] = useState(opening.feePct)
  const [inHouse, setInHouse] = useState(opening.inHouse)
  const plan = planForSpend(spend)
  const result = compute(spend, feePct, inHouse)
  const ready = result != null
  const saves = ready && result.savings >= 0
  const teamShare = ready && result.fee > 0 ? Math.min(100, Math.max(0, (inHouse / result.fee) * 100)) : 0
  const saveShare = ready && result.fee > 0 ? Math.min(100, Math.max(0, 100 - teamShare)) : 0

  useEffect(() => {
    const previous = document.title
    document.title = 'Math of In-House · MOSAIC'
    return () => {
      document.title = previous
    }
  }, [])

  function applySpend(next: number, fromPreset = false) {
    if (!fromPreset) setPresetId('custom')
    setSpend(next)
    if (linked || fromPreset) {
      const nextPlan = planForSpend(next)
      setFeePct(nextPlan.feePct)
      setInHouse(nextPlan.inHouse)
      setLinked(true)
    }
  }

  return (
    <article className="math-page">
      <header className="math-intro">
        <p className="math-kicker">Math of in-house</p>
        <h1>
          Plug in the spend.
          <span>See the portion you keep.</span>
        </h1>
        <p>
          The holding-company fee is a portion of media spend. An in-house team
          is a cost that does not grow as fast. The gap is what the brand saves
          by taking the buying in-house.
        </p>
      </header>

      <div className="math-presets" role="group" aria-label="Example media budgets">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={presetId === preset.id ? 'is-active' : undefined}
            aria-pressed={presetId === preset.id}
            onClick={() => {
              setPresetId(preset.id)
              applySpend(preset.spend, true)
            }}
          >
            <strong>{preset.name}</strong>
            <span>{preset.detail}</span>
          </button>
        ))}
      </div>

      <div className="math-layout">
        <form className="math-form" onSubmit={(event) => event.preventDefault()}>
          <Group title="Media spend">
            <NumberField
              label="Annual media spend"
              prefix="$"
              value={spend}
              onChange={(next) => applySpend(next)}
            />
          </Group>

          <Group title="The agency portion">
            <NumberField
              label="Agency fee"
              suffix="%"
              max={100}
              value={feePct}
              onChange={(next) => {
                setLinked(false)
                setPresetId('custom')
                setFeePct(next)
              }}
            />
          </Group>

          <Group title="The in-house team">
            <NumberField
              label="Team cost, fully loaded"
              prefix="$"
              value={inHouse}
              onChange={(next) => {
                setLinked(false)
                setPresetId('custom')
                setInHouse(next)
              }}
            />
          </Group>

          <p className="math-note">
            {linked ? `${plan.team}.` : 'Custom fee or team. Pick a budget above to follow the spend again.'}{' '}
            The fee follows the budget until you edit it: 8% under $12M, 4%
            from a national account through the largest budgets.
            Team cost is payroll plus tools.
          </p>
        </form>

        <section className="math-results" aria-live="polite">
          {ready && result ? (
            <>
              <p className="math-results__kicker">
                {saves ? 'Saved by going in-house' : 'Extra cost of going in-house'}
              </p>
              <p className="math-results__dial">{formatMoney(result.savings)}</p>
              <p className="math-results__sub">
                {saves ? (
                  <>
                    <span>{formatPct(result.feePortion)} of the agency fee</span>
                    <span>{formatPct(result.spendPortion)} of media spend</span>
                  </>
                ) : (
                  <span>The fee is already below this team.</span>
                )}
              </p>

              {result.fee > 0 && saves ? (
                <div className="math-portion">
                  <p className="math-funnel__label">How the agency fee splits</p>
                  <div className="math-portion__bar" aria-hidden="true">
                    <span style={{ width: `${teamShare}%` }} />
                    <span style={{ width: `${saveShare}%` }} />
                  </div>
                  <div className="math-portion__key">
                    <span>Team {formatMoney(inHouse)}</span>
                    <span>Saved {formatMoney(result.savings)}</span>
                  </div>
                </div>
              ) : null}

              <div className="math-funnel math-funnel--compare">
                <p className="math-funnel__label">On {formatMoney(spend)} of media</p>
                <ol>
                  {(
                    [
                      { label: 'Agency fee', value: result.fee },
                      { label: 'In-house team', value: inHouse },
                      {
                        label: saves ? 'Portion saved' : 'Portion added',
                        value: Math.abs(result.savings),
                        emphasis: true,
                      },
                    ] as const
                  ).map((line) => {
                    const scale = Math.max(result.fee, inHouse, Math.abs(result.savings), 1)
                    return (
                      <li key={line.label} className={'emphasis' in line && line.emphasis ? 'is-emphasis' : undefined}>
                        <span>{line.label}</span>
                        <span className="math-funnel__track" aria-hidden="true">
                          <span style={{ width: `${(line.value / scale) * 100}%` }} />
                        </span>
                        <strong>{formatMoney(line.value)}</strong>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </>
          ) : (
            <div className="math-results__empty">
              <p>Add an annual media spend above zero.</p>
            </div>
          )}
        </section>
      </div>
    </article>
  )
}
