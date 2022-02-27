import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useRequest } from '../hooks/request'

export function SymbolsList() {
  const _useRequest = useRequest<{ symbols: string[] }>()

  useEffect(() => {
    _useRequest.call('/symbols')
    // on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  console.log({ data: _useRequest.data })

  return (
    <main>
      <h2>SymbolsList</h2>
      {_useRequest.requestStatus === 'success' ? (
        <ul className="flex flex-col">
          {_useRequest.data.symbols.map((symbol) => (
            <Link
              to={`/bars/${symbol}`}
              className="shadow-md rounded-[3px] mb-[5px] p-[10px] border-collapse"
            >
              {symbol}
            </Link>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  )
}
