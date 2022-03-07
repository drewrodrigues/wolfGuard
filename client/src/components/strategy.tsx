import React, { useEffect, useState } from 'react'
import { useRequest } from '../hooks/request'
import { StrategyResponse } from './strategyResponse'

export interface IStrategyResponse {
  overallSummary: {
    value: number
    winningTrades: number
    losingTrades: number
    tradingDays: number
    nonTradingDays: number
    daysTradedRate: number
    sellTypes: { 'close-out': number; 'sma-drop': number }
    successRate: number
    biggestWin: number
    biggestLoss: number
    averagePosition: number
  }
  setup: {
    symbol: number
    orbBuyDuration: number
    smaSellDuration: number
    lotSize: number
  }
  orders: object[]
}

const ORB_BUY_DURATIONS = [1, 5, 10, 15, 30]
const SMA_SELL_DROP_DURATIONS = [3, 4, 5, 10, 20, 30, 60]

export function Strategy() {
  const requestSymbols = useRequest<{ symbol: string }[]>()
  const runStrategy = useRequest<IStrategyResponse>()

  const [results, setResults] = useState<IStrategyResponse[]>([])

  const [symbol, setSymbol] = useState<string>('MSFT')
  // TODO implement
  const [sellBeforeClose, setSellBeforeClose] = useState<number>(30)

  const [orbBuyDuration, setOrbBuyDuration] = useState(1)
  const [smaSellDropDuration, setSellSmaDropDuration] = useState(3)

  useEffect(() => {
    requestSymbols.call('/symbols')
    // on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onRunStrategy() {
    const strategyRun = await runStrategy.call('/strategy', {
      method: 'POST',
      data: {
        symbol,
        orbBuyDuration,
        smaSellDuration: smaSellDropDuration,
        lotSize: 100
      }
    })
    setResults((p) => [...p, strategyRun])
    console.log({ strategyRun })
  }

  async function onRunAllCombinations() {
    ORB_BUY_DURATIONS.forEach((orbBuy) => {
      SMA_SELL_DROP_DURATIONS.forEach(async (smaSell) => {
        const strategyRun = await runStrategy.call('/strategy', {
          method: 'POST',
          data: {
            symbol,
            orbBuyDuration: orbBuy,
            smaSellDuration: smaSell,
            lotSize: 100
          }
        })
        setResults((p) => [strategyRun, ...p])
        console.log({ strategyRun })
      })
    })
  }

  return (
    <>
      <h1 className="text-[28px] font-bold">Stategy</h1>

      <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px]">
        <h3 className="text-[20px]">Buy</h3>

        <select
          className="border"
          value={orbBuyDuration}
          onChange={(e) => setOrbBuyDuration(parseInt(e.target.value))}
        >
          <option value={1}>1 MIN ORB</option>
          <option value={5}>5 MIN ORB</option>
          <option value={10}>10 MIN ORB</option>
          <option value={15}>15 MIN ORB</option>
          <option value={30}>30 MIN ORB</option>
          <option value={60}>60 MIN ORB</option>
          <option value={90}>90 MIN ORB</option>
          <option value={120}>120 MIN ORB</option>
          <option value={180}>180 MIN ORB</option>
        </select>
      </section>

      <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px] flex flex-col">
        <h3 className="text-[20px]">Sell</h3>

        <select
          className="border"
          value={smaSellDropDuration}
          onChange={(e) => setSellSmaDropDuration(parseInt(e.target.value))}
        >
          <option value={3}>3 MIN SMA DROP</option>
          <option value={4}>4 MIN SMA DROP</option>
          <option value={5}>5 MIN SMA DROP</option>
          <option value={10}>10 MIN SMA DROP</option>
          <option value={20}>20 MIN SMA DROP</option>
          <option value={30}>30 MIN SMA DROP</option>
          <option value={60}>60 MIN SMA DROP</option>
          <option value={90}>90 MIN SMA DROP</option>
          <option value={120}>120 MIN SMA DROP</option>
        </select>

        <label className="flex items-center mt-[10px]">
          <p>
            Sell
            <select
              className="border mx-[5px]"
              onChange={(e) => setSellBeforeClose(parseInt(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="60">60</option>
            </select>
            minutes before trading day close
          </p>
        </label>
        <small className="text-[10px] text-gray-400">
          Only if sell condition has not been hit
        </small>
      </section>

      <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px]">
        <h3 className="text-[20px]">Selection</h3>

        {requestSymbols.requestStatus === 'success' ? (
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="border"
          >
            {requestSymbols.data.map((data) => (
              <option value={data.symbol}>{data.symbol}</option>
            ))}
          </select>
        ) : (
          'Loading...'
        )}
      </section>

      <button
        className="bg-green-300 p-[10px] rounded-[10px] mb-[10px] mr-[5px]"
        onClick={onRunStrategy}
      >
        Run It
      </button>

      <button
        className="bg-green-300 p-[10px] rounded-[10px] mb-[10px]"
        onClick={onRunAllCombinations}
      >
        Run All Combinations
      </button>

      <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px]">
        <h3 className="text-[20px]">Results</h3>

        {results.map((result) => (
          <StrategyResponse strategy={result} />
        ))}
      </section>
    </>
  )
}
