import { useMemo, useState } from 'react'
import { PAGES, SAMPLE_ROWS } from '../keel/catalog'
import {
  addExclusion,
  analysisRange,
  applyBudgets,
  audienceEdit,
  changeMode,
  createCohort,
  DEFAULT_URL_TAGS,
  deleteCohort,
  deployAssetGroup,
  extractAssetGroup,
  filterRows,
  fingerprint,
  healthCheck,
  matchStorePaste,
  preflightAssetGroup,
  refreshProposals,
  saveBlueprint,
  sortRows,
  updatePilot,
  withPace,
  type Blueprint,
  type Cohort,
  type Exclusion,
  type FilterName,
  type Mode,
  type SortKey,
} from '../keel/client'
import './Keel.css'

const FILTERS: FilterName[] = ['All', 'BLOCK only', 'Over-pacing', 'Under-pacing', 'Off-plan', 'No spend', 'Unfunded', 'Completed', 'Franchise']
const SORTS: { id: SortKey; label: string }[] = [
  { id: 'store', label: 'Store' },
  { id: 'channel', label: 'Channel' },
  { id: 'budget', label: 'Budget' },
  { id: 'spent', label: 'Actual' },
  { id: 'pace', label: 'Pace' },
  { id: 'rec', label: 'Required / day' },
]

const NAV = [
  { group: 'Action', items: [
    { path: '/actuation', name: 'Actuation' },
    { path: '/creative', name: 'Creative' },
    { path: '/audiences', name: 'Audiences' },
    { path: '/assetgroups', name: 'Asset Groups' },
  ]},
  { group: 'Pacing', items: [
    { path: '/', name: 'Command Center' },
    { path: '/channels', name: 'Channels' },
    { path: '/stores', name: 'Stores' },
    { path: '/pmax-review', name: 'PMAX Read/Action' },
    { path: '/lost-is', name: 'PMAX Lost-IS' },
    { path: '/meta-frequency', name: 'Meta Frequency' },
    { path: '/geo', name: 'Geo targeting' },
    { path: '/cohorts', name: 'Cohorts' },
    { path: '/settings', name: 'Pacing Settings' },
  ]},
  { group: 'Analysis', items: [
    { path: '/analysis', name: 'Reporting' },
    { path: '/map', name: 'Fleet Map' },
  ]},
  { group: 'Settings', items: [
    { path: '/health', name: 'Health' },
    { path: '/team', name: 'Team' },
    { path: '/audit', name: 'Audit Log' },
  ]},
]

const DIRECTORY = [
  { storeId: '1', storeName: 'Sample North' },
  { storeId: '2', storeName: 'Sample South' },
  { storeId: '3', storeName: 'Sample East' },
]

function resultText(result: { ok: boolean; error?: string }, okText: string) {
  return result.ok ? okText : result.error || 'Request failed.'
}

