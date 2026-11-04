import { useEffect, useMemo, useState } from 'react'
import { BOARD_CHANNELS, MAP_LAYERS, PMAX_RADIUS_MILES, channelSummary, cpaBand, cpaStops, overlapPairs, paceReason, project, type MapLayer } from '../keel/board'
import { PAGES, SAMPLE_ROWS, STORES } from '../keel/catalog'
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

const DIRECTORY = STORES.map((store) => ({ storeId: store.storeId, storeName: store.storeName }))
const COHORT_KEY = 'hellomosaic-keel-cohorts'
const CHANNEL_FILTERS: FilterName[] = ['All', 'Off-plan', 'Over-pacing', 'Under-pacing', 'No spend', 'Unfunded', 'Completed', 'Conv drop', 'Franchise']

function money(value: number, digits = 0) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: digits, minimumFractionDigits: digits })
}

function loadCohorts(): Cohort[] {
  try {
    const saved = localStorage.getItem(COHORT_KEY)
    return saved ? JSON.parse(saved) as Cohort[] : []
  } catch {
    return []
  }
}

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
  const [cohorts, setCohorts] = useState<Cohort[]>(loadCohorts)
  const [watchCohort, setWatchCohort] = useState<string | null>(null)
  const [boardChannel, setBoardChannel] = useState<(typeof BOARD_CHANNELS)[number]>('PMAX')
  const [boardFilter, setBoardFilter] = useState<FilterName>('All')
  const [activeStore, setActiveStore] = useState('1')
  const [mapLayer, setMapLayer] = useState<MapLayer>('PMAX CPA')
  const [ownership, setOwnership] = useState<'All' | 'Corporate' | 'Franchise'>('All')
  const [showWatchlist, setShowWatchlist] = useState(false)
  const [showRadii, setShowRadii] = useState(false)
  const [showOverlaps, setShowOverlaps] = useState(false)
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
  const watched = cohorts.find((cohort) => cohort.id === watchCohort) ?? null
  const boardRows = sortRows(
    filterRows(
      paced.filter((row) => row.channel === boardChannel && (watched == null || watched.storeIds.includes(row.storeId))),
      boardFilter,
    ),
    sortKey,
    'desc',
  )
  const board = channelSummary(boardRows)
  const storeList = [...STORES].sort((a, b) => a.guestDelta - b.guestDelta)
  const storeRows = paced.filter((row) => row.storeId === activeStore)
  const active = STORES.find((store) => store.storeId === activeStore) ?? STORES[0]
  const mapStores = STORES.filter((store) => ownership === 'All' || store.locationType === ownership)
  const watchIds = new Set(
    STORES.filter((store) => store.guestDelta <= -5 || paced.some((row) => row.storeId === store.storeId && row.verdict === 'BLOCK')).map((store) => store.storeId),
  )
  const visibleMapStores = showWatchlist ? mapStores.filter((store) => watchIds.has(store.storeId)) : mapStores
  const overlaps = overlapPairs(visibleMapStores.filter((store) => paced.some((row) => row.storeId === store.storeId && row.channel === 'PMAX')), PMAX_RADIUS_MILES)

  useEffect(() => {
    localStorage.setItem(COHORT_KEY, JSON.stringify(cohorts))
  }, [cohorts])

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

        {page.path === '/channels' ? (
          <>
            <p className="keel-job">Per-store pacing by channel · day {dayOfPeriod} of {daysInPeriod}. Adjust queues a row for Actuation.</p>
            <div className="keel-filters">
              {BOARD_CHANNELS.map((channel) => {
                const rows = paced.filter((row) => row.channel === channel)
                const summary = channelSummary(rows)
                return (
                  <button key={channel} type="button" aria-pressed={boardChannel === channel} onClick={() => setBoardChannel(channel)}>
                    {channel} {summary.stores} stores · {money(summary.actual)}/{money(summary.budget)} {summary.attention || ''}
                  </button>
                )
              })}
            </div>
            {watched ? <p className="keel-note">Watching {watched.name} · {watched.storeIds.length} stores. <button type="button" className="keel-btn" onClick={() => setWatchCohort(null)}>Clear</button></p> : null}
            <div className="keel-stats">
              <article className="keel-card"><span>Stores</span><strong>{board.stores}</strong></article>
              <article className="keel-card"><span>Budget (period)</span><strong>{money(board.budget)}</strong></article>
              <article className="keel-card"><span>Spent to date</span><strong>{money(board.actual)}</strong></article>
              <article className="keel-card"><span>Pace vs plan</span><strong>{board.pace == null ? '—' : `${Math.round(board.pace * 100)}%`}</strong></article>
              <article className="keel-card"><span>CPA</span><strong>{board.cpa == null ? '—' : money(board.cpa, 2)}</strong></article>
            </div>
            <div className="keel-filters">
              {CHANNEL_FILTERS.map((item) => (
                <button key={item} type="button" aria-pressed={boardFilter === item} onClick={() => setBoardFilter(item)}>{item}</button>
              ))}
            </div>
            <table className="keel-table">
              <thead>
                <tr>
                  <th>Store</th><th>Cluster</th><th>Type</th><th>Budget</th><th>Spent</th><th>Pace</th><th>CPA</th><th>Conv</th><th>Status</th><th>Rec $/day</th><th></th>
                </tr>
              </thead>
              <tbody>
                {boardRows.map((row) => (
                  <tr key={row.id}>
                    <td>#{row.storeId} {row.storeName}</td>
                    <td>{row.clusterName}</td>
                    <td>{row.locationType === 'Franchise' ? 'Franch' : 'Corp'}</td>
                    <td>{money(row.budget)}</td>
                    <td>{money(row.actual)}</td>
                    <td>{row.pacingRatio == null ? '—' : `${Math.round(row.pacingRatio * 100)}%`}</td>
                    <td>{row.cpa == null ? '—' : money(row.cpa, 2)}</td>
                    <td>{row.conversions}</td>
                    <td className={row.verdict === 'BLOCK' ? 'keel-flag' : row.verdict === 'WARN' ? 'keel-warn' : undefined}>{row.verdict}<small>{paceReason(row)}</small></td>
                    <td>{row.requiredDaily == null ? '—' : money(row.requiredDaily, 2)}</td>
                    <td><button type="button" className="keel-btn" onClick={() => {
                      if (!selected.includes(row.id)) toggle(row.id)
                      setLog(`Queued #${row.storeId} ${row.channel} at ${row.requiredDaily == null ? 'the run rate' : money(row.requiredDaily, 2)} / day. Open Actuation to review it.`)
                    }}>Adjust</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}

        {page.path === '/stores' ? (
          <div className="keel-split">
            <div className="keel-panel">
              <h3>Sort by guest trend</h3>
              {storeList.map((store) => (
                <button key={store.storeId} type="button" className="keel-store" aria-pressed={store.storeId === activeStore} onClick={() => setActiveStore(store.storeId)}>
                  <strong>#{store.storeId} {store.storeName}</strong>
                  <span>{store.locationType === 'Franchise' ? 'Franch' : 'Corp'} · {store.clusterName}</span>
                  <em className={store.guestDelta < 0 ? 'keel-flag' : 'keel-ok'}>{store.guestDelta < 0 ? '▼' : '▲'} {Math.abs(store.guestDelta)}%</em>
                </button>
              ))}
            </div>
            <div>
              <h3>#{active.storeId} {active.storeName}</h3>
              <p className="keel-note">{active.locationType === 'Franchise' ? 'Franch' : 'Corp'} · {active.clusterName} · guest {active.guestDelta < 0 ? '▼' : '▲'} {Math.abs(active.guestDelta)}%</p>
              <table className="keel-table">
                <thead>
                  <tr><th>Channel</th><th>Budget</th><th>Spent</th><th>Pace</th><th>CPA</th><th>Status</th><th>Rec $/day</th></tr>
                </thead>
                <tbody>
                  {storeRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.channel}</td>
                      <td>{money(row.budget)}</td>
                      <td>{money(row.actual)}</td>
                      <td>{row.pacingRatio == null ? '—' : `${Math.round(row.pacingRatio * 100)}%`}</td>
                      <td>{row.cpa == null ? '—' : money(row.cpa, 2)}</td>
                      <td className={row.verdict === 'BLOCK' ? 'keel-flag' : row.verdict === 'WARN' ? 'keel-warn' : undefined}>{row.verdict}<small>{paceReason(row)}</small></td>
                      <td>{row.requiredDaily == null ? '—' : money(row.requiredDaily, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {page.path === '/map' ? (
          <div className="keel-panel">
            <div className="keel-filters">
              {MAP_LAYERS.map((layer) => (
                <button key={layer} type="button" aria-pressed={mapLayer === layer} onClick={() => setMapLayer(layer)}>{layer}</button>
              ))}
            </div>
            <div className="keel-filters">
              {(['All', 'Corporate', 'Franchise'] as const).map((item) => (
                <button key={item} type="button" aria-pressed={ownership === item} onClick={() => setOwnership(item)}>{item}</button>
              ))}
              <button type="button" aria-pressed={showWatchlist} onClick={() => setShowWatchlist((value) => !value)}>Watchlist ({watchIds.size})</button>
              <button type="button" aria-pressed={showRadii} onClick={() => setShowRadii((value) => !value)}>PMAX radii</button>
              <button type="button" aria-pressed={showOverlaps} onClick={() => setShowOverlaps((value) => !value)}>Overlaps ({overlaps.length})</button>
            </div>
            <svg className="keel-map" viewBox="0 0 800 500" role="img" aria-label="Sample fleet">
              <rect width="800" height="500" rx="16" fill="#efe8dc" />
              {showRadii ? visibleMapStores.filter((store) => paced.some((row) => row.storeId === store.storeId && row.channel === 'PMAX')).map((store) => {
                const point = project(store.lat, store.lng)
                return <circle key={`r-${store.storeId}`} cx={point.x} cy={point.y} r="46" fill="rgba(255, 51, 0, 0.12)" stroke="#ff3300" />
              }) : null}
              {showOverlaps ? overlaps.map(([left, right]) => {
                const a = project(left.lat, left.lng)
                const b = project(right.lat, right.lng)
                return <line key={`${left.storeId}-${right.storeId}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#c0392b" strokeWidth="2" />
              }) : null}
              {visibleMapStores.map((store) => {
                const point = project(store.lat, store.lng)
                const channel = mapLayer.endsWith('CPA') ? mapLayer.replace(' CPA', '') : null
                const row = channel ? paced.find((item) => item.storeId === store.storeId && item.channel === channel) : null
                let color = '#262626'
                if (channel) color = cpaBand(row?.cpa ?? null).color
                else if (mapLayer === 'Guest Δ %') color = store.guestDelta < 0 ? '#c0392b' : '#1f7a4d'
                else if (mapLayer === 'Ownership') color = store.locationType === 'Franchise' ? '#e67e22' : '#1d4e89'
                else if (mapLayer === 'Off-plan') color = paced.some((item) => item.storeId === store.storeId && item.verdict !== 'OK') ? '#c0392b' : '#1f7a4d'
                else if (mapLayer === 'Spend') color = '#1d4e89'
                return (
                  <g key={store.storeId}>
                    <circle cx={point.x} cy={point.y} r={mapLayer === 'Spend' ? 8 + Math.min(18, paced.filter((item) => item.storeId === store.storeId).reduce((sum, item) => sum + item.actual, 0) / 20) : 9} fill={color} />
                    <text x={point.x + 12} y={point.y + 4} fontSize="13" fill="#292929">#{store.storeId} {store.storeName}</text>
                  </g>
                )
              })}
            </svg>
            <ul className="keel-legend">
              {mapLayer.endsWith('CPA') ? cpaStops().map((stop) => <li key={stop.label}><i style={{ background: stop.color }} />{stop.label}</li>) : null}
              <li><i style={{ background: '#b7b1a8' }} />no data</li>
              <li>{visibleMapStores.length} stores shown · PMAX radius {PMAX_RADIUS_MILES} mi</li>
            </ul>
          </div>
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
            <label>
              Upload .csv/.txt
              <input type="file" accept=".csv,.txt,text/plain" onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setPaste(await file.text())
                setLog(`Loaded ${file.name}.`)
              }} />
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
            }}>Save cohort ({pasteMatch.matched.length})</button>
            <p className="keel-note">Static snapshot · {pasteMatch.matched.length} stores matched from {DIRECTORY.length} available.</p>
            <ul>
              {cohorts.map((cohort) => (
                <li key={cohort.id}>
                  {cohort.name} · {cohort.source} · {cohort.storeIds.length} stores
                  <button type="button" className="keel-btn" onClick={() => {
                    setWatchCohort(cohort.id)
                    setPath('/channels')
                    setLog(`Monitoring ${cohort.name} on the channel board.`)
                  }}>Monitor</button>
                  <button type="button" className="keel-btn" onClick={() => {
                    const ids = paced.filter((row) => cohort.storeIds.includes(row.storeId)).map((row) => row.id)
                    setSelected(ids)
                    setReviewedFor(null)
                    setPath('/actuation')
                    setLog(`Queued ${ids.length} rows from ${cohort.name}. Review them before apply.`)
                  }}>Deploy</button>
                  <button type="button" className="keel-btn" onClick={() => {
                    const result = deleteCohort(cohorts, cohort.id)
                    if (result.ok) setCohorts(result.cohorts)
                    if (watchCohort === cohort.id) setWatchCohort(null)
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

        {page.path === '/pmax-review' || page.path === '/lost-is' || page.path === '/meta-frequency' || page.path === '/geo' ? (
          <div className="keel-panel">
            <h3>{page.name}</h3>
            <p className="keel-note">{page.job} The live screen reads figures the server already prepared. Opening it here does not call that server.</p>
          </div>
        ) : null}
      </main>
    </div>
  )
}
