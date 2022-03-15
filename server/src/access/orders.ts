import { EventName } from '@stoqey/ib'
import { OpenOrder, OpenPosition } from '../../../common'
import { initConnection } from './ib'

// TODO: clear listeners
export async function getOpenOrders(): Promise<OpenOrder[]> {
  const ib = await initConnection()
  return new Promise((resolve) => {
    const openOrders: Record<string, OpenOrder> = {}

    function addOpenOrder(...args: any[]) {
      const openOrder: OpenOrder = {
        orderId: args[0],
        contract: args[1],
        order: args[2],
        orderState: args[3]
      }
      openOrders[args[0]] = openOrder
    }

    function finishOpenOrders() {
      ib.removeListener(EventName.openOrder, addOpenOrder)
      ib.removeListener(EventName.openOrderEnd, finishOpenOrders)
      resolve(Object.values(openOrders))
    }

    ib.on(EventName.openOrder, addOpenOrder)
    ib.on(EventName.openOrderEnd, finishOpenOrders)

    ib.reqAllOpenOrders()
  })
}

export async function getPositions(): Promise<OpenPosition[]> {
  const ib = await initConnection()
  return new Promise((resolve) => {
    const openPositions: Record<string, OpenPosition> = {}

    function addOpenPosition(...args: any[]) {
      const positionClosed = args[2] === 0
      if (positionClosed) return

      const openPosition: OpenPosition = {
        account: args[0],
        contract: args[1],
        lotSize: args[2],
        averageCost: args[3]
      }
      openPositions[args[1].conId!] = openPosition
    }

    function finishOpenPositions() {
      ib.removeListener(EventName.position, addOpenPosition)
      ib.removeListener(EventName.positionEnd, finishOpenPositions)
      resolve(Object.values(openPositions))
    }

    ib.on(EventName.position, addOpenPosition)
    ib.on(EventName.positionEnd, finishOpenPositions)

    ib.reqPositions()
  })
}