export function Keel() {
  const [path, setPath] = useState<string>(PAGES[0].path)
  const [dayOfPeriod, setDayOfPeriod] = useState(1)
  const [daysInPeriod, setDaysInPeriod] = useState(28)
  const [filter, setFilter] = useState<FilterName>('All')
  const [sortKey, setSortKey] = useState<SortKey>('pace')
  const [mode, setMode] = useState<Mode>('OBSERVE')
  const [pilotText, setPilotText] = useState('1')
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [paste, setPaste] = useState('1, 2, 9')
  const [cohortName, setCohortName] = useState('Sample cohort')
  const [audience, setAudience] = useState('Sample audience')
  const [blueprint, setBlueprint] = useState<Blueprint>({
    name: '',
    assets: '',
    bodies: '',
    titles: '',
    cta: 'Learn more',
    linkUrl: 'https://example.com',
    urlTags: DEFAULT_URL_TAGS,
    startDate: '',
  })
  const [savedBlueprint, setSavedBlueprint] = useState<Blueprint | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [reviewedFor, setReviewedFor] = useState<string | null>(null)
  const [exclusions, setExclusions] = useState<Exclusion[]>([])
  const [reason, setReason] = useState('Franchise fence')
  const [runId, setRunId] = useState<string | null>(null)
  const [healthId, setHealthId] = useState<string | null>(null)
  const [range, setRange] = useState({ start: '2026-11-01', end: '2026-11-02' })
  const [loadedRange, setLoadedRange] = useState<string | null>(null)
  const [seed, setSeed] = useState<string | null>(null)
  const [reviewToken, setReviewToken] = useState<string | null>(null)
  const [assetGroup, setAssetGroup] = useState('Sample group')
  const [storeId, setStoreId] = useState('1')
  const [log, setLog] = useState('Local only. These functions do not call the live Keel server.')

  const page = PAGES.find((item) => item.path === path) ?? PAGES[0]
  const paced = useMemo(
    () => SAMPLE_ROWS.map((row) => withPace(row, { dayOfPeriod, daysInPeriod })),
    [dayOfPeriod, daysInPeriod],
  )
  const visible = sortRows(filterRows(paced, filter), sortKey, 'desc')
  const attention = paced.filter((row) => row.verdict !== 'OK')
  const blocks = paced.filter((row) => row.verdict === 'BLOCK')
  const spent = paced.reduce((sum, row) => sum + row.actual, 0)
  const planned = paced.reduce((sum, row) => sum + (row.expected ?? 0), 0)
  const remaining = paced.reduce((sum, row) => sum + row.remaining, 0)
  const budgeted = paced.reduce((sum, row) => sum + row.budget, 0)
  const channels = [...new Set(paced.map((row) => row.channel))].map((channel) => {
    const rows = paced.filter((row) => row.channel === channel)
    const actual = rows.reduce((sum, row) => sum + row.actual, 0)
    const budget = rows.reduce((sum, row) => sum + row.budget, 0)
    const expected = rows.reduce((sum, row) => sum + (row.expected ?? 0), 0)
    return {
      channel,
      actual,
      budget,
      pace: expected === 0 ? null : Math.round((actual / expected) * 100),
      stores: new Set(rows.map((row) => row.storeId)).size,
      attention: rows.filter((row) => row.verdict !== 'OK').length,
    }
  })
  const currentFingerprint = fingerprint('PMAX', selected)
  const pasteMatch = matchStorePaste(paste, DIRECTORY)

  function toggle(id: string) {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
    setSelected(next)
    if (reviewedFor && reviewedFor !== fingerprint('PMAX', next)) {
      setLog('the diff changed since you reviewed it — re-review the current selection before applying')
    }
  }

  return (
    <div className="keel">
      <aside className="keel-side">
        <div className="keel-brand">
          <div className="keel-mark">K</div>
          <div>
            <strong>Keel</strong>
            <span>Media Activation Platform</span>
          </div>
        </div>
        {NAV.map((section) => (
          <div key={section.group}>
            <p>{section.group.toUpperCase()}</p>
            {section.items.map((item) => (
              <button key={item.path} type="button" aria-current={item.path === page.path ? 'page' : undefined} onClick={() => setPath(item.path)}>
                {item.name}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <main className="keel-main">
        <div className="keel-top">
          <span className="keel-chip"><i>SK</i> Sample</span>
          <span className="keel-chip"><span className="keel-dot" /> Period 12 · day {dayOfPeriod}/{daysInPeriod}</span>
          <span className="keel-chip">{mode === 'OBSERVE' ? 'Observe-only' : mode === 'PILOT' ? 'Pilot' : 'Live'}</span>
        </div>
        <h2>{page.name}</h2>
        <p className="keel-job">{page.job}</p>
        <p className="keel-log" role="status">{log}</p>

        {page.path === '/' || page.path === '/channels' || page.path === '/stores' ? (
          <>
            {page.path === '/' ? (
              <>
                <div className="keel-banner">Sample data in the warehouse pacing shape. The recommended daily budget is required-daily-spend-to-land-on-plan. This view is read-only (Shadow).</div>
                <div className="keel-stats">
                  <article className="keel-card hot"><span>Needs attention</span><strong>{attention.length}</strong><small>store×channel rows</small></article>
                  <article className="keel-card"><span>Hard flags (BLOCK)</span><strong className="bad">{blocks.length}</strong><small>spend without matching budget</small></article>
                  <article className="keel-card"><span>Spend vs plan to date</span><strong className="good">{planned ? `${Math.round((spent / planned) * 100)}%` : '—'}</strong><small>${spent.toFixed(0)} spent vs ${planned.toFixed(0)} planned</small></article>
                  <article className="keel-card"><span>Budget remaining</span><strong>${remaining.toFixed(0)}</strong><small>of ${budgeted.toFixed(0)} planned</small></article>
                </div>
                <h3>Channel pacing</h3>
                <div className="keel-channels">
                  {channels.map((item) => (
                    <article className="keel-card" key={item.channel}>
                      <span className="tag">Shadow</span>
                      <span>{item.channel}</span>
                      <b>{item.pace == null ? '—' : `${item.pace}%`}</b> <em>of plan to-date</em>
                      <small>${item.actual.toFixed(0)} / ${item.budget.toFixed(0)}</small>
                      <small>{item.stores} stores · {item.attention} need attention</small>
                    </article>
                  ))}
                </div>
              </>
            ) : null}
            <div className="keel-controls">
              <label>
                Day
                <input type="number" min={1} max={daysInPeriod} value={dayOfPeriod} onChange={(event) => setDayOfPeriod(Number(event.target.value))} />
              </label>
              <label>
                Days in period
                <input type="number" min={1} value={daysInPeriod} onChange={(event) => setDaysInPeriod(Number(event.target.value))} />
              </label>
              <label>
                Sort
                <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                  {SORTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
            </div>
            <div className="keel-filters">
              {FILTERS.map((item) => (
                <button key={item} type="button" className="keel-btn" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
              ))}
            </div>
            <table className="keel-table">
              <thead>
                <tr>
                  <th>Store</th><th>Channel</th><th>Type</th><th>Budget</th><th>Actual</th><th>Pace</th><th>Required / day</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td>{row.storeName}</td>
                    <td>{row.channel}</td>
                    <td>{row.locationType}</td>
                    <td>{row.budget.toFixed(2)}</td>
                    <td>{row.actual.toFixed(2)}</td>
                    <td>{row.pacingRatio == null ? '—' : `${Math.round(row.pacingRatio * 100)}%`}</td>
                    <td>{row.requiredDaily ?? row.runRateDaily ?? '—'}</td>
                    <td className={row.verdict === 'BLOCK' ? 'keel-flag' : undefined}>{row.verdict === 'BLOCK' ? 'BLOCK' : row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}

        {page.path === '/actuation' ? (
          <div className="keel-panel keel-actions">
            <button type="button" className="keel-btn" onClick={() => {
              const result = refreshProposals()
              if (result.ok) setRunId(result.runId)
              setLog(resultText(result, `Refresh started. runId ${result.ok ? result.runId : ''}`))
            }}>Refresh proposals {runId ? `(${runId})` : ''}</button>
            {paced.map((row) => (
              <label key={row.id}>
                <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} />
                {row.storeId} {row.channel}
              </label>
            ))}
            <button type="button" className="keel-btn" onClick={() => {
              setReviewedFor(currentFingerprint)
              const result = applyBudgets({ channel: 'PMAX', proposalIds: selected, dryRun: true, currentFingerprint, reviewedFingerprint: currentFingerprint })
              setLog(resultText(result, result.ok ? result.log : ''))
            }}>Verify dry-run</button>
            <button type="button" className="keel-btn" onClick={() => {
              const result = applyBudgets({ channel: 'PMAX', proposalIds: selected, confirm: true, currentFingerprint, reviewedFingerprint: reviewedFor ?? undefined })
              setLog(resultText(result, result.ok ? result.log : ''))
            }}>Apply</button>
            <label>
              Reason
              <input value={reason} onChange={(event) => setReason(event.target.value)} />
            </label>
            <button type="button" className="keel-btn" onClick={() => {
              const result = addExclusion({ storeId, channel: 'PMAX', reason })
              if (result.ok) setExclusions((current) => [...current, result.exclusion])
              setLog(resultText(result, `Exclusion added for store ${storeId}.`))
            }}>Add exclusion</button>
            {exclusions.length > 0 ? <p className="keel-note">{exclusions.map((item) => `${item.storeId} ${item.channel}: ${item.reason}`).join(' · ')}</p> : null}
          </div>
        ) : null}

        {page.path === '/settings' ? (
          <div className="keel-panel keel-form">
            <label>
              Mode
              <select value={mode} onChange={(event) => {
                const next = event.target.value as Mode
                const result = changeMode({ mode: next, confirm: next !== 'OBSERVE' })
                if (result.ok) setMode(result.mode)
                setLog(resultText(result, `Mode is ${next}.`))
              }}>
                <option value="OBSERVE">Observe-only</option>
                <option value="PILOT">Pilot</option>
                <option value="LIVE">Live</option>
              </select>
            </label>
            <p className="keel-note">
              {mode === 'OBSERVE' ? 'Observe writes nothing.' : mode === 'PILOT' ? 'Pilot writes only the allowlist, up to 1,000 stores.' : 'Live writes every unit. Full Adplorer cutover.'}
            </p>
            <label>
              Pilot store ids
              <textarea value={pilotText} onChange={(event) => setPilotText(event.target.value)} />
            </label>
            <button type="button" className="keel-btn" onClick={() => {
              const result = updatePilot({ entries: pilotText.split(/[\s,]+/), channel: 'Meta', enabled: false, confirm: true })
              setLog(resultText(result, result.ok ? `Allowlist has ${result.entries.length} store${result.entries.length === 1 ? '' : 's'}.` : ''))
            }}>Save pilot allowlist</button>
          </div>
        ) : null}

        {page.path === '/cohorts' ? (
          <div className="keel-panel keel-form">
            <label>
              Name
              <input value={cohortName} onChange={(event) => setCohortName(event.target.value)} />
            </label>
            <label>
              Paste store ids
              <textarea value={paste} onChange={(event) => setPaste(event.target.value)} />
            </label>
            <p className="keel-note">
              Matched {pasteMatch.matched.map((item) => item.storeId).join(', ') || 'none'}.
              Unmatched {pasteMatch.unmatched.join(', ') || 'none'}.
              Duplicates {pasteMatch.duplicates.join(', ') || 'none'}.
            </p>
            <button type="button" className="keel-btn" onClick={() => {
              const result = createCohort({ name: cohortName, storeIds: pasteMatch.matched.map((item) => item.storeId), source: 'PASTE' })
              if (result.ok) setCohorts((current) => [...current, result.cohort])
              setLog(resultText(result, result.ok ? `Saved ${result.cohort.name}.` : ''))
            }}>Create cohort</button>
            <ul>
              {cohorts.map((cohort) => (
                <li key={cohort.id}>
                  {cohort.name} ({cohort.storeIds.join(', ')})
                  <button type="button" className="keel-btn" onClick={() => {
                    const result = deleteCohort(cohorts, cohort.id)
                    if (result.ok) setCohorts(result.cohorts)
                    setLog(resultText(result, `Deleted ${cohort.name}.`))
                  }}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {page.path === '/audiences' ? (
          <div className="keel-panel keel-actions">
            <label>
              Audience
              <input value={audience} onChange={(event) => setAudience(event.target.value)} />
            </label>
            <button type="button" className="keel-btn" onClick={() => {
              const result = audienceEdit({ method: 'POST', audience, storeIds: ['1'] })
              setLog(resultText(result, `Audience ${audience} saved for store 1.`))
            }}>Save edit</button>
            <button type="button" className="keel-btn" onClick={() => {
              const result = audienceEdit({ method: 'DELETE', audience, storeIds: ['1'] })
              setLog(resultText(result, `Audience ${audience} removed.`))
            }}>Remove edit</button>
          </div>
        ) : null}

        {page.path === '/creative' ? (
          <div className="keel-panel keel-form">
            <label>Name<input value={blueprint.name} onChange={(event) => setBlueprint({ ...blueprint, name: event.target.value })} /></label>
            <label>Assets<input value={blueprint.assets} onChange={(event) => setBlueprint({ ...blueprint, assets: event.target.value })} /></label>
            <label>Bodies<input value={blueprint.bodies} onChange={(event) => setBlueprint({ ...blueprint, bodies: event.target.value })} /></label>
            <label>Titles<input value={blueprint.titles} onChange={(event) => setBlueprint({ ...blueprint, titles: event.target.value })} /></label>
            <label>Link<input value={blueprint.linkUrl} onChange={(event) => setBlueprint({ ...blueprint, linkUrl: event.target.value })} /></label>
            <label>URL tags<input value={blueprint.urlTags} onChange={(event) => setBlueprint({ ...blueprint, urlTags: event.target.value })} /></label>
            <div className="keel-filters" aria-label="Placements">
              <button type="button" aria-pressed="true">9:16</button>
              <button type="button" aria-pressed="true">4:5</button>
              <button type="button" aria-pressed="true">1:1</button>
              <button type="button">Learn more</button>
            </div>
            <button type="button" className="keel-btn" onClick={() => {
              const result = saveBlueprint(blueprint)
              if (result.ok) setSavedBlueprint(result.blueprint)
              setLog(resultText(result, result.ok ? `Blueprint saved as ${result.blueprint.name}.` : ''))
            }}>Save blueprint</button>
            {savedBlueprint ? <p className="keel-note">Deploy status stays local. Tags: {savedBlueprint.urlTags}</p> : null}
          </div>
        ) : null}

        {page.path === '/assetgroups' ? (
          <div className="keel-panel keel-form">
            <label>Store<input value={storeId} onChange={(event) => setStoreId(event.target.value)} /></label>
            <label>Asset group<input value={assetGroup} onChange={(event) => setAssetGroup(event.target.value)} /></label>
            <button type="button" className="keel-btn" onClick={() => {
              const result = extractAssetGroup({ storeId, assetGroup })
              if (result.ok) setSeed(result.seed)
              setLog(resultText(result, result.ok ? `Seed ${result.seed}` : ''))
            }}>Extract</button>
            <button type="button" className="keel-btn" onClick={() => {
              const result = preflightAssetGroup(seed)
              if (result.ok) setReviewToken(result.reviewToken)
              setLog(resultText(result, 'Preflight froze this review.'))
            }}>Preflight</button>
            <button type="button" className="keel-btn" onClick={() => {
              const result = deployAssetGroup({ seed, reviewToken, confirm: true })
              setLog(resultText(result, result.ok ? result.log : ''))
            }}>Deploy</button>
          </div>
        ) : null}

        {page.path === '/analysis' ? (
          <div className="keel-panel keel-form">
            <label>Start<input type="date" value={range.start} onChange={(event) => setRange({ ...range, start: event.target.value })} /></label>
            <label>End<input type="date" value={range.end} onChange={(event) => setRange({ ...range, end: event.target.value })} /></label>
            <button type="button" className="keel-btn" onClick={() => {
              const result = analysisRange(range)
              if (result.ok) setLoadedRange(`${result.start} to ${result.end}`)
              setLog(resultText(result, result.ok ? `Loaded ${result.start} to ${result.end}.` : ''))
            }}>Load range</button>
            {loadedRange ? <p className="keel-note">Export would be a JSON download for {loadedRange}. Nothing left this browser.</p> : null}
            <button type="button" className="keel-btn" onClick={() => {
              const result = createCohort({ name: 'From reporting', storeIds: ['1', '3'], source: 'ANALYSIS' })
              if (result.ok) setCohorts((current) => [...current, result.cohort])
              setLog(resultText(result, 'Saved the selected stores as a cohort.'))
            }}>Save selection as cohort</button>
          </div>
        ) : null}

        {page.path === '/health' ? (
          <div className="keel-panel">
            <h3>Tool health</h3>
            <p className="keel-note">Checks BigQuery auth, source freshness, and the pacing-engine schema contract. Same job as npm run doctor, then npm run ingest.</p>
            <button type="button" className="keel-btn" onClick={() => {
              const result = healthCheck()
              if (result.ok) setHealthId(result.runId)
              setLog(resultText(result, result.ok ? `Warehouse check started. runId ${result.runId}` : ''))
            }}>Run warehouse check {healthId ? `(${healthId})` : ''}</button>
          </div>
        ) : null}

        {page.path === '/audit' ? (
          <div className="keel-panel">
            <h3>Audit log</h3>
            <p className="keel-note">The live download is GET /api/audit?format=jsonl, filtered by action, result, and actor. This login is refused without audit-read, so the local page keeps the log on screen.</p>
          </div>
        ) : null}

        {page.path === '/team' ? (
          <div className="keel-panel">
            <h3>Team</h3>
            <p className="keel-note">Membership reads and patches need settings-manage. This page does not call that route.</p>
          </div>
        ) : null}

        {page.path === '/pmax-review' || page.path === '/lost-is' || page.path === '/meta-frequency' || page.path === '/geo' || page.path === '/map' ? (
          <div className="keel-panel">
            <h3>{page.name}</h3>
            <p className="keel-note">{page.job} The live screen reads figures the server already prepared. Opening it here does not call that server.</p>
          </div>
        ) : null}
      </main>
    </div>
  )
}
