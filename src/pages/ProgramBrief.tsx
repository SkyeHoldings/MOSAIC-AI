import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendlySection } from '../components/CalendlySection'
import { DigitalEarthCanvas } from '../components/DigitalEarthCanvas'
import {
  GrowthClusterMap,
  GrowthScoreBars,
} from '../components/GrowthScoreChart'
import {
  DIAGNOSTIC_SCALE,
  DIAGNOSTIC_TOTAL_PAGES,
  GOAL_OPTIONS,
  OWNER_OPTIONS,
  SCALE_LEGEND,
  SERVICES,
  SOURCE_OPTIONS,
  answeredRatingCount,
  isFactsReady,
  isYouReady,
  ratingsComplete,
  ratingsOnPage,
  type CustomerSource,
  type Goal12,
  type MarketingOwner,
} from '../data/growthDiagnostic'
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
  isDirectionReady,
  isFitReady,
  isPartnershipReady,
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
  'facts',
  'services',
  'building',
  'report',
] as const
type Stage = (typeof STAGES)[number]
type QualifyingStage = 'you' | 'direction' | 'partnership' | 'fit' | 'context'

const STAGE_META: Record<
  QualifyingStage,
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

const QUALIFYING_ORDER: QualifyingStage[] = [
  'you',
  'direction',
  'partnership',
  'fit',
  'context',
]

function isQualifyingStage(stage: Stage): stage is QualifyingStage {
  return QUALIFYING_ORDER.includes(stage as QualifyingStage)
}

function toggleSupport(current: SupportId[], id: SupportId) {
  return current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id]
}

function setRating(current: BriefAnswers, index: number, value: number): BriefAnswers {
  return {
    ...current,
    ratings: {
      ...current.ratings,
      [index]: value,
    },
  }
}

