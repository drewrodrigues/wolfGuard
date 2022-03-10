import { Contract, SecType } from '@stoqey/ib'
import { db } from '../access/db'
import { getHistoricalData } from '../access/history'

enum StockSymbol {
  AAPL = 'APPL',
  AMZN = 'AMZN',
  BYND = 'BYND',
  CRM = 'CRM',
  DIS = 'DIS',
  DLTR = 'DLTR',
  ETSY = 'ETSY',
  FVRR = 'FVRR',
  GOOGL = 'GOOGL',
  MSFT = 'MSFT',
  PINSY = 'PINS',
  RDFN = 'RDFN',
  ROKU = 'ROKU',
  SQ = 'SQ',
  TDOC = 'TDOC',
  TSLA = 'TSLA',
  UPWK = 'UPWK',
  USO = 'USO',
  ZG = 'ZG'
}

enum Exchange {
  SMART = 'SMART'
}

async function run() {
  const stockSymbols = Object.keys(StockSymbol)

  for (let i = 0; i < stockSymbols.length; i++) {
    const symbol = stockSymbols[i]
    const contract: Contract = {
      symbol: symbol, // should be MSFT for now
      exchange: Exchange.SMART,
      currency: 'USD',
      secType: SecType.STK
    }
    console.log(contract)
    try {
      const bars = await getHistoricalData(contract)
      console.log('saving bars')
      await db.bar.createMany({ data: bars, skipDuplicates: true })
      console.log('bars saved')
    } catch (e: any) {
      console.error(
        `Something failed with symbol=${symbol} & exchange=${Exchange.SMART}`,
        e
      )
    }
  }
}

const interval = setInterval(() => {
  console.log(`Ping <${'-'.repeat(Math.floor(Math.random() * 20))}`)
}, 1000 * 10)

run()
  .then(() => {
    console.log('Run done')
    clearInterval(interval)
  })
  .catch((e) => {
    console.error('Run failed with', e)
    clearInterval(interval)
  })
