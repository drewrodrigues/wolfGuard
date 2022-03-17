import React, { useState } from 'react'
import { useRequest } from '../hooks/request'

export function CacheView() {
  const _useRequest = useRequest()
  const [symbol, setSymbol] = useState('')
  const [exchange, setExchange] = useState('SMART')

  function onCache() {
    _useRequest.call(`/barsCache/${symbol}`, {
      data: { exchange },
      method: 'POST'
    })
  }

  return (
    <main className="flex flex-col">
      <h2>Cache</h2>

      <section className="flex justify-between mb-[10px]">
        <input
          type="text"
          placeholder="MSFT"
          onChange={(e) => setSymbol(e.target.value)}
          value={symbol}
          className="border p-[10px] flex-1"
        />
        <select
          name=""
          id=""
          className="border px-[10px]"
          onChange={(e) => setExchange(e.target.value)}
          value={exchange}
        >
          <option value="SMART">SMART</option>
          <option value="NASDAQ">NASDAQ</option>
        </select>
      </section>

      <button
        onClick={onCache}
        className={
          _useRequest.requestStatus === 'in-progress'
            ? 'p-[10px] bg-gray-400'
            : 'bg-green-300 p-[10px]'
        }
      >
        {_useRequest.requestStatus === 'in-progress'
          ? 'Getting Bars & Caching...'
          : 'Get Bars & Cache'}
      </button>
    </main>
  )
}
