import React, { useEffect } from 'react'
import { useRequest } from '../hooks/request'

export function PredictionsView() {
  const barsQuery = useRequest<{ symbol: string; count: number }[]>()

  useEffect(() => {
    barsQuery.call('/symbols?type=1 D&withCount=true')
  }, [])

  return (
    <>
      {barsQuery.requestStatus === 'success' && (
        <ul className="flex flex-col">
          {barsQuery.data.map((data) => (
            <div className="shadow-md rounded-[3px] mb-[5px] p-[10px] border-collapse flex justify-between items-center bg-[#333] text-white border border-stone-700">
              <span>{data.symbol}</span>
              <span className="text-[12px]">{data.count}</span>
            </div>
          ))}
        </ul>
      )}
    </>
  )
}
