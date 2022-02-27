import IBApi, { EventName } from "@stoqey/ib";

let ib: IBApi;

export function initConnection(): Promise<IBApi> {
  return new Promise((resolve, reject) => {
    console.log('initConnection');
    ib = new IBApi({
      port: 7497,
    });
    ib.connect();
    ib.once(EventName.connected, () => {
      resolve(ib);
    });
    ib.once(EventName.disconnected, () => {
      reject('Not connected');
    });
  })
}