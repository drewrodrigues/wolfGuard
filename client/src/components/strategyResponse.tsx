import classnames from 'classnames'
import React from 'react'
import { IStrategy } from '../../../common'

const dollarFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  signDisplay: 'auto'
})
interface IStrategyResponseProps {
  strategies: IStrategy
}

export function StrategyResponse({
  strategies: { runs, buyStrategy, sellStrategy }
}: IStrategyResponseProps) {
  return (
    <main className="w-full">
      <header>
        <h2>Buy Strategy: {buyStrategy} ORB</h2>
        <h2>Sell Strategy: {sellStrategy} SMA drop</h2>
      </header>

      <div className="flex flex-wrap justify-between">
        {runs.map((run) => (
          <div
            className={classnames(
              'p-[10px] rounded-[5px] mb-[10px] w-[10.5%] text-[12px]',
              {
                'bg-red-400 text-red-900': run.overallSummary.value < 0,
                'bg-green-400 text-green-900': run.overallSummary.value > 0
              }
            )}
          >
            <p>Value: {dollarFormatter.format(run.overallSummary.value)}</p>
            <p>
              Success rate:{' '}
              {`${(run.overallSummary.successRate * 100).toFixed(0)}%`}
            </p>
            <p>symbol: {run.setup.symbol}</p>
            <p>orbBuyDuration: {run.setup.orbBuyDuration} m</p>
            <p>smaSellDuration: {run.setup.smaSellDuration} m</p>
            <p>lotSize: {run.setup.lotSize}</p>
            <p>
              biggestWin:{' '}
              {dollarFormatter.format(run.overallSummary.biggestWin)}
            </p>
            <p>
              biggestLoss:{' '}
              {dollarFormatter.format(run.overallSummary.biggestLoss)}
            </p>
            <p>
              daysTradedRate:{' '}
              {`${(run.overallSummary.daysTradedRate * 100).toFixed(0)}%`}
            </p>
            <p>
              averagePosition:{' '}
              {dollarFormatter.format(run.overallSummary.averagePosition)}
            </p>
            <p>nLastTradingDays: {run.setup.nLastTradingDays}</p>
            <p>lowestAccountBalance: ?</p>
            <p>highestAccountBalance: ?</p>
            <p>endingAccountBalance: ?</p>
          </div>
        ))}
      </div>
    </main>
  )
}
