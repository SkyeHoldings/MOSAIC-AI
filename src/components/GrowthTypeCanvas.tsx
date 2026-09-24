import { useEffect, useState } from 'react'

type Cluster = {
  lines: string[]
  top: string
  left: string
  dx: string
  dy: string
}

type Scene = {
  clusters: Cluster[]
}

const SCENES: Scene[] = [
  {
    clusters: [
      { lines: ['GROW', 'GROW', 'GROW', 'GROW'], top: '26%', left: '8%', dx: '0px', dy: '28px' },
    ],
  },
  {
    clusters: [
      { lines: ['SCALE', 'SCALE', 'SCALE'], top: '14%', left: '8%', dx: '0px', dy: '-32px' },
      { lines: ['REACH', 'REACH', 'REACH'], top: '54%', left: '38%', dx: '36px', dy: '0px' },
    ],
  },
  {
    clusters: [
      { lines: ['MORE DEMAND', 'MORE DEMAND'], top: '36%', left: '6%', dx: '-40px', dy: '0px' },
    ],
  },
  {
    clusters: [
      { lines: ['ABUNDANCE', 'ABUNDANCE', 'ABUNDANCE'], top: '30%', left: '7%', dx: '0px', dy: '30px' },
    ],
  },
  {
    clusters: [
      { lines: ['PIPELINE', 'PIPELINE', 'PIPELINE'], top: '12%', left: '8%', dx: '-28px', dy: '-16px' },
      { lines: ['REVENUE', 'REVENUE', 'REVENUE'], top: '56%', left: '34%', dx: '32px', dy: '18px' },
    ],
  },
  {
    clusters: [
      { lines: ['COMPOUND', 'COMPOUND'], top: '34%', left: '10%', dx: '0px', dy: '-26px' },
    ],
  },
  {
    clusters: [
      { lines: ['BRAND LIFT', 'BRAND LIFT'], top: '38%', left: '8%', dx: '34px', dy: '0px' },
    ],
  },
  {
    clusters: [
      { lines: ['FULL', 'FULL', 'FULL'], top: '16%', left: '10%', dx: '0px', dy: '-24px' },
      { lines: ['FUNNEL', 'FUNNEL', 'FUNNEL'], top: '54%', left: '36%', dx: '0px', dy: '24px' },
    ],
  },
  {
    clusters: [
      { lines: ['RETURN', 'RETURN', 'RETURN', 'RETURN'], top: '22%', left: '8%', dx: '-30px', dy: '0px' },
    ],
  },
  {
    clusters: [
      { lines: ['ALWAYS ON', 'ALWAYS ON'], top: '36%', left: '8%', dx: '28px', dy: '-12px' },
    ],
  },
  {
    clusters: [
      { lines: ['EXPAND', 'EXPAND', 'EXPAND'], top: '14%', left: '8%', dx: '0px', dy: '-28px' },
      { lines: ['AUDIENCE', 'AUDIENCE', 'AUDIENCE'], top: '54%', left: '28%', dx: '30px', dy: '16px' },
    ],
  },
  {
    clusters: [
      { lines: ['YIELD', 'YIELD', 'YIELD'], top: '32%', left: '12%', dx: '0px', dy: '26px' },
    ],
  },
]

export function GrowthTypeCanvas() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SCENES.length)
    }, 880)

    return () => window.clearInterval(id)
  }, [])

  const scene = SCENES[index]

  return (
    <div className="growth-type">
      {scene.clusters.map((cluster, clusterIndex) => (
        <div
          className="growth-type__cluster"
          key={`${index}-${clusterIndex}`}
          style={{
            top: cluster.top,
            left: cluster.left,
            ['--dx' as string]: cluster.dx,
            ['--dy' as string]: cluster.dy,
          }}
        >
          {cluster.lines.map((line, lineIndex) => (
            <p key={`${line}-${lineIndex}`}>{line}</p>
          ))}
        </div>
      ))}
    </div>
  )
}
