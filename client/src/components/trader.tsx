import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip
} from 'chart.js'
import classNames from 'classnames'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { LiveBar, OpenOrder, OpenPosition } from '../../../common'
import { useSocket } from '../hooks/useSocket'
import { dollarFormatter } from './strategyResponse'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const MARKET_OPEN = moment('9:30am', 'h:mma')
const MARKET_CLOSE = moment('4:00pm', 'h:mma')

export function Trader() {
  const [liveData, setLiveData] = useState<{
    // TODO: pull to common to use for socket and client
    bars: LiveBar[]
    recentBars: LiveBar[]
    currentPrice: number
    shouldBuy: boolean | undefined
    openOrders: OpenOrder[]
    openPositions: OpenPosition[]
  }>({
    bars: [],
    currentPrice: 0,
    recentBars: [],
    shouldBuy: undefined,
    openOrders: [],
    openPositions: []
  })

  const { socketStatus, socket } = useSocket()
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

  const marketTime = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York'
  })

  const data = {
    labels: liveData.bars.map((bar) => bar.time),
    datasets: [
      {
        data: Object.values(liveData.bars).map((liveBar) => liveBar.close),
        backgroundColor: 'rgb(248 113 113)'
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
        backgroundColor: 'rgb(248 113 113)'
      }
    ]
  }

  const isMarketOpen = moment(marketTime).isBetween(MARKET_OPEN, MARKET_CLOSE)

  return (
    <main>
      <header className="flex justify-between items-center">
        <h2
          className={classNames('align-center', {
            'text-green-400': socketStatus === 'connected',
            'text-red-400': socketStatus !== 'connected'
          })}
        >
          {socketStatus === 'connected' ? '✅ ' : '❌  '}
          Socket <span className="font-bold">{socketStatus}</span>
        </h2>
        <h3 className="text-white font-bold text-[32px]">
          {dollarFormatter.format(liveData.currentPrice)}
        </h3>
      </header>

      <h4
        className={classNames('mb-[20px]', {
          'text-green-400': isMarketOpen,
          'text-red-400': !isMarketOpen
        })}
      >
        {isMarketOpen ? '📈 Market Open ' : '❌ Market Closed '}
        <span className="font-bold">{moment(marketTime).format('h:mm A')}</span>
      </h4>

      <div className="mb-[20px] bg-[#333] shadow-md border border-stone-700 p-[20px] rounded-[5px] text-white">
        <h2 className="font-bold text-white mb-[10px]">Open Positions</h2>

        {/* // TODO: color based upon current position */}
        {liveData.openPositions.map((position) => (
          <div
            className="border border-green-700 px-[10px] py-[5px] rounded-[5px] bg-green-400 flex justify-between shadow-md"
            key={`openPosition-${position.contract.conId}`}
          >
            <p>
              <span className="font-bold">{`${position.contract.symbol} `}</span>
              {position.lotSize} @
              {position.averageCost &&
                ` ${dollarFormatter.format(position.averageCost)}`}
            </p>

            {position.averageCost && (
              <p>
                {dollarFormatter.format(
                  position.averageCost * position.lotSize
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mb-[20px] bg-[#333] shadow-md border border-stone-700 p-[20px] rounded-[5px] text-white">
        <h2 className="font-bold text-white mb-[10px]">Open Orders</h2>

        {liveData.openOrders.map((openOrder) => (
          <div
            className={classNames(
              'border px-[10px] py-[5px] rounded-[5px]  flex justify-between shadow-md',
              {
                'bg-red-400 border-red-700': openOrder.order.action === 'SELL',
                'bg-green-400 border-green-700':
                  openOrder.order.action === 'BUY'
              }
            )}
            key={`openOrder-${openOrder.contract.conId}`}
          >
            <p>
              {`${openOrder.order.action} `}
              {openOrder.order.totalQuantity}
              <span className="font-bold">{` ${openOrder.contract.symbol} `}</span>
              @
              {openOrder.order.lmtPrice &&
                ` ${dollarFormatter.format(openOrder.order.lmtPrice)}`}
            </p>

            {openOrder.order.lmtPrice && openOrder.order.totalQuantity && (
              <p>
                {dollarFormatter.format(
                  openOrder.order.lmtPrice * openOrder.order.totalQuantity
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      <h2 className="font-bold text-white mb-[10px]">Recent (30m)</h2>
      <div className="mb-[20px] bg-[#333] shadow-md border border-stone-700 p-[20px] rounded-[5px]">
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

      <h2 className="font-bold text-white mb-[10px]">Full day</h2>
      <div className="mb-[20px] bg-[#333] shadow-md border border-stone-700 p-[20px] rounded-[5px]">
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
