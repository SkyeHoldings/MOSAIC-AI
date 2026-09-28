import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  r: number
  b: number
  drift: number
  phase: number
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function climbAt(nx: number, t: number) {
  const rise = 0.05 + 0.72 * nx + 0.28 * nx * nx
  const fade = 1 - nx * 0.85
  const wave =
    Math.sin(nx * 8 - t * 1.35) * 0.022 * fade +
    Math.sin(nx * 18 - t * 2.2) * 0.008 * fade
  return rise + wave
}

/** Rising trend in the same black, white, and grid language as the hero landscape. */
export function TrendlineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const rand = seededRandom(42)
    const particles: Particle[] = Array.from({ length: 110 }, () => ({
      x: 0.05 + rand() * 0.9,
      y: 0.04 + rand() * 0.55,
      r: 0.6 + rand() * 1.8,
      b: 0.35 + rand() * 0.6,
      drift: 0.01 + rand() * 0.03,
      phase: rand() * Math.PI * 2,
    }))
    const tiles = Array.from({ length: 36 }, (_, i) => ({
      lane: (i * 0.173) % 1,
      phase: rand(),
      w: 0.35 + rand() * 0.8,
    }))

    let raf = 0
    let start = performance.now()
    let width = 0
    let height = 0
    let dpr = 1

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    function resize() {
      const parent = canvas!.parentElement
      if (!parent) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent.clientWidth
      height = parent.clientHeight
      canvas!.width = Math.max(1, Math.floor(width * dpr))
      canvas!.height = Math.max(1, Math.floor(height * dpr))
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function series(t: number) {
      const count = 80
      const points: { x: number; y: number; h: number }[] = []
      for (let i = 0; i <= count; i++) {
        const nx = i / count
        const h = climbAt(nx, t)
        const x = nx * width * 0.94 + width * 0.03
        points.push({ x, y: horizonSafe(h), h })
      }
      return points
    }

    function horizonSafe(h: number) {
      const top = height * 0.06
      const base = height * 0.56
      return base - h * (base - top)
    }

    function strokeLine(points: { x: number; y: number }[], color: string, widthPx: number) {
      ctx!.strokeStyle = color
      ctx!.lineWidth = widthPx
      ctx!.lineJoin = 'round'
      ctx!.lineCap = 'round'
      ctx!.beginPath()
      points.forEach((p, i) => {
        if (i === 0) ctx!.moveTo(p.x, p.y)
        else ctx!.lineTo(p.x, p.y)
      })
      ctx!.stroke()
    }

    function draw(now: number) {
      const t = (now - start) / 1000
      const horizon = height * 0.58
      const vanishX = width * 0.52

      ctx!.fillStyle = '#05070a'
      ctx!.fillRect(0, 0, width, height)

      const sky = ctx!.createLinearGradient(0, 0, 0, horizon)
      sky.addColorStop(0, 'rgba(8, 8, 8, 0)')
      sky.addColorStop(1, 'rgba(40, 40, 40, 0.35)')
      ctx!.fillStyle = sky
      ctx!.fillRect(0, 0, width, horizon)

      ctx!.fillStyle = '#070b10'
      ctx!.fillRect(0, horizon, width, height - horizon)

      ctx!.lineWidth = 1
      for (let i = 1; i <= 26; i++) {
        const u = i / 26
        const y = horizon + (height - horizon) * u ** 1.65
        const a = 0.08 + 0.28 * (1 - u)
        ctx!.strokeStyle = `rgba(220, 220, 220, ${a})`
        ctx!.beginPath()
        ctx!.moveTo(0, y)
        ctx!.lineTo(width, y)
        ctx!.stroke()
      }

      for (let i = -22; i <= 22; i++) {
        const x0 = vanishX + i * width * 0.048
        const a = 0.06 + 0.2 * (1 - Math.abs(i) / 22)
        ctx!.strokeStyle = `rgba(200, 200, 200, ${a})`
        ctx!.beginPath()
        ctx!.moveTo(vanishX, horizon)
        ctx!.lineTo(x0, height)
        ctx!.stroke()
      }

      for (const tile of tiles) {
        const depth = (tile.phase + t * 0.08) % 1
        const y = horizon + (height - horizon) * depth ** 1.45
        const span = (18 + depth * 90) * tile.w
        const cx =
          vanishX +
          Math.sin(tile.lane * Math.PI * 2 + t * 0.35) * width * 0.3 * depth
        const glow = 0.12 + 0.45 * depth
        ctx!.fillStyle = `rgba(245, 245, 245, ${glow})`
        ctx!.fillRect(cx - span, y - span * 0.2, span * 2, span * 0.4)
      }

      for (let i = 0; i < 48; i++) {
        const x = width * (0.06 + 0.88 * ((i * 0.137) % 1))
        const y = horizon + 6 + (i % 6) * 9
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.1 + i)
        const r = 1.2 + pulse * 2
        ctx!.fillStyle = `rgba(255, 255, 255, ${0.35 + 0.55 * pulse})`
        ctx!.beginPath()
        ctx!.arc(x, y, r, 0, Math.PI * 2)
        ctx!.fill()
      }

      const line = series(t)
      const head = line[line.length - 1]
      const travel = line[Math.floor(((t * 0.18) % 1) * (line.length - 1))]
      const ghost = line.map((p) => ({
        x: p.x,
        y: horizon - (horizon - p.y) * 0.62,
      }))

      ctx!.beginPath()
      line.forEach((p, i) => {
        if (i === 0) ctx!.moveTo(p.x, p.y)
        else ctx!.lineTo(p.x, p.y)
      })
      ctx!.lineTo(head.x, horizon)
      ctx!.lineTo(line[0].x, horizon)
      ctx!.closePath()
      const fill = ctx!.createLinearGradient(0, head.y, 0, horizon)
      fill.addColorStop(0, 'rgba(255, 255, 255, 0.16)')
      fill.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx!.fillStyle = fill
      ctx!.fill()

      ctx!.lineCap = 'round'
      for (let i = 0; i < line.length; i += 2) {
        const p = line[i]
        const pulse = 0.62 + 0.38 * Math.sin(t * 2.2 + i * 0.35)
        ctx!.strokeStyle = `rgba(255, 255, 255, ${0.08 + 0.1 * p.h * pulse})`
        ctx!.lineWidth = 1.4
        ctx!.beginPath()
        ctx!.moveTo(p.x, p.y)
        ctx!.lineTo(p.x, horizon)
        ctx!.stroke()
      }

      strokeLine(ghost, 'rgba(255, 255, 255, 0.35)', 1.2)
      strokeLine(line, 'rgba(255, 255, 255, 0.2)', 10)
      strokeLine(line, 'rgba(255, 255, 255, 0.96)', 2.4)

      for (let i = 0; i < line.length; i += 8) {
        const p = line[i]
        const pulse = 0.55 + 0.45 * Math.sin(t * 2.2 + i)
        ctx!.fillStyle = `rgba(255, 255, 255, ${0.4 + 0.45 * pulse})`
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, 1.5 + pulse * 0.8, 0, Math.PI * 2)
        ctx!.fill()
      }

      const bloom = ctx!.createRadialGradient(head.x, head.y, 2, head.x, head.y, width * 0.18)
      bloom.addColorStop(0, 'rgba(255, 255, 255, 0.7)')
      bloom.addColorStop(0.28, 'rgba(255, 255, 255, 0.16)')
      bloom.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx!.fillStyle = bloom
      ctx!.beginPath()
      ctx!.arc(head.x, head.y, width * 0.18, 0, Math.PI * 2)
      ctx!.fill()

      const pulse = 0.65 + 0.35 * Math.sin(t * 2.4)
      ctx!.fillStyle = `rgba(255, 255, 255, ${0.9})`
      ctx!.beginPath()
      ctx!.arc(head.x, head.y, 3.4 + pulse * 1.6, 0, Math.PI * 2)
      ctx!.fill()

      ctx!.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx!.beginPath()
      ctx!.arc(travel.x, travel.y, 2.4, 0, Math.PI * 2)
      ctx!.fill()

      for (const p of particles) {
        const x = (p.x + 0.012 * Math.sin(t * p.drift * 10 + p.phase)) * width
        const y = (p.y + 0.014 * Math.sin(t * 0.7 + p.phase)) * horizon * 0.72
        const a = p.b * (0.65 + 0.35 * Math.sin(t * 2 + p.phase))
        ctx!.fillStyle = `rgba(245, 248, 255, ${a})`
        ctx!.beginPath()
        ctx!.arc(x, y, p.r, 0, Math.PI * 2)
        ctx!.fill()
      }

      const vig = ctx!.createRadialGradient(
        width * 0.5,
        height * 0.45,
        height * 0.2,
        width * 0.5,
        height * 0.5,
        height * 0.85,
      )
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.55)')
      ctx!.fillStyle = vig
      ctx!.fillRect(0, 0, width, height)
    }

    function frame(now: number) {
      draw(now)
      if (!reduceMotion.matches) {
        raf = requestAnimationFrame(frame)
      }
    }

    resize()
    draw(performance.now())
    if (!reduceMotion.matches) {
      raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(() => {
      resize()
      draw(performance.now())
    })
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const onMotion = () => {
      cancelAnimationFrame(raf)
      if (!reduceMotion.matches) {
        start = performance.now()
        raf = requestAnimationFrame(frame)
      } else {
        draw(performance.now())
      }
    }
    reduceMotion.addEventListener('change', onMotion)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      reduceMotion.removeEventListener('change', onMotion)
    }
  }, [])

  return <canvas className="assist-hero__video" ref={canvasRef} />
}