export function ProgramBrief() {
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState<Stage>('code')
  const [servicePage, setServicePage] = useState(0)
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
  const service = SERVICES[servicePage]
  const answeredCount = answeredRatingCount(answers)
  const totalSteps = QUALIFYING_ORDER.length + DIAGNOSTIC_TOTAL_PAGES
  const quizProgress =
    stage === 'facts'
      ? (QUALIFYING_ORDER.length + 1) / totalSteps
      : stage === 'services'
        ? (QUALIFYING_ORDER.length + servicePage + 2) / totalSteps
        : stage === 'building' || stage === 'report'
          ? 1
          : Math.max(0.06, QUALIFYING_ORDER.indexOf(stage as QualifyingStage) / totalSteps)

  useEffect(() => {
    const previous = document.title
    document.title = 'Learn where your program excels · MOSAIC'
    return () => {
      document.title = previous
    }
  }, [])

  useEffect(() => {
    try {
      const stored = parseStoredBrief(window.localStorage.getItem(BRIEF_STORAGE_KEY))
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
            'Your answers are still here in this browser, but they have not been sent yet. Retry below.',
          )
        }
      }
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [answers, report, saveAttempt, stage])

  useEffect(() => {
    if (stage !== 'building') return
    const timer = window.setTimeout(() => {
      setStage('report')
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 700)
    return () => window.clearTimeout(timer)
  }, [stage])

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
    try {
      await navigator.clipboard.writeText(report.snapshot)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const mailto = report
    ? `mailto:${encodeURIComponent(answers.email)}?subject=${encodeURIComponent(
        'Your MOSAIC growth picture',
      )}&body=${encodeURIComponent(
        `You completed a MOSAIC working brief and scored 10 marketing services. The lowest scores are where assistance would matter first.\n\n${report.snapshot}`,
      )}`
    : ''

  return (
    <article className="brief-page">
      {stage === 'code' ? (
        <section className="assist-hero leak-hero" aria-labelledby="brief-heading">
          <div className="assist-hero__copy">
            <p className="leak-kicker">A custom questionnaire built for your business.</p>
            <h1 id="brief-heading">
              <span>Learn where your program excels</span>
              <span>and where it can improve.</span>
            </h1>
            <p>
              Marketing gets complicated without an agency by your side monitoring
              and crafting how you are known, the demand you create, and the market
              you grow in. This picture will help support your discovery conversation
              with MOSAIC.
            </p>
            <p>
              This questionnaire takes 15 minutes to complete. We ask that you
              finish it in one sitting.
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
            <span style={{ width: `${Math.max(8, quizProgress * 100)}%` }} />
          </div>

          {isQualifyingStage(stage) ? (
            <>
              <p className="leak-kicker">{STAGE_META[stage].kicker}</p>
              <h1>{STAGE_META[stage].title}</h1>
              <p className="brief-note">{STAGE_META[stage].note}</p>
            </>
          ) : null}

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

          {stage === 'facts' ? (
            <>
              <div className="brief-quiz-heading">
                <div>
                  <p className="leak-kicker">Growth diagnostic · About the business · 1 of 11</p>
                  <h1>A few facts so the picture is about your company.</h1>
                </div>
                <p className="brief-progress-label">Part 1 of 11 · 5 facts</p>
              </div>
              <p className="brief-note">
                Approximate is fine. These five are not scored. They make the
                picture at the end about your company, not a generic report.
              </p>
              <div className="brief-fields">
                <div className="field">
                  <span>About how much revenue did the business do in the last 12 months?</span>
                  <div className="brief-money">
                    <b className="brief-money-prefix" aria-hidden="true">$</b>
                    <input
                      inputMode="decimal"
                      placeholder="0"
                      aria-label="Annual revenue last 12 months"
                      disabled={answers.revenuePreferNot}
                      value={answers.revenuePreferNot ? '' : answers.revenueInput}
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          revenueInput: event.target.value,
                          revenuePreferNot: false,
                        }))
                      }
                    />
                  </div>
                  <p className="brief-field-help">Approximate is fine. Whole dollars. No need for cents.</p>
                  <label className="brief-prefer-not">
                    <input
                      type="checkbox"
                      checked={answers.revenuePreferNot}
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          revenuePreferNot: event.target.checked,
                        }))
                      }
                    />
                    Prefer not to say
                  </label>
                </div>
                <div className="field">
                  <span>About how much do you spend on ads in a typical month? If it is zero, put 0.</span>
                  <div className="brief-money">
                    <b className="brief-money-prefix" aria-hidden="true">$</b>
                    <input
                      inputMode="decimal"
                      placeholder="0"
                      aria-label="Typical monthly ad spend"
                      disabled={answers.spendPreferNot}
                      value={answers.spendPreferNot ? '' : answers.spendInput}
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          spendInput: event.target.value,
                          spendPreferNot: false,
                        }))
                      }
                    />
                  </div>
                  <p className="brief-field-help">
                    Paid search, paid social, YouTube, display — the media spend, not the agency fee.
                  </p>
                  <label className="brief-prefer-not">
                    <input
                      type="checkbox"
                      checked={answers.spendPreferNot}
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          spendPreferNot: event.target.checked,
                        }))
                      }
                    />
                    Prefer not to say
                  </label>
                </div>
                <fieldset className="brief-choices">
                  <legend>Where do most customers come from today?</legend>
                  {SOURCE_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={`brief-choice${
                        answers.source === option.id ? ' is-selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="source"
                        checked={answers.source === option.id}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            source: option.id as CustomerSource,
                          }))
                        }
                      />
                      <span>
                        <strong>{option.label}</strong>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="brief-choices">
                  <legend>Who owns marketing day to day?</legend>
                  {OWNER_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={`brief-choice${
                        answers.owner === option.id ? ' is-selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="owner"
                        checked={answers.owner === option.id}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            owner: option.id as MarketingOwner,
                          }))
                        }
                      />
                      <span>
                        <strong>{option.label}</strong>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="brief-choices">
                  <legend>What needs to be true in 12 months?</legend>
                  {GOAL_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={`brief-choice${
                        answers.goal === option.id ? ' is-selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        checked={answers.goal === option.id}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            goal: option.id as Goal12,
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
            </>
          ) : null}

          {stage === 'services' && service ? (
            <>
              <div className="brief-quiz-heading">
                <div>
                  <p className="leak-kicker">
                    Growth diagnostic · {service.name} · {service.page} of 11
                  </p>
                  <h1>How true is this of your marketing today?</h1>
                </div>
                <p className="brief-progress-label">
                  Part {service.page} of 11 · {answeredCount} of 30 ratings
                </p>
              </div>
              <p className="brief-note">{service.line}</p>
              <p className="brief-scale-legend">{SCALE_LEGEND}</p>
              <div className="brief-question-list">
                {service.questions.map((text, offset) => {
                  const index = servicePage * 3 + offset
                  return (
                    <fieldset key={text} className="brief-question">
                      <legend>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        {text}
                      </legend>
                      <div className="brief-scale" role="radiogroup" aria-label={text}>
                        {DIAGNOSTIC_SCALE.map((option) => (
                          <label
                            key={option.value}
                            className={
                              answers.ratings[index] === option.value ? 'is-selected' : ''
                            }
                          >
                            <input
                              type="radio"
                              name={`diag-${index}`}
                              value={option.value}
                              checked={answers.ratings[index] === option.value}
                              onChange={() =>
                                setAnswers((current) =>
                                  setRating(current, index, option.value),
                                )
                              }
                            />
                            <span className="brief-scale-number">{option.value}</span>
                            <span className="brief-scale-label">{option.short}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )
                })}
              </div>
              <p className="brief-note brief-note-tight">
                Think about the last six months. Choose what fits most often. A
                low score is useful. That is how we see where MOSAIC should work
                first.
              </p>
            </>
          ) : null}

          {stage === 'building' ? (
            <div className="brief-building" role="status">
              <p className="leak-kicker">Growth diagnostic</p>
              <h1>Building your picture…</h1>
              <p className="brief-note">
                Ranking 10 services, lowest score first. Highest priority is
                where assistance would move the number.
              </p>
            </div>
          ) : null}

          {stage !== 'building' ? (
            <div className="brief-actions">
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  if (stage === 'you') go('code')
                  else if (stage === 'direction') go('you')
                  else if (stage === 'partnership') go('direction')
                  else if (stage === 'fit') go('partnership')
                  else if (stage === 'context') go('fit')
                  else if (stage === 'facts') go('context')
                  else if (stage === 'services' && servicePage === 0) go('facts')
                  else if (stage === 'services') {
                    setServicePage((page) => page - 1)
                    window.scrollTo({ top: 0, behavior: 'instant' })
                  }
                }}
              >
                {stage === 'services' ? 'Previous' : '← Previous'}
              </button>
              <button
                type="button"
                className="btn"
                disabled={
                  (stage === 'you' && !isYouReady(answers)) ||
                  (stage === 'direction' && !isDirectionReady(answers)) ||
                  (stage === 'partnership' && !isPartnershipReady(answers)) ||
                  (stage === 'fit' && !isFitReady(answers)) ||
                  (stage === 'facts' && !isFactsReady(answers)) ||
                  (stage === 'services' && !ratingsOnPage(answers, servicePage))
                }
                onClick={() => {
                  if (stage === 'you') go('direction')
                  else if (stage === 'direction') go('partnership')
                  else if (stage === 'partnership') go('fit')
                  else if (stage === 'fit') go('context')
                  else if (stage === 'context') go('facts')
                  else if (stage === 'facts') {
                    const firstUnanswered = SERVICES.findIndex(
                      (_, index) => !ratingsOnPage(answers, index),
                    )
                    setServicePage(firstUnanswered < 0 ? 0 : firstUnanswered)
                    go('services')
                  } else if (stage === 'services' && servicePage < SERVICES.length - 1) {
                    setServicePage((page) => page + 1)
                    window.scrollTo({ top: 0, behavior: 'instant' })
                  } else if (stage === 'services' && ratingsComplete(answers)) {
                    go('building')
                  } else if (stage === 'services') {
                    const firstUnanswered = SERVICES.findIndex(
                      (_, index) => !ratingsOnPage(answers, index),
                    )
                    setServicePage(firstUnanswered < 0 ? 0 : firstUnanswered)
                    window.scrollTo({ top: 0, behavior: 'instant' })
                  }
                }}
              >
                {stage === 'context'
                  ? 'Start the diagnostic'
                  : stage === 'facts'
                    ? isFactsReady(answers)
                      ? 'Start the ratings'
                      : 'Answer all five to continue'
                    : stage === 'services' && servicePage === SERVICES.length - 1
                      ? 'See my picture'
                      : stage === 'services'
                        ? ratingsOnPage(answers, servicePage)
                          ? 'Next'
                          : 'Answer all three to continue'
                        : 'Continue'}
              </button>
            </div>
          ) : null}
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

          <figure className="brief-type-hero">
            <img
              src={report.cluster.image}
              alt={report.cluster.imageAlt}
              width={1536}
              height={1024}
            />
            <figcaption>
              <span>{report.cluster.name} cluster</span>
              Lowest scores are the highest priority.
            </figcaption>
          </figure>

          <p className="leak-kicker">Your growth picture</p>
          <h1 id="report-heading">{report.headline}</h1>
          <p className="brief-summary-line">{report.summaryLine}</p>
          <p className="brief-lede">{report.overview}</p>

          <div className="brief-map-layout">
            <GrowthClusterMap scores={report.clusterScores} />
            <GrowthScoreBars scores={report.ranked} />
          </div>

          <div className="brief-priority">
            <p className="leak-kicker">Start here</p>
            <h2>
              These are the lowest scores. This is the assistance order — not a
              pitch deck.
            </h2>
            <div className="brief-service-cards">
              {report.priority.map((item, index) => (
                <article key={item.id} className="brief-service-card">
                  <header>
                    <span>
                      {String(index + 1).padStart(2, '0')} / {item.bandLabel}
                    </span>
                    <strong>{item.name}</strong>
                    <em style={{ color: item.color }}>{item.score.toFixed(1)} / 5</em>
                  </header>
                  {item.means ? (
                    <p>
                      <b>What this means.</b> {item.means}
                    </p>
                  ) : null}
                  {item.picture ? (
                    <p>
                      <b>The picture.</b> {item.picture}
                    </p>
                  ) : null}
                  {item.help ? (
                    <p>
                      <b>How MOSAIC helps.</b> {report.helpPrefix} {item.help}
                    </p>
                  ) : (
                    <p>
                      <b>How MOSAIC helps.</b> {report.helpPrefix}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>

          {report.strength ? (
            <div className="brief-block">
              <p className="leak-kicker">Protect this</p>
              <h2>{report.strength.name}</h2>
              <p>{report.strengthLine}</p>
            </div>
          ) : null}

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
                {answers.growthPast.trim() && answers.growthWanted.trim() ? ' ' : null}
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
            <p className="leak-kicker">What MOSAIC would do with this</p>
            <h2>A defined 90-day pass, in this order.</h2>
            <p>{report.close}</p>
            <p>
              {report.firstMove} {report.fitLabel}. {report.fitNote}
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
            <a className="btn" href="#book">
              Book a working session
            </a>
            <a className="text-button" href={mailto}>
              Email this picture to myself
            </a>
            <button type="button" className="text-button" onClick={() => void copySnapshot()}>
              {copied ? 'Copied' : 'Copy my snapshot'}
            </button>
            <button type="button" className="text-button" onClick={() => window.print()}>
              Print / save PDF
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => go('you')}
            >
              Review my answers
            </button>
          </div>

          <p className="brief-footnote">
            {answers.name || 'You'} · {report.companyLine} · This is a self-score
            and a working brief, not an audit, proposal, or contract.
          </p>
        </section>
      ) : null}

      {stage === 'report' ? (
        <div className="no-print">
          <div className="leak-cal-intro">
            <p>
              If the picture is useful, book a working session. Come with this
              brief open.
            </p>
          </div>
          <CalendlySection
            label="Book a working session"
            title="Book a MOSAIC working session with Skye"
          />
          <p className="brief-home-link">
            <Link to="/">Back to hellomosaic.ai</Link>
          </p>
        </div>
      ) : null}
    </article>
  )
}
