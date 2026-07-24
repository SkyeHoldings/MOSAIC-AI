import { chromium } from 'playwright'

const out = 'C:/Users/skyes/Downloads/mosaic-flyer.pdf'

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 816, height: 1056 }, // 8.5 x 11 at 96dpi
  deviceScaleFactor: 2,
})

// Use screen media so muted greys don't get crushed in print CSS
await page.goto('http://localhost:5173/onesheet', { waitUntil: 'networkidle' })
await page.waitForSelector('[data-print-ready="true"]', { timeout: 20000 })
await page.waitForTimeout(800)

await page.addStyleTag({
  content: `
    .os__lede,
    .os__clients-label,
    .os__place,
    .os__qr-label {
      color: #d0d0cc !important;
      opacity: 1 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print { display: none !important; }
  `,
})

await page.evaluate(() => {
  const sheet = document.querySelector('.os__sheet')
  document.body.innerHTML = ''
  document.body.style.margin = '0'
  document.body.style.padding = '0'
  document.body.style.background = '#05070a'
  document.documentElement.style.background = '#05070a'
  document.documentElement.style.margin = '0'
  document.documentElement.style.padding = '0'
  sheet.style.margin = '0'
  sheet.style.boxShadow = 'none'
  sheet.style.border = 'none'
  sheet.style.width = '8.5in'
  sheet.style.height = '11in'
  sheet.style.minHeight = '11in'
  document.body.appendChild(sheet)
})

await page.pdf({
  path: out,
  format: 'Letter',
  printBackground: true,
  margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' },
  preferCSSPageSize: true,
})
await browser.close()
console.log(`Wrote letter-size full-bleed ${out}`)
