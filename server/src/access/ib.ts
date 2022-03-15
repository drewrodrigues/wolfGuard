import IBApi, { EventName } from '@stoqey/ib'

const logFunction = (functionName: string) => {
  console.log(`${functionName}()`)
  return (log: string) => {
    console.log(`${functionName}(): ${log}`)
  }
}

let ib: IBApi

export function initConnection(): Promise<IBApi> {
  return new Promise((resolve, reject) => {
    const logFn = logFunction('initConnection')

    const notConnected = !ib?.isConnected
    if (notConnected) {
      logFn('Not connected. Connecting.')
      ib = new IBApi({
        port: 7497
      })
      ib.once(EventName.connected, () => {
        logFn('Connected')
        resolve(ib)
      })
      ib.once(EventName.disconnected, () => {
        reject('Not connected')
      })
      ib.connect()
    } else {
      logFn('Is connected.')
      resolve(ib)
    }
  })
}
