import { useMemo, useState } from 'react'
import { APIS, MODES, PAGES, SAMPLE_ROWS } from '../keel/catalog'
import { paceRow, writeAllowed } from '../keel/pacing'
import './Keel.css'

const ALLOWLIST = [{ storeId: '1', channel: 'Meta' }]

export function Keel() {
  const [path, setPath] = useState<string>(PAGES[0].path)
  const [dayOfPeriod, setDayOfPeriod] = useState(1)
  const [daysInPeriod, setDaysInPeriod] = useState(28)
  const [mode, setMode] = useState<(typeof MODES)[number]['id']>('observe')
  const page = PAGES.find((item) => item.path === path) ?? PAGES[0]

  const rows = useMemo(
    () =>
      SAMPLE_ROWS.map((row) => ({
        ...row,
        paced: paceRow({ ...row, dayOfPeriod, daysInPeriod }),
      })),
    [dayOfPeriod, daysInPeriod],
  )

  const sampleWrite = writeAllowed({
    mode,
    storeId: '1',
    channel: 'Meta',
    allowlist: ALLOWLIST,
  })

  let group = ''

  return (
    <div className="keel">
      <nav className="keel-nav" aria-label="Keel sections">
        <h1>Keel</h1>
        <p>Bones on hellomosaic.ai</p>
        {PAGES.map((item) => {
          const showGroup = item.group !== group
          group = item.group
          return (
            <div key={item.path}>
              {showGroup ? <div className="keel-group">{item.group}</div> : null}
              <button
                type="button"
                aria-current={item.path === page.path ? 'page' : undefined}
                onClick={() => setPath(item.path)}
              >
                {item.name}
              </button>
            </div>
          )
        })}
      </nav>
      <main className="keel-main">
        <h2>{page.name}</h2>
        <p className="keel-job">{page.job}</p>

        {page.path === '/' ? (
          <>
            <p className="keel-note">
              Sample stores. Change the day and the pace identities recalculate.
            </p>
            <div className="keel-controls">
              <label>
                Day of period
                <input
                  type="number"
                  min={1}
                  max={daysInPeriod}
                  value={dayOfPeriod}
                  onChange={(event) => setDayOfPeriod(Number(event.target.value))}
                />
              </label>
              <label>
                Days in period
                <input
                  type="number"
                  min={1}
                  value={daysInPeriod}
                  onChange={(event) => setDaysInPeriod(Number(event.target.value))}
                />
              </label>
            </div>
            <table className="keel-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Channel</th>
                  <th>Budget</th>
                  <th>Actual</th>
                  <th>Expected</th>
                  <th>Pace</th>
                  <th>Required / day</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.storeId}-${row.channel}`}>
                    <td>{row.storeName}</td>
                    <td>{row.channel}</td>
                    <td>{row.budget.toFixed(2)}</td>
                    <td>{row.actual.toFixed(2)}</td>
                    <td>{row.paced.expected ?? '—'}</td>
                    <td>
                      {row.paced.pacingRatio == null
                        ? '—'
                        : `${Math.round(row.paced.pacingRatio * 100)}%`}
                    </td>
                    <td>{row.paced.requiredDaily ?? '—'}</td>
                    <td className={row.paced.block ? 'keel-flag' : undefined}>
                      {row.paced.block ? 'BLOCK' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}

        {page.path === '/settings' ? (
          <>
            <label className="keel-mode">
              Mode
              <select
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value as (typeof MODES)[number]['id'])
                }
              >
                {MODES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.writes}
                  </option>
                ))}
              </select>
            </label>
            <p className="keel-note">
              Sample store 1 / Meta would {sampleWrite ? 'be writable' : 'stay read-only'} in {mode}.
            </p>
            <table className="keel-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Kind</th>
                  <th>Role</th>
                  <th>What we saw</th>
                </tr>
              </thead>
              <tbody>
                {APIS.map((api) => (
                  <tr key={api.path}>
                    <td>{api.path}</td>
                    <td>{api.kind}</td>
                    <td>{api.role}</td>
                    <td>{api.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
      </main>
    </div>
  )
}
