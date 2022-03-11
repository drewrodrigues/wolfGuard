import { Bar } from '@prisma/client'
import { BarSizeSetting, Contract, EventName } from '@stoqey/ib'
import { v1 } from 'uuid'
import { barTimeToSavableFormat } from '../utils/date'
import { initConnection } from './ib'

export async function getHistoricalData(contract: Contract): Promise<any[]> {
  console.log('getHistoricalData')
  const requestId = parseInt(v1().replace(/\D/g, '').slice(0, 5))

  const bars: Omit<Bar, 'id'>[] = []
  const ib = await initConnection()

  return new Promise((resolve, reject) => {
    ib.on(EventName.error, (e) => {
      console.log('Rejecting', e)
      reject(e)
    })

    ib.on(EventName.all, (...args) => {
      const [message, detail] = [args[0], args[1][0]]
      if (
        message !== 'historicalData' &&
        message !== 'managedAccounts' &&
        typeof detail === 'string'
          ? !detail.includes('data farm')
          : true
      ) {
        console.log('getHistoricalData message: ', args)
      }
    })

    ib.on(EventName.disconnected, (...message) => {
      console.log('getHistoricalData disconnected: ', message)
      reject(message)
    })

    ib.on(
      EventName.historicalData,
      (
        dataRequestId,
        time,
        open,
        high,
        low,
        close,
        volume,
        count,
        WAP,
        hasGaps
      ) => {
        if (time.includes('finished')) {
          console.error('hmm: ', time)
          resolve(bars)
        } else if (dataRequestId === requestId) {
          console.log('Pushing bar', { time })
          const newBar: Omit<Bar, 'id'> = {
            symbol: contract.symbol!,
            time: barTimeToSavableFormat(time),
            open,
            high,
            low,
            close,
            volume,
            type: BarSizeSetting.MINUTES_ONE,
            exchange: contract.exchange!
          }
          console.log('Pushing bar: ', newBar)
          bars.push(newBar)
        } else {
          console.error('hmm: ', time)
        }
      }
    )

    console.log('Requesting historical data')
    // "20211223 00:00:00",
    // '20210101 00:00:00',
    // '20210201 00:00:00',
    // TODO make these configurable
    ib.reqHistoricalData(
      requestId,
      contract,
      '20220210 00:00:00',
      // '30 D',
      '100 D',
      BarSizeSetting.MINUTES_ONE,
      'BID', // midpoint?
      1,
      1,
      false
    )
  })
}
