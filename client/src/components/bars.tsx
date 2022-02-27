import moment from 'moment'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useRequest } from '../hooks/request'

export function Bars() {
  const params = useParams()
  const _useRequest = useRequest<{ bars: any[] }>()

  useEffect(() => {
    _useRequest.call(`/bars/${params.symbol}`)
    // on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main>
      <h2>Bars</h2>
      {_useRequest.requestStatus === 'success' ? (
        <ul>
          {_useRequest.data.bars.map((bar) => (
            <li className="shadow rounded-[5px] mb-[5px] p-[10px] text-[10px]">
              <p>
                time:{' '}
                {moment(bar.time)
                  .zone('America/New_York')
                  .format('MM/DD/YYYY, h:mm:ss a')}
              </p>
              <p>high: {bar.high}</p>
              <p>low: {bar.low}</p>
              <p>close: {bar.close}</p>
              <p>open: {bar.open}</p>
              <p>type: {bar.type}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading</p>
      )}
    </main>
  )
}
