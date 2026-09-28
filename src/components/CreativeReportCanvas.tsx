import { useEffect, useRef } from 'react'

const METRICS = [
  { label: 'Spend', value: '$2.4M', spark: [0.42, 0.48, 0.45, 0.58, 0.62, 0.74, 0.86] },
  { label: 'ROAS', value: '4.8x', spark: [0.28, 0.34, 0.4, 0.38, 0.52, 0.66, 0.8] },
  { label: 'CPA', value: '$18', spark: [0.82, 0.74, 0.7, 0.58, 0.5, 0.4, 0.32] },
  { label: 'CTR', value: '3.2%', spark: [0.22, 0.3, 0.36, 0.34, 0.48, 0.6, 0.72] },
]

const CHANNELS = [
  { name: 'Meta', share: 0.86 },
  { name: 'Google', share: 0.7 },
  { name: 'TikTok', share: 0.52 },
  { name: 'YouTube', share: 0.38 },
]

const CAPTIONS = ['First look', 'Open this', 'Daily carry', 'Out there', 'The routine']

const MIX = [
  { label: 'Mobile', share: 0.46, color: 'rgba(255,255,255,0.92)' },
  { label: 'Desktop', share: 0.4, color: 'rgba(255,255,255,0.42)' },
  { label: 'Tablet', share: 0.14, color: 'rgba(255,255,255,0.16)' },
]

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function ease(value: number) {
  const t = clamp01(value)
  return 1 - (1 - t) * (1 - t) * (1 - t)
}

function windowed(u: number, start: number, end: number) {
  return ease((u - start) / (end - start))
}

