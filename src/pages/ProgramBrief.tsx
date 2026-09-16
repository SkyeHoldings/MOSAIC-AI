import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendlySection } from '../components/CalendlySection'
import { DigitalEarthCanvas } from '../components/DigitalEarthCanvas'
import {
  BRIEF_STORAGE_KEY,
  BUDGET_OPTIONS,
  DURATION_OPTIONS,
  PROCESS_OPTIONS,
  ROLE_OPTIONS,
  SUPPORT_OPTIONS,
  type BriefAnswers,
  type SupportId,
  briefPayload,
  buildBriefReport,
  emptyBriefAnswers,
  isValidInviteCode,
  parseStoredBrief,
} from '../data/programBrief'

const FORMSPREE_ID =
  (import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined) || 'xpqvjowe'

const STAGES = [
  'code',
  'you',
  'direction',
  'partnership',
  'fit',
  'context',
  'report',
] as const

type Stage = (typeof STAGES)[number]

const STAGE_META: Record<
  Exclude<Stage, 'code' | 'report'>,
  { kicker: string; title: string; note: string }
> = {
  you: {
    kicker: 'Before we begin',
    title: 'First, introduce yourself.',
    note: 'Skye receives your completed brief and uses it to prepare the next conversation. Other visitors cannot see your answers.',
  },
  direction: {
    kicker: '01 / Direction',
    title: 'Where are you trying to go?',
    note: 'Be specific if you can. Rough numbers are more useful than polished language.',
  },
  partnership: {
    kicker: '02 / How we would work',
    title: 'What kind of support do you actually need?',
    note: 'You can choose more than one. We will sequence the work from there.',
  },
  fit: {
    kicker: '03 / Fit',
    title: 'Team, time, and investment.',
    note: 'MOSAIC usually starts with a discovery audit around $5,000. Base monthly fees start at $20,000 for a 6-month engagement. Ad spend is separate.',
  },
  context: {
    kicker: '04 / Context',
    title: 'What is and is not working.',
    note: 'Optional, but this is what makes the brief useful. Leave out names you would rather keep private.',
  },
}

function toggleSupport(current: SupportId[], id: SupportId) {
  return current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id]
}

function isYouReady(answers: BriefAnswers) {
  return (
    answers.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email) &&
    answers.consent
  )
}

function isDirectionReady(answers: BriefAnswers) {
  return answers.goals6.trim().length > 8 || answers.goals12.trim().length > 8
}

function isPartnershipReady(answers: BriefAnswers) {
  return answers.support.length > 0 && Boolean(answers.duration)
}

function isFitReady(answers: BriefAnswers) {
  return Boolean(answers.budget) && Boolean(answers.process)
}

