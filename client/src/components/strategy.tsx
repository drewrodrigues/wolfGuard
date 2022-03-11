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
      <h1 className="text-[28px] font-bold">Stategy</h1>

      {false && (
        <>
          <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px]">
            <h3 className="text-[20px]">Buy</h3>

            <select
              className="border"
              value={orbBuyDuration}
              onChange={(e) => setOrbBuyDuration(parseInt(e.target.value))}
            >
              {ORB_BUY_DURATIONS.map((ORB_BUY) => (
                <option value={ORB_BUY}>{ORB_BUY} MIN ORB</option>
              ))}
            </select>
          </section>

          <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px] flex flex-col">
            <h3 className="text-[20px]">Sell</h3>

            <select
              className="border"
              value={smaSellDropDuration}
              onChange={(e) => setSellSmaDropDuration(parseInt(e.target.value))}
            >
              {SMA_SELL_DROP_DURATIONS.map((SMA_SELL_DROP) => (
                <option value={SMA_SELL_DROP}>
                  {SMA_SELL_DROP} MIN SMA DROP
                </option>
              ))}
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
            <h3 className="text-[20px]">Options</h3>

            <label>
              <select
                className="border mr-[10px]"
                onChange={(e) => setNLastTradingDays(parseInt(e.target.value))}
                value={nLastTradingDays}
              >
                {WITHIN_LAST_N_TRADING_DAYS.map((N_TRADING_DAYS) => (
                  <option value={N_TRADING_DAYS}>{N_TRADING_DAYS}</option>
                ))}
              </select>
              last trading days
            </label>
          </section>
        </>
      )}

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
        className={classNames({
          'bg-green-300 p-[10px] rounded-[10px] mb-[10px]':
            runStrategy.requestStatus !== 'in-progress',
          'bg-gray-300 p-[10px] rounded-[10px] mb-[10px]':
            runStrategy.requestStatus === 'in-progress'
        })}
        onClick={onRunAllCombinations}
      >
        {runStrategy.requestStatus === 'in-progress'
          ? 'Running All Combination...'
          : 'Run All Combinations'}
      </button>

      <section className="mb-[10px]">
        <h3 className="text-[20px] font-bold">Results</h3>

        {results.map((result) => (
          <StrategyResponse strategies={result} />
        ))}
      </section>
    </>
  )
}
