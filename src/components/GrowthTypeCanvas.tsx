import { useEffect, useState } from 'react'

type Cluster = {
  lines: string[]
  top: string
  left: string
}

type Scene = {
  clusters: Cluster[]
  from: string
  to: string
}

const SCENES: Scene[] = [
  {
    from: 'translate3d(0, 34%, 0)',
    to: 'translate3d(0, -28%, 0)',
    clusters: [{ lines: ['GROW', 'GROW', 'GROW', 'GROW'], top: '34%', left: '8%' }],
  },
  {
    from: 'translate3d(-18%, 8%, 0)',
    to: 'translate3d(16%, -10%, 0)',
    clusters: [
      { lines: ['SCALE', 'SCALE', 'SCALE'], top: '18%', left: '8%' },
      { lines: ['REACH', 'REACH', 'REACH'], top: '52%', left: '34%' },
    ],
  },
  {
    from: 'translate3d(-22%, 0, 0)',
    to: 'translate3d(18%, 0, 0)',
    clusters: [{ lines: ['MORE DEMAND', 'MORE DEMAND'], top: '38%', left: '6%' }],
  },
  {
    from: 'translate3d(0, -24%, 0)',
    to: 'translate3d(0, 22%, 0)',
    clusters: [{ lines: ['ABUNDANCE', 'ABUNDANCE', 'ABUNDANCE'], top: '28%', left: '7%' }],
  },
  {
    from: 'translate3d(14%, 18%, 0)',
    to: 'translate3d(-12%, -16%, 0)',
    clusters: [
      { lines: ['PIPELINE', 'PIPELINE', 'PIPELINE'], top: '16%', left: '8%' },
      { lines: ['REVENUE', 'REVENUE', 'REVENUE'], top: '54%', left: '30%' },
    ],
  },
  {
    from: 'translate3d(0, 26%, 0)',
    to: 'translate3d(8%, -22%, 0)',
    clusters: [{ lines: ['COMPOUND', 'COMPOUND'], top: '36%', left: '10%' }],
  },
  {
    from: 'translate3d(20%, 0, 0)',
    to: 'translate3d(-16%, 0, 0)',
    clusters: [{ lines: ['BRAND LIFT', 'BRAND LIFT'], top: '40%', left: '8%' }],
  },
  {
    from: 'translate3d(-8%, -20%, 0)',
    to: 'translate3d(10%, 24%, 0)',
    clusters: [
      { lines: ['FULL', 'FULL', 'FULL'], top: '18%', left: '10%' },
      { lines: ['FUNNEL', 'FUNNEL', 'FUNNEL'], top: '52%', left: '32%' },
    ],
  },
  {
    from: 'translate3d(0, 30%, 0)',
    to: 'translate3d(0, -26%, 0)',
    clusters: [{ lines: ['RETURN', 'RETURN', 'RETURN', 'RETURN'], top: '30%', left: '8%' }],
  },
  {
    from: 'translate3d(-20%, 6%, 0)',
    to: 'translate3d(18%, -8%, 0)',
    clusters: [{ lines: ['ALWAYS ON', 'ALWAYS ON'], top: '38%', left: '8%' }],
  },
  {
    from: 'translate3d(12%, -18%, 0)',
    to: 'translate3d(-10%, 20%, 0)',
    clusters: [
      { lines: ['EXPAND', 'EXPAND', 'EXPAND'], top: '16%', left: '8%' },
      { lines: ['AUDIENCE', 'AUDIENCE', 'AUDIENCE'], top: '52%', left: '26%' },
    ],
  },
  {
    from: 'translate3d(-16%, 0, 0)',
    to: 'translate3d(20%, 0, 0)',
    clusters: [{ lines: ['YIELD', 'YIELD', 'YIELD'], top: '36%', left: '12%' }],
  },
]

const TRAVEL_MS = 2800

export function GrowthTypeCanvas() {
  const [index, setIndex] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (reduced) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SCENES.length)
    }, TRAVEL_MS)

    return () => window.clearInterval(id)
  }, [reduced])

  const scene = SCENES[index]

  return (
    <div className="growth-type">
      <div
        className="growth-type__pass"
        key={reduced ? 'still' : index}
        style={{
          ['--from' as string]: scene.from,
          ['--to' as string]: scene.to,
          ['--travel' as string]: `${TRAVEL_MS}ms`,
        }}
      >
        {scene.clusters.map((cluster) => (
          <div
            className="growth-type__cluster"
            key={cluster.lines[0]}
            style={{ top: cluster.top, left: cluster.left }}
          >
            {cluster.lines.map((line, lineIndex) => (
              <p key={`${line}-${lineIndex}`}>{line}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
