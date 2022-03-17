import {
  Contract,
  EventName,
  Order,
  OrderAction,
  OrderType,
  SecType
} from '@stoqey/ib'
import { initConnection } from '../access/ib'

// ? add a good til of only a few seconds in case it doesn't get filled with strategy

// ? maybe add a callback which gives back the order so we can store it temporarily?

// TODO: type this and resolve it correctly
export async function buyOrder(entryPrice: number, lotSize: number) {
  const ib = await initConnection()

  return new Promise((resolve) => {
    ib.once(EventName.nextValidId, (orderId: number) => {
      const contract: Contract = {
        symbol: 'BYND', // TODO: fix to pick correct symbol
        exchange: 'SMART',
        currency: 'USD',
        secType: SecType.STK
      }
      const order: Order = {
        // orderType: OrderType.LMT,
        // TODO: make this only be open for a period of time in case it's not filled
        // ! market order is being placed too high...
        // ! but LMT order is sometimes not filled
        orderType: OrderType.LMT,
        action: OrderAction.BUY,
        lmtPrice: entryPrice,
        // auxPrice: entryPrice,
        totalQuantity: lotSize,
        orderId,
        transmit: true
      }
      ib.placeOrder(orderId, contract, order)
    })

    ib.on(EventName.openOrderEnd, (...args) => {
      console.log('EventName.openOrderEnd')
      ib.removeAllListeners(EventName.openOrderEnd)
      ib.removeAllListeners(EventName.nextValidId)
      resolve('done')
    })

    ib.reqIds()
  })
}