export function ProgramBrief() {
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState<Stage>('code')
  const [code, setCode] = useState(searchParams.get('code') ?? '')
  const [codeError, setCodeError] = useState('')
  const [checkingCode, setCheckingCode] = useState(false)
  const [answers, setAnswers] = useState<BriefAnswers>(emptyBriefAnswers)
  const [hydrated, setHydrated] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  )
  const [saveNote, setSaveNote] = useState('')
  const [saveAttempt, setSaveAttempt] = useState(0)
  const [copied, setCopied] = useState(false)

  const report = useMemo(
    () => (stage === 'report' ? buildBriefReport(answers) : null),
    [answers, stage],
  )

  useEffect(() => {
    const previous = document.title
    document.title = 'Program Brief · MOSAIC'
    return () => {
      document.title = previous
    }
  }, [])

  useEffect(() => {
    try {
      const stored = parseStoredBrief(
        window.localStorage.getItem(BRIEF_STORAGE_KEY),
      )
      if (stored) setAnswers(stored)
    } catch {
      /* ignore private-mode storage */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(answers))
    } catch {
      /* ignore */
    }
  }, [answers, hydrated])

  useEffect(() => {
    const fromUrl = searchParams.get('code')
    if (fromUrl && isValidInviteCode(fromUrl)) {
      setCode(fromUrl)
      setStage((current) => (current === 'code' ? 'you' : current))
    }
  }, [searchParams])

  useEffect(() => {
    if (stage !== 'report' || !report) return
    let cancelled = false
    setSaveState('saving')
    setSaveNote('Saving your brief for Skye…')

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(briefPayload(answers, report)),
        })
        if (!response.ok) throw new Error('save failed')
        if (!cancelled) {
          setSaveState('saved')
          setSaveNote('Your completed brief is saved for Skye.')
        }
      } catch {
        if (!cancelled) {
          setSaveState('error')
          setSaveNote(
            'Your brief is still here in this browser, but it has not been sent yet. Retry below.',
          )
        }
      }
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [report, saveAttempt, stage])

  function go(next: Stage) {
    setStage(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function submitCode(event: FormEvent) {
    event.preventDefault()
    setCheckingCode(true)
    setCodeError('')
    window.setTimeout(() => {
      if (isValidInviteCode(code)) {
        go('you')
      } else {
        setCodeError('That code is not active. Use the invite from your note or email.')
      }
      setCheckingCode(false)
    }, 280)
  }

  async function copySnapshot() {
    if (!report) return
    const text = [
      `MOSAIC | Program brief | ${answers.company || answers.name}`,
      '',
      report.headline,
      '',
      report.overview,
      '',
      'KEEP',
      report.keep,
      '',
      'LOOK MORE CLOSELY',
      report.leak,
      '',
      'HOW WE WOULD WORK',
      report.partnership,
      '',
      'HOW WE WOULD MEASURE',
      report.measure,
      '',
      'ENGAGEMENT',
      report.engagement,
      '',
      'INVESTMENT',
      report.budgetNote,
      '',
      'FIRST 30 DAYS',
      report.firstMove,
      '',
      'This is an informal working brief, not a proposal or contract.',
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const quizIndex = STAGES.indexOf(stage)

  return (
    <article className="brief-page">
      {stage === 'code' ? (
        <section className="assist-hero leak-hero" aria-labelledby="brief-heading">
          <div className="assist-hero__copy">
            <p className="leak-kicker">Private · Invite only</p>
            <h1 id="brief-heading">A working brief before we talk.</h1>
            <p>
              For people considering MOSAIC as a marketing partner. About 8–10
              minutes. You get a snapshot of how we would work together. Skye
              gets a prepared conversation instead of a cold intro call.
            </p>
            <form className="brief-code-form" onSubmit={submitCode}>
              <label htmlFor="brief-code">Invite code</label>
              <input
                id="brief-code"
                name="code"
                value={code}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={40}
                onChange={(event) => {
                  setCode(event.target.value)
                  setCodeError('')
                }}
                aria-invalid={Boolean(codeError)}
                aria-describedby={codeError ? 'brief-code-error' : undefined}
              />
              {codeError ? (
                <p id="brief-code-error" className="form-note form-note-error" role="alert">
                  {codeError}
                </p>
              ) : (
                <p className="form-note">Use the code from your invite.</p>
              )}
              <button className="btn" type="submit" disabled={checkingCode}>
                {checkingCode ? 'Checking…' : 'Continue'}
              </button>
            </form>
          </div>
          <div className="assist-hero__visual" aria-hidden="true">
            <DigitalEarthCanvas />
          </div>
        </section>
      ) : null}

      {stage !== 'code' && stage !== 'report' ? (
        <section className="quiz-shell brief-shell">
          <div className="brief-progress" aria-hidden="true">
            <span style={{ width: `${(quizIndex / (STAGES.length - 1)) * 100}%` }} />
          </div>
          <p className="leak-kicker">{STAGE_META[stage].kicker}</p>
          <h1>{STAGE_META[stage].title}</h1>
          <p className="brief-note">{STAGE_META[stage].note}</p>

          {stage === 'you' ? (
            <div className="brief-fields">
              <label className="field">
                <span>Your name</span>
                <input
                  value={answers.name}
                  autoComplete="name"
                  maxLength={100}
                  onChange={(event) =>
                    setAnswers((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={answers.email}
                  autoComplete="email"
                  maxLength={200}
                  onChange={(event) =>
                    setAnswers((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Company</span>
                <input
                  value={answers.company}
                  autoComplete="organization"
                  maxLength={160}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      company: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Your role</span>
                <select
                  value={answers.role}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      role: event.target.value as BriefAnswers['role'],
                    }))
                  }
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="brief-consent">
                <input
                  type="checkbox"
                  checked={answers.consent}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      consent: event.target.checked,
                    }))
                  }
                />
                <span>
                  I understand Skye will receive this completed brief and use it
                  to prepare a conversation about MOSAIC marketing support. This
                  is not a proposal or a contract.
                </span>
              </label>
            </div>
          ) : null}

          {stage === 'direction' ? (
            <div className="brief-fields">
              <label className="field">
                <span>What are you looking to achieve in the next 6 months?</span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={answers.goals6}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      goals6: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>What about 1 year from now?</span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={answers.goals12}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      goals12: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>
                  What KPIs would you use to track success if we worked together?
                </span>
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={answers.kpis}
                  placeholder="Booked jobs, revenue, qualified calls, cost per job — whatever is true."
                  onChange={(event) =>
                    setAnswers((current) => ({ ...current, kpis: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>How fast has the business grown in the past year?</span>
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={answers.growthPast}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      growthPast: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>
                  How fast do you need revenue or profit to grow the rest of this
                  year — and next year?
                </span>
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={answers.growthWanted}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      growthWanted: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
          ) : null}

          {stage === 'partnership' ? (
            <div className="brief-fields">
              <fieldset className="brief-choices">
                <legend>What type of work are you looking for support on?</legend>
                {SUPPORT_OPTIONS.map((option) => {
                  const selected = answers.support.includes(option.id)
                  return (
                    <label
                      key={option.id}
                      className={`brief-choice${selected ? ' is-selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            support: toggleSupport(current.support, option.id),
                          }))
                        }
                      />
                      <span>
                        <strong>{option.title}</strong>
                        {option.body}
                      </span>
                    </label>
                  )
                })}
              </fieldset>

              <fieldset className="brief-choices">
                <legend>How long are you looking for support?</legend>
                {DURATION_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`brief-choice${
                      answers.duration === option.id ? ' is-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      checked={answers.duration === option.id}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          duration: option.id,
                        }))
                      }
                    />
                    <span>
                      <strong>{option.label}</strong>
                      {option.hint}
                    </span>
                  </label>
                ))}
              </fieldset>

              {answers.duration === 'in-house' ? (
                <label className="field">
                  <span>At what point would you want the work in-house?</span>
                  <input
                    maxLength={240}
                    value={answers.inHouseWhen}
                    placeholder="After 6 months, when we hire a coordinator, next spring…"
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        inHouseWhen: event.target.value,
                      }))
                    }
                  />
                </label>
              ) : null}

              <label className="field">
                <span>
                  Tell me about your current team: headcount, upcoming hires, and
                  resource gaps.
                </span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={answers.team}
                  onChange={(event) =>
                    setAnswers((current) => ({ ...current, team: event.target.value }))
                  }
                />
              </label>
            </div>
          ) : null}

          {stage === 'fit' ? (
            <div className="brief-fields">
              <fieldset className="brief-choices">
                <legend>What is the target budget?</legend>
                {BUDGET_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`brief-choice${
                      answers.budget === option.id ? ' is-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="budget"
                      checked={answers.budget === option.id}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          budget: option.id,
                        }))
                      }
                    />
                    <span>
                      <strong>{option.label}</strong>
                      {option.hint}
                    </span>
                  </label>
                ))}
              </fieldset>

              <fieldset className="brief-choices">
                <legend>Where are you today in your selection process?</legend>
                {PROCESS_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`brief-choice${
                      answers.process === option.id ? ' is-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="process"
                      checked={answers.process === option.id}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          process: option.id,
                        }))
                      }
                    />
                    <span>
                      <strong>{option.label}</strong>
                    </span>
                  </label>
                ))}
              </fieldset>
            </div>
          ) : null}

          {stage === 'context' ? (
            <div className="brief-fields">
              <label className="field">
                <span>What part of your marketing is working today?</span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={answers.working}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      working: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>What is not working — where do inquiries or jobs stall?</span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={answers.notWorking}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      notWorking: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>
                  Optional: have you worked with a consultant, agency, or
                  freelancer before? What did you like and not like?
                </span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={answers.pastAgency}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      pastAgency: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Do you have questions for MOSAIC before we proceed?</span>
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={answers.questionsForMosaic}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      questionsForMosaic: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
          ) : null}

          <div className="brief-actions">
            <button
              type="button"
              className="text-button"
              onClick={() => {
                if (stage === 'you') go('code')
                if (stage === 'direction') go('you')
                if (stage === 'partnership') go('direction')
                if (stage === 'fit') go('partnership')
                if (stage === 'context') go('fit')
              }}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="btn"
              disabled={
                (stage === 'you' && !isYouReady(answers)) ||
                (stage === 'direction' && !isDirectionReady(answers)) ||
                (stage === 'partnership' && !isPartnershipReady(answers)) ||
                (stage === 'fit' && !isFitReady(answers))
              }
              onClick={() => {
                if (stage === 'you') go('direction')
                else if (stage === 'direction') go('partnership')
                else if (stage === 'partnership') go('fit')
                else if (stage === 'fit') go('context')
                else go('report')
              }}
            >
              {stage === 'context' ? 'Build my brief' : 'Continue'} →
            </button>
          </div>
        </section>
      ) : null}

      {stage === 'report' && report ? (
        <section className="brief-report" aria-labelledby="report-heading">
          <div className={`brief-save ${saveState}`} role="status">
            <p>{saveNote}</p>
            {saveState === 'error' ? (
              <button
                type="button"
                className="text-button"
                onClick={() => setSaveAttempt((current) => current + 1)}
              >
                Retry saving
              </button>
            ) : null}
          </div>

          <p className="leak-kicker">Your MOSAIC brief</p>
          <h1 id="report-heading">{report.headline}</h1>
          <p className="brief-lede">{report.overview}</p>

          <div className="brief-tiles">
            {report.tiles.map((tile) => (
              <article key={tile.label}>
                <span>{tile.label}</span>
                <strong>{tile.value}</strong>
              </article>
            ))}
          </div>

          <div className="brief-insights">
            <article>
              <span>01 / Keep</span>
              <h2>What to protect</h2>
              <p>{report.keep}</p>
            </article>
            <article>
              <span>02 / Look closer</span>
              <h2>Where the program leaks</h2>
              <p>{report.leak}</p>
            </article>
          </div>

          <div className="brief-block">
            <h2>How MOSAIC would partner</h2>
            <p>{report.partnership}</p>
          </div>
          <div className="brief-block">
            <h2>How we would measure it</h2>
            <p>{report.measure}</p>
            {answers.growthPast.trim() || answers.growthWanted.trim() ? (
              <p>
                {answers.growthPast.trim()
                  ? `Past year: ${answers.growthPast.trim()}`
                  : null}
                {answers.growthPast.trim() && answers.growthWanted.trim()
                  ? ' '
                  : null}
                {answers.growthWanted.trim()
                  ? `The pace you want next: ${answers.growthWanted.trim()}`
                  : null}
              </p>
            ) : null}
            {answers.team.trim() ? <p>Team: {answers.team.trim()}</p> : null}
          </div>
          <div className="brief-block">
            <h2>Shape of the engagement</h2>
            <p>{report.engagement}</p>
            <p>{report.budgetNote}</p>
          </div>
          <div className="brief-experiment">
            <p className="leak-kicker">First 30 days</p>
            <h2>{report.firstMove}</h2>
            <p>
              {report.fitLabel}. {report.fitNote}
            </p>
          </div>

          {answers.questionsForMosaic.trim() ? (
            <div className="brief-block">
              <h2>Your questions for MOSAIC</h2>
              <p>{answers.questionsForMosaic.trim()}</p>
            </div>
          ) : null}

          {answers.pastAgency.trim() ? (
            <div className="brief-block">
              <h2>What you liked and did not like before</h2>
              <p>{answers.pastAgency.trim()}</p>
            </div>
          ) : null}

          <div className="brief-report-actions no-print">
            <button type="button" className="btn" onClick={() => window.print()}>
              Print / save PDF
            </button>
            <button type="button" className="text-button" onClick={() => void copySnapshot()}>
              {copied ? 'Copied' : 'Copy my snapshot'}
            </button>
            <button type="button" className="text-button" onClick={() => go('context')}>
              Review my answers
            </button>
          </div>

          <p className="brief-footnote">
            {answers.name || 'You'} · {answers.company || 'MOSAIC program brief'} ·
            Informal working snapshot, not a validated assessment or a proposal.
          </p>
        </section>
      ) : null}

      {stage === 'report' ? (
        <div className="no-print">
          <div className="leak-cal-intro">
            <p>
              If the picture is useful, book a working conversation. Come with
              this brief open.
            </p>
          </div>
          <CalendlySection
            label="Book a conversation about this brief"
            title="Book a MOSAIC conversation with Skye"
          />
          <p className="brief-home-link">
            <Link to="/">Back to hellomosaic.ai</Link>
          </p>
        </div>
      ) : null}
    </article>
  )
}
