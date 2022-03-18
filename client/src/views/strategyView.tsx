import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import {
  BuyStrategyType,
  IStrategyResponse,
  SellStrategyType
} from '../../../common'
import { useRequest } from '../hooks/request'
import { OptionGroup } from '../components/shared/optionGroup'
import { StrategyResponse } from '../components/strategyResponse'
import { Card } from '../components/shared/card'

export function StrategyView() {
  const requestSymbols = useRequest<{ symbol: string }[]>()
  const runStrategy = useRequest<IStrategyResponse>()

  const [results, setResults] = useState<IStrategyResponse>([])

  const [startingPortfolioBalance, setStartingPortfolioBalance] =
    useState(50000)
  const [maxPositionPerTrade, setMaxPositionPerTrade] = useState(1000)
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
  const [symbol, setSymbol] = useState<string | undefined>('MSFT')

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
        closeOutNMinutesBeforeMarketClose,
        buyStrategy: selectedBuyStrategy,
        sellStrategy: selectedSellStrategy,
        startingPortfolioBalance,
        maxPositionPerTrade
      }
    })

    setResults(strategyRun)
  }

  return (
    <>
      <Card>
        <h4 className="text-white mb-[5px] font-bold text-[22px]">Portfolio</h4>

        <h5 className="text-white mb-[5px] text-[14px]">Starting Value</h5>
        <input
          type="text"
          className="p-[5px] mb-[10px] text-black"
          value={startingPortfolioBalance}
          onChange={(e) =>
            setStartingPortfolioBalance(parseInt(e.target.value))
          }
        />

        <h5 className="text-white mb-[5px] text-[14px]">
          Max Position per Trade
        </h5>
        <input
          type="text"
          className="p-[5px] text-black"
          value={maxPositionPerTrade}
          onChange={(e) => setMaxPositionPerTrade(parseInt(e.target.value))}
        />
      </Card>

      <Card>
        <main>
          <h4 className="text-white mb-[5px] font-bold text-[22px]">
            Entry & Exit
          </h4>

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
              <OptionGroup
                options={requestSymbols.data.map((data) => data.symbol)}
                value={symbol}
                onUpdate={(value) => setSymbol(value)}
              />
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
      </Card>

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
