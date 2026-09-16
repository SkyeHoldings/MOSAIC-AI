import type { ClusterScore, ServiceScore } from '../data/growthDiagnostic'

function point(index: number, value: number) {
  const angle = ((index * 90 - 90) * Math.PI) / 180
  return [160 + Math.cos(angle) * value * 20, 156 + Math.sin(angle) * value * 20] as const
}

const LABEL_AT = [
  { x: 160, y: 22, anchor: 'middle' as const },
  { x: 314, y: 160, anchor: 'end' as const },
  { x: 160, y: 308, anchor: 'middle' as const },
  { x: 6, y: 160, anchor: 'start' as const },
]

export function GrowthClusterMap({ scores }: { scores: ClusterScore[] }) {
  const polygon = scores.map((item, index) => point(index, item.score).join(',')).join(' ')
  const label = scores
    .map((item) => `${item.name} ${item.score.toFixed(1)} out of 5`)
    .join(', ')

  return (
    <figure className="brief-map">
      <svg
        viewBox="-16 0 352 328"
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
        {scores.map((item, index) => (
          <text
            key={`${item.id}-label`}
            x={LABEL_AT[index].x}
            y={LABEL_AT[index].y}
            textAnchor={LABEL_AT[index].anchor}
            fill={item.color}
            fontSize="13"
            fontWeight="700"
            fontFamily="inherit"
          >
            {item.name}
          </text>
        ))}
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
