import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import {
  BuyStrategyType,
  IStrategyResponse,
  SellStrategyType
} from '../../../common'
import { useRequest } from '../hooks/request'
import { OptionGroup } from './shared/optionGroup'
import { StrategyResponse } from './strategyResponse'

export function Strategy() {
  const requestSymbols = useRequest<{ symbol: string }[]>()
  const runStrategy = useRequest<IStrategyResponse>()

  const [results, setResults] = useState<IStrategyResponse>([])

  const [symbol, setSymbol] = useState<string>('MSFT')
  // TODO implement
  const [
    closeOutNMinutesBeforeMarketClose,
    setCloseOutNMinutesBeforeMarketClose
  ] = useState<number>(30)
  const [selectedBuyStrategy, setSelectedBuyStrategy] = useState<
    BuyStrategyType | undefined
  >('ORB Long')
  const [selectedSellStrategy, setSelectedSellStrategy] = useState<
    SellStrategyType | undefined
  >('SMA Drop')

  console.log(selectedBuyStrategy)

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
        lotSize: 100,
        closeOutNMinutesBeforeMarketClose,
        buyStrategy: selectedBuyStrategy,
        sellStrategy: selectedSellStrategy
      }
    })

    console.log({ strategyRun })
    setResults(strategyRun)
  }

  return (
    <>
      <section className="shadow-md border p-[20px] mb-[10px] rounded-[5px] bg-[#333] border-stone-700">
        <main>
          <section className="flex justify-between mb-[20px]">
            <div>
              <h4 className="text-white mb-[5px] font-bold text-[14px]">
                Buy Strategy
              </h4>
              <OptionGroup
                value={selectedBuyStrategy}
                options={['ORB Long', 'Increasing Bars']}
                onUpdate={(newValue) => setSelectedBuyStrategy(newValue)}
              />
            </div>

            <div>
              <h4 className="text-white mb-[5px] font-bold text-[14px]">
                Sell Strategy
              </h4>
              <OptionGroup
                value={selectedSellStrategy}
                options={['SMA Drop', 'Decreasing Bars']}
                onUpdate={(newValue) => setSelectedSellStrategy(newValue)}
              />
            </div>
          </section>

          <section className="mb-[20px]">
            <h3 className="text-white mb-[5px] font-bold text-[14px]">
              Close Out
            </h3>
            <p className="text-white">
              <select
                className="text-black mr-[5px]"
                onChange={(e) =>
                  setCloseOutNMinutesBeforeMarketClose(parseInt(e.target.value))
                }
                value={closeOutNMinutesBeforeMarketClose}
              >
                {[5, 10, 15, 30, 60].map((nMinutes) => (
                  <option value={nMinutes}>{nMinutes}</option>
                ))}
              </select>
              minutes before market close
            </p>
          </section>

          <section className="mb-[20px]">
            <h3 className="text-white mb-[5px] font-bold text-[14px]">
              Symbol
            </h3>
            {requestSymbols.requestStatus === 'success' ? (
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="border w-full p-[10px] text-center"
              >
                {requestSymbols.data.map((data) => (
                  <option value={data.symbol}>{data.symbol}</option>
                ))}
              </select>
            ) : (
              'Loading...'
            )}
          </section>
        </main>

        <button
          className={classNames('p-[10px] rounded-[10px] text-white', {
            'bg-green-400': runStrategy.requestStatus !== 'in-progress',
            'bg-gray-400': runStrategy.requestStatus === 'in-progress'
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
          {results.map((result) => (
            <StrategyResponse strategies={result} />
          ))}
        </section>
      )}
    </>
  )
}
