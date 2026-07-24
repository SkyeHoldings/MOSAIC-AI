import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } })
await page.goto('http://localhost:5173/onesheet', { waitUntil: 'networkidle' })
await page.waitForSelector('[data-print-ready="true"]', { timeout: 20000 })
await page.screenshot({
  path: 'C:/Users/skyes/Downloads/mosaic-flyer-preview.png',
  fullPage: true,
})
const info = await page.evaluate(() => {
  const h = document.querySelector('.os__headline')
  const cs = getComputedStyle(h)
  const qr = document.querySelector('img.os__qr-mark')
  return {
    family: cs.fontFamily,
    armataLoaded: document.fonts.check('400 48px Armata'),
    qrSrcPrefix: qr?.getAttribute('src')?.slice(0, 22) ?? null,
    qrNaturalWidth: qr?.naturalWidth ?? 0,
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
