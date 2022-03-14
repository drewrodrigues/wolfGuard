import { EventName } from '@stoqey/ib'
import { initConnection } from './ib'

// TODO: clear listeners
export async function getOpenOrders(): Promise<any[]> {
  console.log('getOpenOrders')
  const ib = await initConnection()
  return new Promise((resolve) => {
    function resolveFn(...args: any[]) {
      console.log('EventName.openOrder')
      ib.removeListener(EventName.openOrder, resolveFn)
      resolve(args)
    }

    function noOrderResolvefn() {
      console.log('EventName.openOrderEnd')
      ib.removeListener(EventName.openOrderEnd, noOrderResolvefn)
      resolve([])
    }

    ib.on(EventName.openOrder, resolveFn)
    ib.on(EventName.openOrderEnd, noOrderResolvefn)
    ib.reqAllOpenOrders()
  })
}
