import React, { useEffect } from 'react'
import { useRequest } from '../hooks/request'
import { Card } from '../components/shared/card'
import HistoryChart from '../components/historyChart'

// TODO: get the last day of data and display it
export function HistoryView() {
  // ! hard type this with Bar[]
  const historicalBarsRequest = useRequest<{ bars: any[] }>()

  useEffect(() => {
    historicalBarsRequest.call(
      `/bars/MSFT?startDate='2021-12-27'&endDate='2021-12-30'`
    )
  }, [])

  return (
    <>
      {historicalBarsRequest.requestStatus === 'success' && (
        <Card>
          <HistoryChart data={historicalBarsRequest.data.bars} />
        </Card>
      )}
    </>
  )
}
