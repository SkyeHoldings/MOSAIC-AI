import type { ClusterScore, ServiceScore } from '../data/growthDiagnostic'

function point(index: number, value: number) {
  const angle = ((index * 90 - 90) * Math.PI) / 180
  return [160 + Math.cos(angle) * value * 20, 156 + Math.sin(angle) * value * 20] as const
}

const LABEL_SLOT: Record<ClusterScore['id'], 'top' | 'right' | 'bottom' | 'left'> = {
  craft: 'top',
  reach: 'right',
  proof: 'bottom',
  conversion: 'left',
}

export function GrowthClusterMap({ scores }: { scores: ClusterScore[] }) {
  const polygon = scores.map((item, index) => point(index, item.score).join(',')).join(' ')
  const label = scores
    .map((item) => `${item.name} ${item.score.toFixed(1)} out of 5`)
    .join(', ')

  return (
    <figure className="brief-map">
      <div className="brief-map-plot">
        {scores.map((item) => (
          <span
            key={item.id}
            className={`brief-map-label is-${LABEL_SLOT[item.id]}`}
            style={{ color: item.color }}
          >
            {item.name}
          </span>
        ))}
        <svg
          viewBox="48 44 224 224"
          role="img"
          aria-label={`How your leaks sit together: ${label}`}
        >
          {[5, 4, 3, 2, 1].map((ring) => (
            <polygon
              key={ring}
              points={scores.map((_, index) => point(index, ring).join(',')).join(' ')}
              fill={ring === 5 ? '#f2f6fc' : 'none'}
              stroke="#c9d7e8"
            />
          ))}
          {scores.map((item, index) => {
            const end = point(index, 5)
            return (
              <line
                key={item.id}
                x1="160"
                y1="156"
                x2={end[0]}
                y2={end[1]}
                stroke="#c9d7e8"
              />
            )
          })}
          <polygon
            points={polygon}
            fill="#2765bc"
            fillOpacity="0.18"
            stroke="#2765bc"
            strokeWidth="3"
          />
          {scores.map((item, index) => {
            const [cx, cy] = point(index, item.score)
            return (
              <circle
                key={item.id}
                cx={cx}
                cy={cy}
                r="5"
                fill={item.color}
                stroke="white"
                strokeWidth="2"
              />
            )
          })}
          {[1, 3, 5].map((tick) => (
            <text
              key={tick}
              x="166"
              y={156 - tick * 20 + 4}
              fontSize="10"
              fill="#53687c"
              fontFamily="inherit"
            >
              {tick}
            </text>
          ))}
        </svg>
      </div>
      <figcaption>
        How your leaks sit together
        <br />
        <span>Craft, Reach, Proof, and Conversion — each on the same 1–5 scale.</span>
      </figcaption>
    </figure>
  )
}

export function GrowthScoreBars({ scores }: { scores: ServiceScore[] }) {
  return (
    <div className="brief-score-bars">
      {scores.map((item) => (
        <div key={item.id} className="brief-score-bar">
          <div className="brief-score-bar__head">
            <span>{item.name}</span>
            <strong>
              {item.score.toFixed(1)} / 5
            </strong>
          </div>
          <div className="bar-track" aria-hidden="true">
            <span style={{ width: `${item.percent}%`, background: item.bandColor }} />
          </div>
        </div>
      ))}
    </div>
  )
}
