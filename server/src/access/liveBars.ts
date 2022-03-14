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

export async function liveBars(updateCallback: (bars: any) => any) {
  // TODO: build historical bars first and then chain up bar updates (send as object so we keep unique times)
  // * they come back as 1m bars

  const ib = await initConnection()
  const contract: Contract = {
    symbol: 'MSFT', // should be MSFT for now
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
      console.log({
        reqId,
        time,
        open,
        high,
        low,
        close,
        volume,
        count,
        wap,
        hasGaps
      })
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
      console.log('EventName.historicalDataUpdate: ', {
        reqId,
        time,
        open,
        high,
        low,
        close,
        volume,
        count,
        wap
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
