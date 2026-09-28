import { useEffect, useRef } from 'react'

const WEEKS = [0.14, 0.18, 0.22, 0.27, 0.36, 0.44, 0.52, 0.6, 0.7, 0.8, 0.9, 0.98]

const PHASES = [
  { from: 0, to: 3, lines: ['Audit'] },
  { from: 4, to: 7, lines: ['Strategy &', 'creative review'] },
  { from: 8, to: 11, lines: ['Implementation'] },
]

/** Twelve-week marketing growth line, split into three phases. */
export function TrendlineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

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

    function layout() {
      return {
        left: width * 0.08,
        right: width * 0.94,
        top: height * 0.2,
        bottom: height * 0.74,
      }
    }

    function point(index: number) {
      const { left, right, top, bottom } = layout()
      const nx = index / (WEEKS.length - 1)
      return {
        x: left + nx * (right - left),
        y: bottom - WEEKS[index] * (bottom - top),
      }
    }

    function drawnPoints(progress: number) {
      const last = (WEEKS.length - 1) * progress
      const full = Math.floor(last)
      const frac = last - full
      const points = []
      for (let i = 0; i <= full && i < WEEKS.length; i++) points.push(point(i))
      if (full < WEEKS.length - 1) {
        const a = point(full)
        const b = point(full + 1)
        points.push({
          x: a.x + (b.x - a.x) * frac,
          y: a.y + (b.y - a.y) * frac,
        })
      }
      return points
    }

    function draw(now: number) {
      const t = (now - start) / 1000
      const cycle = 9
      const u = reduceMotion.matches ? 1 : (t % cycle) / cycle
      const progress = u < 0.62 ? u / 0.62 : 1
      const { left, right, top, bottom } = layout()

      ctx!.fillStyle = '#05070a'
      ctx!.fillRect(0, 0, width, height)

      const bounds = [left]
      for (let i = 0; i < PHASES.length - 1; i++) {
        const a = point(PHASES[i].to)
        const b = point(PHASES[i + 1].from)
        bounds.push((a.x + b.x) / 2)
      }
      bounds.push(right)
      ctx!.lineWidth = 1
      for (let i = 0; i < bounds.length - 1; i++) {
        ctx!.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.035)' : 'rgba(255, 255, 255, 0.015)'
        ctx!.fillRect(bounds[i], top, bounds[i + 1] - bounds[i], bottom - top)
      }
      for (let i = 1; i < bounds.length - 1; i++) {
        ctx!.strokeStyle = 'rgba(255, 255, 255, 0.16)'
        ctx!.beginPath()
        ctx!.moveTo(bounds[i], top)
        ctx!.lineTo(bounds[i], bottom)
        ctx!.stroke()
      }

      ctx!.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = top + ((bottom - top) * i) / 4
        ctx!.strokeStyle = 'rgba(255, 255, 255, 0.08)'
        ctx!.beginPath()
        ctx!.moveTo(left, y)
        ctx!.lineTo(right, y)
        ctx!.stroke()
      }

      const points = drawnPoints(progress)
      const base = bottom

      if (points.length > 1) {
        ctx!.beginPath()
        points.forEach((p, i) => {
          if (i === 0) ctx!.moveTo(p.x, p.y)
          else ctx!.lineTo(p.x, p.y)
        })
        ctx!.lineTo(points[points.length - 1].x, base)
        ctx!.lineTo(points[0].x, base)
        ctx!.closePath()
        const fill = ctx!.createLinearGradient(0, top, 0, base)
        fill.addColorStop(0, 'rgba(255, 255, 255, 0.14)')
        fill.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx!.fillStyle = fill
        ctx!.fill()

        ctx!.strokeStyle = 'rgba(255, 255, 255, 0.96)'
        ctx!.lineWidth = 2
        ctx!.lineJoin = 'round'
        ctx!.lineCap = 'butt'
        ctx!.beginPath()
        points.forEach((p, i) => {
          if (i === 0) ctx!.moveTo(p.x, p.y)
          else ctx!.lineTo(p.x, p.y)
        })
        ctx!.stroke()
      }

      const revealed = Math.floor(progress * (WEEKS.length - 1) + 0.001)
      for (let i = 0; i < WEEKS.length; i++) {
        if (i > revealed) continue
        const p = point(i)
        ctx!.fillStyle = '#fff'
        ctx!.fillRect(p.x - 2.5, p.y - 2.5, 5, 5)
      }

      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx!.beginPath()
      ctx!.moveTo(left, bottom)
      ctx!.lineTo(right, bottom)
      ctx!.stroke()

      const labelSize = Math.max(11, Math.min(14, width * 0.018))
      ctx!.font = `400 ${labelSize}px Armata, sans-serif`
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'top'
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.62)'
      for (let i = 0; i < WEEKS.length; i++) {
        const p = point(i)
        ctx!.fillText(String(i + 1), p.x, bottom + labelSize * 0.55)
      }

      const phaseSize = Math.max(11, Math.min(13, width * 0.016))
      ctx!.font = `400 ${phaseSize}px Armata, sans-serif`
      ctx!.textBaseline = 'bottom'
      PHASES.forEach((phase) => {
        const a = point(phase.from)
        const b = point(phase.to)
        const x = (a.x + b.x) / 2
        phase.lines.forEach((line, lineIndex) => {
          const y = top - phaseSize * 0.45 - (phase.lines.length - 1 - lineIndex) * (phaseSize + 3)
          ctx!.fillStyle = lineIndex === 0 ? 'rgba(255, 255, 255, 0.82)' : 'rgba(255, 255, 255, 0.62)'
          ctx!.fillText(line, x, y)
        })
      })

      const vig = ctx!.createRadialGradient(
        width * 0.5,
        height * 0.42,
        height * 0.15,
        width * 0.5,
        height * 0.48,
        height * 0.85,
      )
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.45)')
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

  return <canvas className="assist-hero__video" ref={canvasRef} aria-label="Marketing growth across 12 weeks: audit, strategy and creative review, then implementation" />
}
