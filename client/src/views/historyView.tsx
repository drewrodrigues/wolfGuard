import React, { useEffect } from 'react'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip
} from 'chart.js'
import { useRequest } from '../hooks/request'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

// TODO: get the last day of data and display it
export function HistoryView() {
  // ! hard type this with Bar[]
  const historicalBarsRequest = useRequest<{ bars: any[] }>()

  useEffect(() => {
    historicalBarsRequest.call(
      `/bars/MSFT?startDate='2020-12-28'&endDate='2020-12-29'`
    )
  }, [])

  let data

  if (historicalBarsRequest.requestStatus === 'success') {
    data = {
      labels: historicalBarsRequest.data.bars.map((bar) => bar.time),
      datasets: [
        {
          data: Object.values(historicalBarsRequest.data.bars).map(
            (liveBar) => liveBar.close
          ),
          backgroundColor: 'rgb(248 113 113)'
        }
      ]
    }
  }

  return (
    <>
      {data && (
        <Bar
          data={data}
          options={{
            scales: {
              x: { display: false },
              y: {
                beginAtZero: false,
                grid: { drawBorder: true, color: '#777' }
              }
            }
          }}
        />
      )}
    </>
  )
}
