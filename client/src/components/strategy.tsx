import React, { useEffect, useState } from 'react'
import { useRequest } from '../hooks/request'

export function Strategy() {
  const _useRequest = useRequest<{ symbols: string[] }>()

  const [symbolSelection, setSymbolSelection] = useState<string>('')

  useEffect(() => {
    _useRequest.call('/symbols')
    // on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <h1 className="text-[28px] font-bold">Stategy</h1>

      <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px]">
        <h3 className="text-[20px]">Buy</h3>

        <select value="" className="border">
          <option>1 MIN ORB</option>
          <option>5 MIN ORB</option>
          <option>10 MIN ORB</option>
          <option>15 MIN ORB</option>
          <option>30 MIN ORB</option>
          <option>60 MIN ORB</option>
        </select>
      </section>

      <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px] flex flex-col">
        <h3 className="text-[20px]">Sell</h3>

        <select className="border">
          <option>2 MIN SMA DROP</option>
          <option>3 MIN SMA DROP</option>
          <option>4 MIN SMA DROP</option>
          <option>5 MIN SMA DROP</option>
          <option>10 MIN SMA DROP</option>
          <option>20 MIN SMA DROP</option>
          <option>30 MIN SMA DROP</option>
          <option>60 MIN SMA DROP</option>
        </select>

        <label className="flex items-center mt-[10px]">
          <input type="radio" className="mr-[5px]" />
          <p>Sell 30 minutes before trading day close</p>
        </label>
        <small className="text-[10px] text-gray-400">
          Only if sell condition has not been hit
        </small>
      </section>

      <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px]">
        <h3 className="text-[20px]">Selection</h3>

        {_useRequest.requestStatus === 'success' ? (
          <select
            value={symbolSelection}
            onChange={(e) => setSymbolSelection(e.target.value)}
            className="border"
          >
            {_useRequest.data.symbols.map((symbol) => (
              <option value={symbol}>{symbol}</option>
            ))}
          </select>
        ) : (
          'Loading...'
        )}
      </section>

      <button className="border bg-green-300 p-[10px] rounded-[10px] mb-[10px]">
        Run It
      </button>

      <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px]">
        <h3 className="text-[20px]">Result</h3>
      </section>
    </>
  )
}
