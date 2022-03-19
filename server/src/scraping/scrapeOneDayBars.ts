import puppeteer from 'puppeteer'
import { SYMBOLS } from './symbols'

function getSymbolUrl(symbol: string) {
  return `https://finance.yahoo.com/quote/${symbol}/history?period1=1489881600&period2=1647648000&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true`
}

const SYMBOLS_REVERSED = SYMBOLS.reverse()
// const browserOptions = {
//   headless: false,
//   defaultViewport: { width: 1920, height: 1080 }
// }
const browserOptions = {}

async function scrapeOneDaybars() {
  const browser = await puppeteer.launch(browserOptions)
  // const browser = await puppeteer.launch()
  const page = await browser.newPage()

  for (let i = 0; i < SYMBOLS_REVERSED.length; i++) {
    try {
      const symbol = SYMBOLS_REVERSED[i]
      console.log(`Navigating to ${symbol} data`)
      await page.goto(getSymbolUrl(symbol))
      const elements = await page.$$('*')

      for (let j = 0; j < elements.length; j++) {
        const element = elements[j]
        const text = await element.evaluate((el) => el.textContent)

        if (text === 'Download') {
          console.log('Clicking on download')
          await element.click()
          await new Promise((res) => setTimeout(() => res(true), 5000)) // wait for download to start
          break // other elements have download text too
        }
      }
    } catch (e) {
      console.error(e)
    }
    console.log('\n')
  }

  // await browser.close()
}

scrapeOneDaybars()
