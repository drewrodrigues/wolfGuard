import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip
} from 'chart.js'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { LiveBar } from '../../../common'
import { useSocket } from '../hooks/useSocket'
import { dollarFormatter } from './strategyResponse'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export function Trader() {
  const { socketStatus, socket } = useSocket()
  const [liveData, setLiveData] = useState<{
    bars: LiveBar[]
    recentBars: LiveBar[]
    currentPrice: number
  }>({ bars: [], currentPrice: 0, recentBars: [] })

  useEffect(() => {
    if (socketStatus === 'connected') {
      console.log('Listening for barUpdate')
      socket.on<any>('barUpdate', (arg: any) => {
        console.log('Received `barUpdate`')
        console.log(arg)
        setLiveData(arg)
      })
    }
  }, [socketStatus])

  const data = {
    labels: liveData.bars.map((bar) => bar.time),
    datasets: [
      {
        data: Object.values(liveData.bars).map((liveBar) => liveBar.close),
        backgroundColor: 'red'
      }
    ]
  }
  const recentData = {
    labels: liveData.recentBars.map((bar) => bar.time),
    datasets: [
      {
        data: Object.values(liveData.recentBars).map(
          (liveBar) => liveBar.close
        ),
        backgroundColor: 'red'
      }
    ]
  }

  console.log({ data: liveData })

  return (
    <main>
      <header className="flex justify-between items-center">
        <h2
          className={classNames({
            'text-green-400': socketStatus === 'connected',
            'text-red-400': socketStatus !== 'connected'
          })}
        >
          Socket status: {socketStatus}
        </h2>
        <h3 className="text-white font-bold text-[32px]">
          {dollarFormatter.format(liveData.currentPrice)}
        </h3>
      </header>

      <div className="mb-[20px] bg-[#333] border-stone-700 p-[20px] rounded-[5px]">
        <h2 className="font-bold text-white mb-[10px]">Recent (30 mins)</h2>
        <Bar
          data={recentData}
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
      </div>

      <div className="mb-[20px] bg-[#333] border-stone-700 p-[20px] rounded-[5px]">
        <h2 className="font-bold text-white mb-[10px]">Full day</h2>
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
      </div>
    </main>
  )
}
