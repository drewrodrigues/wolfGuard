import { BarSizeSetting, Contract, EventName, SecType } from '@stoqey/ib'
import { uniqueRequestId } from '../utils/uniqueRequestId'
import { initConnection } from './ib'

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
  const bars: Record<DateString, object> = {}

  ib.on(
    EventName.historicalData,
    (reqId, time, open, high, low, close, volume, count, wap, hasGaps) => {
      if (!time.includes('finished')) {
        bars[time] = {
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
        reqId,
        time,
        open,
        high,
        low,
        close,
        volume,
        count,
        wap
      }
      updateCallback(bars)
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
