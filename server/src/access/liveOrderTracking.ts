import { Contract, Order } from '@stoqey/ib'
import { IBuyOrder } from '../../../common'
import { db } from './db'

export function liveOrderTracking_Send(
  signal: IBuyOrder,
  orderAction: 'BUY' | 'SELL'
): Promise<number> {
  const orderSendTime = new Date()

  return new Promise((resolve) => {
    db.liveTrade
      .create({
        data: {
          action: orderAction,
          symbol: signal.bar.symbol,
          type: signal.bar.type,
          time: signal.bar.time,
          open: signal.bar.open,
          high: signal.bar.high,
          low: signal.bar.low,
          close: signal.bar.close,
          volume: signal.bar.volume,
          exchange: 'UNKNOWN', // TODO: actually set me
          // reasoning
          strategy: 'IncreasingBars',
          signalReasoning: signal.signalReasoning!,
          orderDetails: null, // once the order goes through, we'll fill this
          orderSendTime,
          // TODO: get these filled
          orderAcceptedTime: null,
          orderExecutedTime: null
        }
      })
      .then((record) => {
        console.log('liveTrade record created: ', record.id)
        resolve(record.id)
      })
      .catch(() => {
        console.error('liveTrade record failed to be created')
      })
  })
}

export async function liveOrderTracking_Accepted(
  liveOrderId: number,
  orderDetails: { contract: Contract; order: Order }
) {
  console.log('liveOrderTracking_Accepted')
  try {
    await db.liveTrade.update({
      where: { id: liveOrderId },
      data: {
        orderAcceptedTime: new Date(),
        orderDetails: JSON.stringify(orderDetails)
      }
    })
    console.log('liveOrderTracking_Accepted: Successfully updated acceptedTime')
  } catch (e) {
    console.error('liveOrderTracking_Accepted: Failed to update')
  }
}

export async function liveOrderTracking_Executed(liveOrderId: number) {
  console.log('liveOrderTracking_Executed')
  try {
    await db.liveTrade.update({
      where: { id: liveOrderId },
      data: {
        orderExecutedTime: new Date()
      }
    })
    console.log(
      'liveOrderTracking_Executed: Successfully updated orderExecutedTime'
    )
  } catch (e) {
    console.error('liveOrderTracking_Executed: Failed to update')
  }
}
