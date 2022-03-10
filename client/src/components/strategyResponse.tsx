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
  strategies: { strategyResult, buyStrategy, sellStrategy, setup }
}: IStrategyResponseProps) {
  return (
    <main className="w-full rounded-[5px] mb-[10px]">
      <header className="text-[12px] flex justify-between">
        <h2>
          Buy Strategy: <span className="font-bold">{buyStrategy} ORB</span>
        </h2>
        <h2>
          Sell Strategy:{' '}
          <span className="font-bold">{sellStrategy} SMA drop</span>
        </h2>
      </header>

      <div className="flex flex-wrap justify-between mx-[-10px]">
        {strategyResult.map((result) => {
          if (!result) return null

          return (
            <>
              <div
                className={classnames(
                  'p-[10px] rounded-[5px] mb-[10px] flex-1 text-[12px] mx-[10px] relative',
                  {
                    'bg-red-400 text-red-900': result.overallSummary.value < 0,
                    'bg-green-400 text-green-900':
                      result.overallSummary.value > 0
                  }
                )}
              >
                <p className="font-bold text-[22px]">
                  {dollarFormatter.format(result.overallSummary.value)}
                </p>
                <p>
                  {dollarFormatter.format(
                    result.overallSummary.averageValuePerDay
                  )}
                </p>
                <p>
                  Success rate:{' '}
                  {`${(result.overallSummary.successRate * 100).toFixed(0)}%`}
                </p>
                <p>
                  biggestWin:{' '}
                  {dollarFormatter.format(result.overallSummary.biggestWin)}
                </p>
                <p>
                  biggestLoss:{' '}
                  {dollarFormatter.format(result.overallSummary.biggestLoss)}
                </p>
                <p>
                  daysTradedRate:{' '}
                  {`${(result.overallSummary.daysTradedRate * 100).toFixed(
                    0
                  )}%`}
                </p>
                <p>
                  averagePosition:{' '}
                  {dollarFormatter.format(
                    result.overallSummary.averagePosition
                  )}
                </p>
                <p className="absolute top-[10px] right-[10px] text-[10px] opacity-50">
                  Last {result.nTradingDays} days
                </p>
              </div>
            </>
          )
        })}
      </div>
    </main>
  )
}
