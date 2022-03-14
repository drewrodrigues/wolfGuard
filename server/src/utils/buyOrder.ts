import {
  Contract,
  EventName,
  Order,
  OrderAction,
  OrderType,
  SecType
} from '@stoqey/ib'
import { initConnection } from '../access/ib'

export async function buyOrder() {
  // TODO: ensure we don't have any open buy orders first
  const ib = await initConnection()

  ib.on(EventName.completedOrder, (args) => {
    console.log('completedOrder: ', args)
  })
  ib.on(EventName.orderStatus, (args) => {
    console.log('orderStatus: ', args)
  })
  ib.on(EventName.all, (name, args) => {
    if (
      name !== EventName.historicalDataUpdate &&
      name !== EventName.received
    ) {
      console.log(name, args)
    }
  })
  ib.once(EventName.nextValidId, (orderId: number) => {
    const contract: Contract = {
      symbol: 'MSFT',
      exchange: 'SMART',
      currency: 'USD',
      secType: SecType.STK
    }
    // const lotSize = Math.floor(1000 / lastBar.close)
    const lotSize = 3
    const order: Order = {
      orderType: OrderType.LMT,
      action: OrderAction.BUY,
      // lmtPrice: lastBar.close,
      lmtPrice: 20,
      totalQuantity: lotSize,
      orderId,
      transmit: true
    }
    ib.placeOrder(orderId, contract, order)
  })
  ib.reqIds()
  // TODO: add a good til of only a few seconds in case it doesn't get filled with strategy
}
