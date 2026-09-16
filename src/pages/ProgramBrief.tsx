import { getDefaultClient, isSubmissionError } from '@formspree/core'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { CalendlySection } from '../components/CalendlySection'
import { DigitalEarthCanvas } from '../components/DigitalEarthCanvas'
import {
  GrowthClusterMap,
  GrowthScoreBars,
} from '../components/GrowthScoreChart'
import {
  DIAGNOSTIC_SCALE,
  DIAGNOSTIC_TOTAL_PAGES,
  SERVICES,
  answeredRatingCount,
  ratingsComplete,
  ratingsOnPage,
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
import { briefReviewUrl, decodeBriefReview } from '../data/briefReview'

const FORMSPREE_ID =
  (import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined) || 'xpqvjowe'

const STAGES = [
  'code',
  'direction',
  'services',
  'building',
  'done',
  'report',
  'review-missing',
] as const
type Stage = (typeof STAGES)[number]

function isReviewPath(pathname: string) {
  return pathname === '/brief/review' || pathname === '/diagnostic/review'
}
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
  const { pathname, hash } = useLocation()
  const isReview = isReviewPath(pathname)
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState<Stage>(isReview ? 'building' : 'code')
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
  const [copied, setCopied] = useState(false)

  const report = useMemo(
    () =>
      stage === 'report' || stage === 'done' ? buildBriefReport(answers) : null,
    [answers, stage],
  )
  const service = SERVICES[servicePage]
  const answeredCount = answeredRatingCount(answers)
  const totalSteps = QUALIFYING_ORDER.length + DIAGNOSTIC_TOTAL_PAGES
  const quizProgress =
    stage === 'services'
      ? (QUALIFYING_ORDER.length + servicePage + 1) / totalSteps
      : stage === 'building' || stage === 'done' || stage === 'report'
        ? 1
        : Math.max(0.06, QUALIFYING_ORDER.indexOf(stage as QualifyingStage) / totalSteps)
  const inQuiz =
    !isReview &&
    stage !== 'code' &&
    stage !== 'report' &&
    stage !== 'done' &&
    stage !== 'review-missing'

  useEffect(() => {
    const previous = document.title
    document.title = isReview
      ? 'Private brief review · MOSAIC'
      : 'Learn where your program excels · MOSAIC'
    const robots = isReview ? document.createElement('meta') : null
    if (robots) {
      robots.setAttribute('name', 'robots')
      robots.setAttribute('content', 'noindex, nofollow')
      document.head.appendChild(robots)
    }
    return () => {
      document.title = previous
      robots?.remove()
    }
  }, [isReview])

  useEffect(() => {
    if (isReview) {
      const token = hash.replace(/^#/, '') || searchParams.get('r') || ''
      const decoded = decodeBriefReview(token)
      if (decoded) {
        setAnswers(decoded)
        setStage('report')
      } else {
        setStage('review-missing')
      }
      setHydrated(true)
      return
    }

    try {
      const stored = parseStoredBrief(window.localStorage.getItem(BRIEF_STORAGE_KEY))
      if (stored) setAnswers(stored)
    } catch {
      /* ignore private-mode storage */
    }
    setHydrated(true)
  }, [hash, isReview, searchParams])

  useEffect(() => {
    if (!hydrated || isReview) return
    try {
      window.localStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(answers))
    } catch {
      /* ignore */
    }
  }, [answers, hydrated, isReview])

  useEffect(() => {
    if (isReview) return
    const fromUrl = searchParams.get('code')
    if (fromUrl && isValidInviteCode(fromUrl)) {
      setCode(fromUrl)
      setStage((current) => (current === 'code' ? 'direction' : current))
    }
  }, [isReview, searchParams])

  async function submitBrief() {
    if (saveState === 'saving') return
    setSaveState('saving')
    setSaveNote('Sending your answers…')
    if (stage !== 'done') setStage('building')
    window.scrollTo({ top: 0, behavior: 'instant' })

    const reportNow = buildBriefReport(answers)
    const privateReviewUrl = briefReviewUrl(answers)

    try {
      const result = await getDefaultClient().submitForm(
        FORMSPREE_ID,
        briefPayload(answers, reportNow, { privateReviewUrl }) as Record<
          string,
          string
        >,
      )
      if (isSubmissionError(result)) {
        const detail = result
          .getFormErrors()
          .map((error) => error.message)
          .filter(Boolean)
          .join(' ')
        throw new Error(detail || 'save failed')
      }
      setSaveState('saved')
      setSaveNote('Answers sent to MOSAIC.')
      setStage('done')
    } catch {
      setSaveState('error')
      setSaveNote(
        'Your answers are still here in this browser, but they have not been sent yet. Retry below.',
      )
      setStage('done')
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

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

      {inQuiz ? (
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


          {stage === 'services' && service ? (
            <>
              <div className="brief-quiz-heading">
                <div>
                  <p className="leak-kicker">
                    Growth diagnostic · {service.name}
                  </p>
                  <h1>How true is this of your marketing today?</h1>
                </div>
                <p className="brief-progress-label">
                  {answeredCount} of 30 ratings
                </p>
              </div>
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
            </>
          ) : null}

          {stage === 'building' ? (
            <div className="brief-building" role="status">
              <p className="leak-kicker">Growth diagnostic</p>
              <h1>Sending your answers…</h1>
              <p className="brief-note">
                MOSAIC uses this picture to prepare your discovery call. Results
                are walked through on the call, not on this page.
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
                  else if (stage === 'services' && servicePage === 0) go('direction')
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
                  saveState === 'saving' ||
                  (stage === 'direction' && !isDirectionReady(answers)) ||
                  (stage === 'services' && !ratingsOnPage(answers, servicePage))
                }
                onClick={() => {
                  if (stage === 'direction') {
                    const firstUnanswered = SERVICES.findIndex(
                      (_, index) => !ratingsOnPage(answers, index),
                    )
                    setServicePage(firstUnanswered < 0 ? 0 : firstUnanswered)
                    go('services')
                  } else if (stage === 'services' && servicePage < SERVICES.length - 1) {
                    setServicePage((page) => page + 1)
                    window.scrollTo({ top: 0, behavior: 'instant' })
                  } else if (stage === 'services' && ratingsComplete(answers)) {
                    void submitBrief()
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
                  : stage === 'services' && servicePage === SERVICES.length - 1
                      ? saveState === 'saving'
                        ? 'Sending…'
                        : 'Send my answers'
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

      {stage === 'review-missing' ? (
        <section className="assist-hero leak-hero" aria-labelledby="brief-review-missing">
          <div className="assist-hero__copy">
            <p className="leak-kicker">Private review</p>
            <h1 id="brief-review-missing">This review link is incomplete</h1>
            <p>
              Open the pictured report from the Formspree email that arrives when
              someone submits. That link is unique to that brief.
            </p>
            <p className="brief-home-link">
              <Link to="/brief">Back to the questionnaire</Link>
            </p>
          </div>
        </section>
      ) : null}

      {stage === 'done' ? (
        <section className="assist-hero leak-hero" aria-labelledby="brief-done-heading">
          <div className="assist-hero__copy">
            <p className="leak-kicker">Brief received</p>
            <h1 id="brief-done-heading">Your answers are with MOSAIC</h1>
            {saveState !== 'idle' ? (
              <div className={`brief-save ${saveState}`} role="status">
                <p>
                  {saveState === 'saving'
                    ? 'Sending your answers…'
                    : saveState === 'saved'
                      ? 'Answers sent to MOSAIC.'
                      : saveNote}
                </p>
                {saveState === 'error' ? (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => void submitBrief()}
                  >
                    Retry sending
                  </button>
                ) : null}
              </div>
            ) : null}
            <p>
              The growth picture is prepared for your discovery call. Book a
              time below to discuss further.
            </p>
          </div>
          <div className="assist-hero__visual" aria-hidden="true">
            <DigitalEarthCanvas />
          </div>
        </section>
      ) : null}

      {stage === 'report' && report ? (
        <section className="brief-report" aria-labelledby="report-heading">
          <p className="leak-kicker">Private review · not shown to the client</p>

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

          <h1 id="report-heading">{report.headline}</h1>
          <p className="brief-summary-line">{report.summaryLine}</p>
          <p className="brief-lede">{report.overview}</p>

          <div className="brief-block">
            <p className="leak-kicker">Direction</p>
            <h2>What they said they are trying to do</h2>
            {answers.incrementalRevenue.trim() ? (
              <p>
                <b>12-month incremental revenue.</b> {answers.incrementalRevenue.trim()}
              </p>
            ) : null}
            {answers.topProducts.trim() ? (
              <p>
                <b>Highest-revenue products/services.</b> {answers.topProducts.trim()}
              </p>
            ) : null}
            {answers.currentRoasCpa.trim() ? (
              <p>
                <b>Current ROAS/CPA.</b> {answers.currentRoasCpa.trim()}
              </p>
            ) : null}
          </div>

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
            <button type="button" className="btn" onClick={() => window.print()}>
              Print / save PDF
            </button>
            <button type="button" className="text-button" onClick={() => void copySnapshot()}>
              {copied ? 'Copied' : 'Copy snapshot'}
            </button>
          </div>

          <p className="brief-footnote">
            Private review link for MOSAIC. The client does not see this page.
          </p>
          <p className="brief-home-link no-print">
            <Link to="/">Back to hellomosaic.ai</Link>
          </p>
        </section>
      ) : null}

      {isReview && stage === 'building' ? (
        <section className="brief-report" aria-busy="true">
          <p className="leak-kicker">Private review</p>
          <h1>Opening brief…</h1>
        </section>
      ) : null}

      {stage === 'done' ? (
        <div className="no-print">
          <CalendlySection
            variant="button"
            label="Book a discovery call"
            title="Book a MOSAIC discovery call"
          />
          <p className="brief-home-link">
            <Link to="/">Back to hellomosaic.ai</Link>
          </p>
        </div>
      ) : null}
    </article>
  )
}
