import { BarSizeSetting, Contract, EventName, SecType } from '@stoqey/ib'
import { LiveBar } from '../../../common'
import { barTimeToSavableFormat } from '../utils/date'
import { uniqueRequestId } from '../utils/uniqueRequestId'
import { initConnection } from './ib'

function sortBars(inputBars: Record<string, LiveBar>): LiveBar[] {
  return Object.values(inputBars).sort(
    (a, b) => a.time.getTime() - b.time.getTime()
  )
}

interface LiveBarUpdate {
  bars: LiveBar[]
  currentPrice: number
  recentBars: LiveBar[]
}

export async function startLiveBars(
  updateCallback: (bars: LiveBarUpdate) => void
) {
  // TODO: build historical bars first and then chain up bar updates (send as object so we keep unique times)
  // * they come back as 1m bars

  const ib = await initConnection()
  const contract: Contract = {
    symbol: 'BYND', // should be MSFT for now // TODO: fix me
    exchange: 'SMART',
    currency: 'USD',
    secType: SecType.STK
  }
  const endDate = '' // so we can get live updates
  const durationString = '1 D'

  type DateString = string
  const bars: Record<DateString, LiveBar> = {}

  ib.on(
    EventName.historicalData,
    (reqId, time, open, high, low, close, volume, count, wap, hasGaps) => {
      if (!time.includes('finished')) {
        bars[time] = {
          time: barTimeToSavableFormat(time),
          open,
          high,
          low,
          close,
          volume,
          symbol: 'MSFT',
          type: '1 min',
          exchange: 'SMART'
        }
      } else {
        console.log('Finished bar, not storing')
      }
    }
  )

  ib.on(
    EventName.historicalDataUpdate,
    (reqId, time, open, high, low, close, volume, count, wap) => {
      bars[time] = {
        time: barTimeToSavableFormat(time),
        open,
        high,
        low,
        close,
        volume,
        symbol: 'MSFT',
        type: '1 min',
        exchange: 'SMART'
      }
      const sortedBars = sortBars(bars)
      const recentBars = sortedBars.slice(
        sortedBars.length - 30,
        sortedBars.length
      )

      updateCallback({
        bars: sortedBars,
        currentPrice: sortedBars[sortedBars.length - 1].close,
        recentBars
      })
    }
  )

  console.log('Requesting historical data')
  ib.reqHistoricalData(
    uniqueRequestId(),
    contract,
    endDate,
    durationString,
    BarSizeSetting.MINUTES_ONE,
    'TRADES',
    1,
    1,
    true
  )
}

export async function stopLiveBars() {
  const ib = await initConnection()
  ib.removeAllListeners(EventName.historicalData)
  ib.removeAllListeners(EventName.historicalDataUpdate)
}
