/** Print-safe SVG of the site hero’s digital horizon — no canvas, crisp at letter size. */
export function OneSheetHorizon() {
  const vanishX = 420
  const horizon = 310
  const width = 800
  const height = 620

  const floorHorizontals = Array.from({ length: 18 }, (_, i) => {
    const u = (i + 1) / 18
    const y = horizon + (height - horizon) * u ** 1.65
    const opacity = 0.08 + 0.32 * (1 - u)
    return { y, opacity }
  })

  const floorVerticals = Array.from({ length: 29 }, (_, i) => {
    const n = i - 14
    const x0 = vanishX + n * width * 0.055
    const opacity = 0.05 + 0.22 * (1 - Math.abs(n) / 14)
    return { x0, opacity }
  })

  const streaks = [
    [48, 0.92, 2.2],
    [72, 0.78, 1.1],
    [98, 0.88, 1.8],
    [125, 0.7, 0.9],
    [152, 0.95, 2.6],
    [178, 0.82, 1.3],
    [205, 0.9, 1.6],
    [232, 0.68, 0.8],
    [258, 0.86, 1.4],
    [285, 0.74, 1.0],
    [312, 0.93, 2.0],
    [338, 0.8, 1.2],
    [365, 0.97, 3.2],
    [392, 0.88, 1.7],
    [418, 0.99, 4.0],
    [445, 0.9, 2.1],
    [472, 0.84, 1.3],
    [498, 0.94, 2.4],
    [525, 0.76, 1.0],
    [552, 0.89, 1.8],
    [578, 0.72, 0.9],
    [605, 0.91, 2.0],
    [632, 0.8, 1.2],
    [658, 0.87, 1.5],
    [685, 0.75, 1.0],
    [712, 0.93, 2.3],
    [738, 0.7, 0.85],
    [762, 0.85, 1.4],
  ] as const

  const nodes = Array.from({ length: 36 }, (_, i) => {
    const x = width * (0.08 + 0.84 * ((i * 0.137) % 1))
    const y = horizon + 8 + (i % 5) * 10
    const r = 1.2 + (i % 4) * 0.55
    return { x, y, r, opacity: 0.45 + (i % 5) * 0.1 }
  })

  const tiles = [
    [vanishX - 90, horizon + 55, 70],
    [vanishX + 40, horizon + 95, 95],
    [vanishX - 30, horizon + 145, 120],
    [vanishX + 110, horizon + 185, 140],
    [vanishX - 140, horizon + 220, 160],
  ] as const

  return (
    <svg
      className="os__horizon"
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="os-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05070a" />
          <stop offset="70%" stopColor="#0a0d12" />
          <stop offset="100%" stopColor="#12161c" />
        </linearGradient>
        <radialGradient id="os-bloom" cx="52.5%" cy="50%" r="18%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="os-vignette" cx="50%" cy="42%" r="78%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id="os-streak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#os-sky)" />
      <rect x="0" y={horizon} width={width} height={height - horizon} fill="#070b10" />

      {floorHorizontals.map(({ y, opacity }) => (
        <line
          key={`h-${y}`}
          x1="0"
          y1={y}
          x2={width}
          y2={y}
          stroke={`rgba(220,220,220,${opacity})`}
          strokeWidth="1"
        />
      ))}

      {floorVerticals.map(({ x0, opacity }, i) => (
        <line
          key={`v-${i}`}
          x1={vanishX}
          y1={horizon}
          x2={x0}
          y2={height}
          stroke={`rgba(200,200,200,${opacity})`}
          strokeWidth="1"
        />
      ))}

      {tiles.map(([cx, y, span], i) => (
        <rect
          key={`t-${i}`}
          x={cx - span}
          y={y - span * 0.18}
          width={span * 2}
          height={span * 0.36}
          fill={`rgba(245,245,245,${0.12 + i * 0.07})`}
        />
      ))}

      {streaks.map(([x, h, w], i) => {
        const top = horizon - horizon * h
        return (
          <g key={`s-${i}`}>
            {w >= 2 ? (
              <line
                x1={x}
                y1={top + (horizon - top) * 0.1}
                x2={x}
                y2={horizon}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={w + 5}
                strokeLinecap="round"
              />
            ) : null}
            <line
              x1={x}
              y1={top}
              x2={x}
              y2={horizon}
              stroke="url(#os-streak)"
              strokeWidth={Math.max(0.8, w)}
              strokeLinecap="round"
            />
          </g>
        )
      })}

      {nodes.map((n, i) => (
        <circle
          key={`n-${i}`}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={`rgba(255,255,255,${n.opacity})`}
        />
      ))}

      <ellipse
        cx={vanishX}
        cy={horizon}
        rx={width * 0.14}
        ry={height * 0.12}
        fill="url(#os-bloom)"
      />

      <rect width={width} height={height} fill="url(#os-vignette)" />
    </svg>
  )
}
