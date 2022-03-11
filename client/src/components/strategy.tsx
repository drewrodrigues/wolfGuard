import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { IStrategyResponse } from '../../../common'
import { useRequest } from '../hooks/request'
import { StrategyResponse } from './strategyResponse'

const ORB_BUY_DURATIONS = [1, 5, 10, 15, 30]
const SMA_SELL_DROP_DURATIONS = [3, 4, 5, 10, 20, 30, 60]
const WITHIN_LAST_N_TRADING_DAYS = [7, 15, 30, 60, 90, 180, 365, 500, 1000]

export function Strategy() {
  const requestSymbols = useRequest<{ symbol: string }[]>()
  const runStrategy = useRequest<IStrategyResponse>()

  const [results, setResults] = useState<IStrategyResponse>([])

  const [symbol, setSymbol] = useState<string>('MSFT')
  // TODO implement
  const [sellBeforeClose, setSellBeforeClose] = useState<number>(30)

  const [orbBuyDuration, setOrbBuyDuration] = useState(1)
  const [nLastTradingDays, setNLastTradingDays] = useState(
    WITHIN_LAST_N_TRADING_DAYS[0]
  )
  const [smaSellDropDuration, setSellSmaDropDuration] = useState(3)

  useEffect(() => {
    requestSymbols.call('/symbols')
    // on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onRunAllCombinations() {
    setResults([])

    const strategyRun = await runStrategy.call('/strategy', {
      method: 'POST',
      data: {
        symbol,
        lotSize: 100
      }
    })
    setResults(strategyRun)
  }

  return (
    <>
      <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px] bg-[#333] border-stone-700 flex justify-between items-center">
        <main>
          <h3 className="text-white">Selection</h3>

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
        </main>

        <button
          className={classNames({
            'bg-green-300 p-[10px] rounded-[10px]':
              runStrategy.requestStatus !== 'in-progress',
            'bg-gray-300 p-[10px] rounded-[10px]':
              runStrategy.requestStatus === 'in-progress'
          })}
          onClick={onRunAllCombinations}
        >
          {runStrategy.requestStatus === 'in-progress'
            ? 'Running All Combination...'
            : 'Run All Combinations'}
        </button>
      </section>

      {results.length > 0 && (
        <section className="mb-[10px]">
          <h3 className="text-[20px] font-bold">Results</h3>

          {results.map((result) => (
            <StrategyResponse strategies={result} />
          ))}
        </section>
      )}
    </>
  )
}
