import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useRequest } from '../hooks/request'

export function SymbolsList() {
  const _useRequest = useRequest<{ symbol: string; count: number }[]>()

  useEffect(() => {
    _useRequest.call('/symbols?withCount=true')
    // on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  console.log({ data: _useRequest.data })

  return (
    <main>
      <h2>SymbolsList</h2>
      {_useRequest.requestStatus === 'success' ? (
        <ul className="flex flex-col">
          {_useRequest.data.map((data) => (
            <Link
              to={`/bars/${data.symbol}`}
              className="shadow-md rounded-[3px] mb-[5px] p-[10px] border-collapse flex justify-between items-center"
            >
              <span>{data.symbol}</span>
              <span className="text-[12px]">{data.count}</span>
            </Link>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  )
}
