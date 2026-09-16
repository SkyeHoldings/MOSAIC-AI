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
  ratingsComplete,
  ratingsOnPage,
  type CustomerSource,
  type Goal12,
  type MarketingOwner,
} from '../data/growthDiagnostic'
import {
  BRIEF_STORAGE_KEY,
  type BriefAnswers,
  briefPayload,
  buildBriefReport,
  emptyBriefAnswers,
  isDirectionReady,
  isValidInviteCode,
  parseStoredBrief,
} from '../data/programBrief'

const FORMSPREE_ID =
  (import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined) || 'xpqvjowe'

const STAGES = [
  'code',
  'direction',
  'facts',
  'services',
  'building',
  'report',
] as const
type Stage = (typeof STAGES)[number]
type QualifyingStage = 'direction'

const STAGE_META: Record<
  QualifyingStage,
  { kicker: string; title: string; note: string }
> = {
  direction: {
    kicker: '01 / Direction',
    title: 'Where are you trying to go?',
    note: 'Be specific if you can. Rough numbers are more useful than polished language.',
  },
}

const QUALIFYING_ORDER: QualifyingStage[] = ['direction']

function isQualifyingStage(stage: Stage): stage is QualifyingStage {
  return QUALIFYING_ORDER.includes(stage as QualifyingStage)
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
      setStage((current) => (current === 'code' ? 'direction' : current))
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
        go('direction')
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
            <p className="leak-kicker">A custom questionnaire built for your business</p>
            <h1 id="brief-heading">
              <span>Learn where your program excels</span>
              <span>and where it can improve</span>
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

          {stage === 'direction' ? (
            <div className="brief-fields">
              <label className="field">
                <span>
                  How much incremental revenue are you looking to generate in the
                  next 12 months?
                </span>
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={answers.incrementalRevenue}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      incrementalRevenue: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Which products/services generate the most revenue?</span>
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={answers.topProducts}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      topProducts: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>What is your current ROAS/CPA?</span>
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={answers.currentRoasCpa}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      currentRoasCpa: event.target.value,
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
                  if (stage === 'direction') go('code')
                  else if (stage === 'facts') go('direction')
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
                  (stage === 'direction' && !isDirectionReady(answers)) ||
                  (stage === 'facts' && !isFactsReady(answers)) ||
                  (stage === 'services' && !ratingsOnPage(answers, servicePage))
                }
                onClick={() => {
                  if (stage === 'direction') go('facts')
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
                {stage === 'direction'
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

          {report.tiles.length > 0 ? (
            <div className="brief-tiles">
              {report.tiles.map((tile) => (
                <article key={tile.label}>
                  <span>{tile.label}</span>
                  <strong>{tile.value}</strong>
                </article>
              ))}
            </div>
          ) : null}

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
            {answers.topProducts.trim() ? (
              <p>Highest-revenue products/services: {answers.topProducts.trim()}</p>
            ) : null}
          </div>
          <div className="brief-block">
            <h2>Shape of the engagement</h2>
            {answers.duration ? <p>{report.engagement}</p> : null}
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
            {answers.email.trim() ? (
              <a className="text-button" href={mailto}>
                Email this picture to myself
              </a>
            ) : null}
            <button type="button" className="text-button" onClick={() => void copySnapshot()}>
              {copied ? 'Copied' : 'Copy my snapshot'}
            </button>
            <button type="button" className="text-button" onClick={() => window.print()}>
              Print / save PDF
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => go('direction')}
            >
              Review my answers
            </button>
          </div>

          <p className="brief-footnote">
            {[answers.name.trim(), answers.company.trim()].filter(Boolean).join(' · ')}
            {answers.name.trim() || answers.company.trim() ? ' · ' : ''}
            This is a self-score and a working brief, not an audit, proposal, or
            contract.
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
