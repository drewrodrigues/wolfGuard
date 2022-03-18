import {
  Contract,
  EventName,
  Order,
  OrderAction,
  OrderType,
  SecType
} from '@stoqey/ib'
import { initConnection } from './ib'

export async function sellOrder(
  exitPrice: number,
  lotSize: number,
  symbol: string
) {
  const ib = await initConnection()

  return new Promise((resolve) => {
    ib.once(EventName.nextValidId, (orderId: number) => {
      const contract: Contract = {
        symbol: symbol, // TODO: fix to pick correct symbol
        exchange: 'SMART',
        currency: 'USD',
        secType: SecType.STK
      }
      const order: Order = {
        orderType: OrderType.STP,
        action: OrderAction.SELL,
        auxPrice: exitPrice,
        totalQuantity: lotSize,
        transmit: true
      }
      console.log({ orderId, contract, order })
      ib.placeOrder(orderId, contract, order)
    })

    ib.on(EventName.openOrderEnd, (...args) => {
      ib.removeAllListeners(EventName.openOrderEnd)
      ib.removeAllListeners(EventName.nextValidId)
      ib.removeAllListeners(EventName.error)
      resolve('done')
    })

    ib.on(EventName.error, (...args) => {
      console.log('EventName.error: ', args)
    })

    ib.reqIds()
  })
}
