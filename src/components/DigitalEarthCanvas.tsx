import { useEffect, useRef } from 'react'

type Streak = {
  x: number
  h: number
  w: number
  b: number
  speed: number
  phase: number
}

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

function buildStreaks(rand: () => number): Streak[] {
  const streaks: Streak[] = []
  for (let i = 0; i < 520; i++) {
    const x = 0.02 + rand() * 0.96
    const center = Math.abs(x - 0.52)
    streaks.push({
      x,
      h: Math.min(0.98, (0.4 + rand() * 0.58) * (1.2 - center * 0.9)),
      w: center > 0.1 ? 0.45 + rand() * 1.4 : 0.9 + rand() * 2.8,
      b: (0.18 + rand() * 0.75) * (1.15 - center * 0.7),
      speed: 0.06 + rand() * 0.28,
      phase: rand() * Math.PI * 2,
    })
  }
  for (let i = 0; i < 40; i++) {
    streaks.push({
      x: 0.5 + (rand() - 0.5) * 0.09,
      h: 0.78 + rand() * 0.2,
      w: 1.2 + rand() * 4.5,
      b: 0.8 + rand() * 0.2,
      speed: 0.04 + rand() * 0.14,
      phase: rand() * Math.PI * 2,
    })
  }
  return streaks
}

function buildParticles(rand: () => number): Particle[] {
  return Array.from({ length: 140 }, () => ({
    x: 0.05 + rand() * 0.9,
    y: 0.04 + rand() * 0.5,
    r: 0.6 + rand() * 1.8,
    b: 0.35 + rand() * 0.6,
    drift: 0.01 + rand() * 0.03,
    phase: rand() * Math.PI * 2,
  }))
}

/** Retina-sharp digital landscape — same vibe as the old stock clip, no pixel mush. */
export function DigitalEarthCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const rand = seededRandom(42)
    const streaks = buildStreaks(rand)
    const particles = buildParticles(rand)
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

    function draw(now: number) {
      const t = (now - start) / 1000
      const horizon = height * 0.58
      const vanishX = width * 0.52

      // Background
      ctx!.fillStyle = '#05070a'
      ctx!.fillRect(0, 0, width, height)

      // Soft sky lift toward horizon
      const sky = ctx!.createLinearGradient(0, 0, 0, horizon)
      sky.addColorStop(0, 'rgba(8, 8, 8, 0)')
      sky.addColorStop(1, 'rgba(40, 40, 40, 0.35)')
      ctx!.fillStyle = sky
      ctx!.fillRect(0, 0, width, horizon)

      // Floor base
      ctx!.fillStyle = '#070b10'
      ctx!.fillRect(0, horizon, width, height - horizon)

      // Perspective horizontals
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

      // Perspective verticals
      for (let i = -22; i <= 22; i++) {
        const x0 = vanishX + i * width * 0.048
        const a = 0.06 + 0.2 * (1 - Math.abs(i) / 22)
        ctx!.strokeStyle = `rgba(200, 200, 200, ${a})`
        ctx!.beginPath()
        ctx!.moveTo(vanishX, horizon)
        ctx!.lineTo(x0, height)
        ctx!.stroke()
      }

      // Glowing floor tiles drifting forward
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

      // Horizon node lights
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

      // Vertical light streaks
      ctx!.lineCap = 'round'
      for (const s of streaks) {
        const pulse = 0.62 + 0.38 * Math.sin(t * s.speed * Math.PI * 2 + s.phase)
        const h = horizon * s.h * pulse
        const x = s.x * width
        const top = horizon - h
        const b = Math.min(1, s.b * pulse)

        if (s.w >= 2) {
          ctx!.strokeStyle = `rgba(255, 255, 255, ${0.1 * b})`
          ctx!.lineWidth = s.w + 5
          ctx!.beginPath()
          ctx!.moveTo(x, top + h * 0.1)
          ctx!.lineTo(x, horizon)
          ctx!.stroke()
        }

        ctx!.strokeStyle = `rgba(255, 255, 255, ${0.55 + 0.45 * b})`
        ctx!.lineWidth = Math.max(0.7, s.w)
        ctx!.beginPath()
        ctx!.moveTo(x, top)
        ctx!.lineTo(x, horizon)
        ctx!.stroke()
      }

      // Central bloom
      const bloomX = width * 0.52
      const bloom = ctx!.createRadialGradient(
        bloomX,
        horizon,
        4,
        bloomX,
        horizon,
        width * 0.12,
      )
      bloom.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
      bloom.addColorStop(0.35, 'rgba(255, 255, 255, 0.12)')
      bloom.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx!.fillStyle = bloom
      ctx!.fillRect(bloomX - width * 0.14, horizon - height * 0.2, width * 0.28, height * 0.28)

      // Particles
      for (const p of particles) {
        const x = (p.x + 0.012 * Math.sin(t * p.drift * 10 + p.phase)) * width
        const y = (p.y + 0.014 * Math.sin(t * 0.7 + p.phase)) * horizon
        const a = p.b * (0.65 + 0.35 * Math.sin(t * 2 + p.phase))
        ctx!.fillStyle = `rgba(245, 248, 255, ${a})`
        ctx!.beginPath()
        ctx!.arc(x, y, p.r, 0, Math.PI * 2)
        ctx!.fill()
      }

      // Vignette
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