/** Performance report and creator-phone ads, in the site's black-and-white palette. */
export function CreativeReportCanvas() {
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

    function round(x: number, y: number, w: number, h: number, r: number) {
      ctx!.beginPath()
      ctx!.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2))
    }

    function drawSpark(
      points: number[],
      x: number,
      y: number,
      w: number,
      h: number,
      progress: number,
    ) {
      const count = Math.max(2, Math.ceil(points.length * progress))
      ctx!.beginPath()
      for (let i = 0; i < count; i++) {
        const px = x + (i / (points.length - 1)) * w
        const py = y + h - points[i] * h
        if (i === 0) ctx!.moveTo(px, py)
        else ctx!.lineTo(px, py)
      }
      ctx!.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx!.lineWidth = 1.4
      ctx!.lineJoin = 'round'
      ctx!.lineCap = 'round'
      ctx!.stroke()
    }

    function drawReport(u: number, fade: number, left: number, top: number, panelW: number, panelH: number) {
      const gap = Math.max(6, panelW * 0.018)
      const cardH = Math.min(panelH * 0.42, 108)
      const cardW = (panelW - gap * (METRICS.length - 1)) / METRICS.length
      const labelSize = Math.max(9, Math.min(12, cardW * 0.16))
      const valueSize = Math.max(13, Math.min(22, cardW * 0.28))

      METRICS.forEach((metric, index) => {
        const reveal = windowed(u, 0.02 + index * 0.035, 0.16 + index * 0.035)
        if (reveal <= 0) return
        const x = left + index * (cardW + gap)
        ctx!.save()
        ctx!.globalAlpha = fade * reveal
        ctx!.fillStyle = 'rgba(255,255,255,0.045)'
        ctx!.strokeStyle = 'rgba(255,255,255,0.14)'
        ctx!.lineWidth = 1
        round(x, top, cardW, cardH, 10)
        ctx!.fill()
        ctx!.stroke()
        ctx!.textAlign = 'left'
        ctx!.textBaseline = 'top'
        ctx!.fillStyle = 'rgba(255,255,255,0.58)'
        ctx!.font = `400 ${labelSize}px Armata, sans-serif`
        ctx!.fillText(metric.label, x + 10, top + 8)
        ctx!.fillStyle = '#fff'
        ctx!.font = `400 ${valueSize}px Armata, sans-serif`
        ctx!.fillText(metric.value, x + 10, top + 8 + labelSize + 3)
        const sparkY = top + cardH - 16
        drawSpark(metric.spark, x + 10, sparkY - cardH * 0.28, cardW - 20, cardH * 0.28, reveal)
        ctx!.restore()
      })

      const chartTop = top + cardH + gap
      const chartH = panelH - cardH - gap
      if (chartH < 56) return

      const showDonut = chartH >= 78 && panelW >= 340
      const donutW = showDonut ? Math.min(panelW * 0.34, chartH * 1.35) : 0
      const barsW = panelW - donutW - (showDonut ? gap : 0)
      const barProgress = windowed(u, 0.18, 0.46)
      const rowH = chartH / CHANNELS.length
      const nameSize = Math.max(10, Math.min(13, barsW * 0.04))

      CHANNELS.forEach((channel, index) => {
        const y = chartTop + index * rowH + rowH * 0.5
        ctx!.save()
        ctx!.globalAlpha = fade * Math.max(barProgress, 0.001)
        ctx!.fillStyle = 'rgba(255,255,255,0.72)'
        ctx!.font = `400 ${nameSize}px Armata, sans-serif`
        ctx!.textAlign = 'left'
        ctx!.textBaseline = 'middle'
        ctx!.fillText(channel.name, left, y)
        const nameW = Math.max(52, nameSize * 5.4)
        const trackX = left + nameW
        const trackW = barsW - nameW - 4
        const barH = Math.max(4, Math.min(7, rowH * 0.28))
        ctx!.fillStyle = 'rgba(255,255,255,0.08)'
        round(trackX, y - barH / 2, trackW, barH, barH)
        ctx!.fill()
        ctx!.fillStyle = 'rgba(255,255,255,0.92)'
        round(trackX, y - barH / 2, trackW * channel.share * barProgress, barH, barH)
        ctx!.fill()
        ctx!.restore()
      })

      if (!showDonut) return
      const donutProgress = windowed(u, 0.24, 0.52)
      const cx = left + barsW + gap + donutW * 0.4
      const cy = chartTop + chartH * 0.46
      const radius = Math.min(donutW * 0.28, chartH * 0.28)
      let angle = -Math.PI / 2
      const sweep = donutProgress * Math.PI * 2
      MIX.forEach((slice) => {
        const startAngle = angle
        const endAngle = angle + slice.share * Math.PI * 2
        const drawn = Math.min(endAngle, -Math.PI / 2 + sweep)
        if (drawn > startAngle) {
          ctx!.save()
          ctx!.globalAlpha = fade
          ctx!.beginPath()
          ctx!.strokeStyle = slice.color
          ctx!.lineWidth = Math.max(6, radius * 0.28)
          ctx!.lineCap = 'butt'
          ctx!.arc(cx, cy, radius, startAngle, drawn)
          ctx!.stroke()
          ctx!.restore()
        }
        angle = endAngle
      })

      if (donutProgress < 0.2 || donutW < 90) return
      const legendX = cx + radius + 14
      const legendSize = Math.max(9, Math.min(11, chartH * 0.08))
      MIX.forEach((slice, index) => {
        const y = cy - 18 + index * (legendSize + 8)
        ctx!.save()
        ctx!.globalAlpha = fade * donutProgress
        ctx!.fillStyle = slice.color
        ctx!.fillRect(legendX, y, 7, 7)
        ctx!.fillStyle = 'rgba(255,255,255,0.7)'
        ctx!.font = `400 ${legendSize}px Armata, sans-serif`
        ctx!.textAlign = 'left'
        ctx!.textBaseline = 'top'
        ctx!.fillText(slice.label, legendX + 12, y - 2)
        ctx!.restore()
      })
    }

    function drawScene(index: number, x: number, y: number, w: number, h: number, scan: number) {
      ctx!.save()
      round(x, y, w, h, 8)
      ctx!.clip()
      ctx!.fillStyle = '#f3f1ee'
      ctx!.fillRect(x, y, w, h)

      if (index % 5 === 0) {
        ctx!.fillStyle = '#d7d4cf'
        ctx!.fillRect(x, y, w * 0.42, h)
        ctx!.fillStyle = '#1c1c1c'
        round(x + w * 0.5, y + h * 0.22, w * 0.34, h * 0.42, 8)
        ctx!.fill()
      } else if (index % 5 === 1) {
        ctx!.fillStyle = '#dedad4'
        ctx!.beginPath()
        ctx!.ellipse(x + w * 0.5, y + h * 0.42, w * 0.34, h * 0.2, 0, 0, Math.PI * 2)
        ctx!.fill()
        for (let n = 0; n < 8; n++) {
          const a = (n / 8) * Math.PI * 2 - Math.PI / 2
          ctx!.fillStyle = n % 2 === 0 ? '#1c1c1c' : '#8d8a85'
          ctx!.beginPath()
          ctx!.arc(x + w * 0.5 + Math.cos(a) * w * 0.2, y + h * 0.42 + Math.sin(a) * h * 0.12, w * 0.055, 0, Math.PI * 2)
          ctx!.fill()
        }
      } else if (index % 5 === 2) {
        ctx!.fillStyle = '#d8d5d0'
        ctx!.fillRect(x, y, w, h * 0.72)
        ctx!.fillStyle = '#161616'
        round(x + w * 0.22, y + h * 0.28, w * 0.56, h * 0.3, 6)
        ctx!.fill()
      } else if (index % 5 === 3) {
        ctx!.fillStyle = '#cfcbc6'
        ctx!.fillRect(x, y, w, h * 0.58)
        ctx!.fillStyle = '#8a8681'
        ctx!.fillRect(x, y + h * 0.58, w, h * 0.42)
        ctx!.fillStyle = '#f7f5f2'
        ctx!.beginPath()
        ctx!.arc(x + w * 0.72, y + h * 0.24, w * 0.08, 0, Math.PI * 2)
        ctx!.fill()
      } else {
        ctx!.fillStyle = '#ddd9d4'
        ctx!.fillRect(x, y, w, h)
        ctx!.fillStyle = '#1b1b1b'
        round(x + w * 0.34, y + h * 0.16, w * 0.32, h * 0.46, w * 0.16)
        ctx!.fill()
        ctx!.fillStyle = '#f4f2ef'
        round(x + w * 0.4, y + h * 0.2, w * 0.2, h * 0.1, 4)
        ctx!.fill()
      }

      const bandY = y + h * (0.08 + scan * 0.7)
      const sheen = ctx!.createLinearGradient(0, bandY, 0, bandY + h * 0.18)
      sheen.addColorStop(0, 'rgba(255,255,255,0)')
      sheen.addColorStop(0.5, 'rgba(255,255,255,0.28)')
      sheen.addColorStop(1, 'rgba(255,255,255,0)')
      ctx!.fillStyle = sheen
      ctx!.fillRect(x, bandY, w, h * 0.18)

      const caption = CAPTIONS[index % CAPTIONS.length]
      const captionSize = Math.max(8, Math.min(12, w * 0.13))
      ctx!.font = `400 ${captionSize}px Armata, sans-serif`
      const textW = ctx!.measureText(caption).width
      const pillW = textW + captionSize * 1.1
      const pillH = captionSize + 7
      const pillX = x + (w - pillW) / 2
      const pillY = y + h - pillH - h * 0.08
      ctx!.fillStyle = '#111'
      round(pillX, pillY, pillW, pillH, pillH / 2)
      ctx!.fill()
      ctx!.fillStyle = '#fff'
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      ctx!.fillText(caption, x + w / 2, pillY + pillH / 2 + 0.5)
      ctx!.restore()
    }

    function drawPhones(u: number, fade: number, scan: number, left: number, top: number, panelW: number, panelH: number) {
      let count = panelW < 460 ? 3 : panelW < 700 ? 4 : 5
      const gap = Math.max(8, panelW * 0.02)
      let phoneH = panelH
      let phoneW = phoneH * 0.52
      if (count * phoneW + (count - 1) * gap > panelW) {
        phoneW = (panelW - (count - 1) * gap) / count
        phoneH = phoneW / 0.52
      }
      if (phoneW < 46 && count > 3) {
        count = 3
        phoneW = (panelW - (count - 1) * gap) / count
        phoneH = Math.min(panelH, phoneW / 0.52)
      }
      const rowW = count * phoneW + (count - 1) * gap
      const startX = left + (panelW - rowW) / 2
      const y = top + (panelH - phoneH) / 2

      for (let i = 0; i < count; i++) {
        const reveal = windowed(u, 0.32 + i * 0.04, 0.5 + i * 0.04)
        if (reveal <= 0) continue
        const x = startX + i * (phoneW + gap)
        ctx!.save()
        ctx!.globalAlpha = fade * reveal
        ctx!.translate(0, (1 - reveal) * 22)
        ctx!.fillStyle = '#0b0c0e'
        ctx!.strokeStyle = 'rgba(255,255,255,0.55)'
        ctx!.lineWidth = 1.25
        round(x, y, phoneW, phoneH, phoneW * 0.14)
        ctx!.fill()
        ctx!.stroke()
        const inset = phoneW * 0.07
        drawScene(i, x + inset, y + inset * 1.6, phoneW - inset * 2, phoneH - inset * 2.5, scan)
        ctx!.fillStyle = '#0b0c0e'
        const notchW = phoneW * 0.28
        round(x + (phoneW - notchW) / 2, y + inset * 0.7, notchW, Math.max(4, phoneH * 0.035), 6)
        ctx!.fill()
        ctx!.restore()
      }
    }

    function draw(now: number) {
      const t = (now - start) / 1000
      const cycle = 12
      const u = reduceMotion.matches ? 0.8 : (t % cycle) / cycle
      const fade = reduceMotion.matches ? 1 : u < 0.04 ? u / 0.04 : u > 0.94 ? (1 - u) / 0.06 : 1
      const scan = reduceMotion.matches ? 0.35 : (t % 2.8) / 2.8
      const left = width * 0.06
      const right = width * 0.94
      const panelW = right - left
      const top = height * 0.055
      const bottom = height * 0.95
      const innerH = bottom - top
      const reportH = innerH * (height < 360 ? 0.46 : 0.52)
      const phoneTop = top + reportH + height * 0.025

      ctx!.fillStyle = '#05070a'
      ctx!.fillRect(0, 0, width, height)

      drawReport(u, fade, left, top, panelW, reportH)

      const vig = ctx!.createRadialGradient(width * 0.5, height * 0.32, height * 0.08, width * 0.5, height * 0.36, height * 0.72)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.28)')
      ctx!.fillStyle = vig
      ctx!.fillRect(0, 0, width, height)

      drawPhones(u, fade, scan, left, phoneTop, panelW, bottom - phoneTop)
    }

    function frame(now: number) {
      draw(now)
      if (!reduceMotion.matches) raf = requestAnimationFrame(frame)
    }

    resize()
    draw(performance.now())
    if (!reduceMotion.matches) raf = requestAnimationFrame(frame)

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

  return (
    <canvas
      className="assist-hero__video"
      ref={canvasRef}
      aria-label="Performance report beside creator-style phone ads for paid media"
    />
  )
}
