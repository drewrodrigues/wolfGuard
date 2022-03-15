import IBApi, { EventName } from '@stoqey/ib'

let ib: IBApi

export function initConnection(): Promise<IBApi> {
  return new Promise((resolve, reject) => {
    const noInstance = !ib
    if (noInstance) {
      console.log('ib initConnection(): No instance, creating a new one')
      ib = new IBApi({
        port: 7497
      })
    }

    const notConnected = !ib.isConnected
    if (notConnected) {
      console.log('ib initConnection(): Not connected, connecting')
      ib.once(EventName.connected, () => {
        console.log('ib initConnection(): Successfully connected')
        resolve(ib)
      })
      ib.once(EventName.disconnected, () => {
        reject('ib initConnection(): Disconnected')
      })
      ib.connect()
    } else {
      console.log('ib initConnection(): Already connected')
      resolve(ib)
    }
  })
}
