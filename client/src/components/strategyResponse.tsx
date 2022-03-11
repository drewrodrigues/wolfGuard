import classNames from 'classnames'
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
    <main className="rounded-[5px] mr-[5px] mb-[10px]">
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
        {strategyResult.map((result) => (
          <>
            <div
              className={classNames(
                'p-[10px] rounded-[5px] mr-[5px] mb-[10px] flex-1 text-[12px] mx-[10px] relative',
                {
                  'bg-red-400 text-red-900': result.overallSummary.value < 0,
                  'bg-green-400 text-green-900': result.overallSummary.value > 0
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

              <p className="absolute top-[10px] right-[10px] text-[9px] opacity-50 bg-[rgba(0,0,0,0.4)] rounded-[10px] text-white py-[3px] px-[8px]">
                Last {result.nTradingDays} days
              </p>

              <section className="flex flex-wrap mt-[10px] items-end">
                <div
                  className={classNames(
                    'flex flex-col text-[9px] p-[3px] rounded-[5px] mr-[5px] mb-[5px]',
                    {
                      'bg-red-300': result.overallSummary.value < 0,
                      'bg-green-300': result.overallSummary.value > 0
                    }
                  )}
                >
                  Success:{' '}
                  {`${(result.overallSummary.successRate * 100).toFixed(0)}%`}
                </div>
                <div
                  className={classNames(
                    'flex flex-col text-[9px] p-[3px] rounded-[5px] mr-[5px] mb-[5px]',
                    {
                      'bg-red-300': result.overallSummary.value < 0,
                      'bg-green-300': result.overallSummary.value > 0
                    }
                  )}
                >
                  biggestWin:{' '}
                  {dollarFormatter.format(result.overallSummary.biggestWin)}
                </div>
                <div
                  className={classNames(
                    'flex flex-col text-[9px] p-[3px] rounded-[5px] mr-[5px] mb-[5px]',
                    {
                      'bg-red-300': result.overallSummary.value < 0,
                      'bg-green-300': result.overallSummary.value > 0
                    }
                  )}
                >
                  biggestLoss:{' '}
                  {dollarFormatter.format(result.overallSummary.biggestLoss)}
                </div>
                <div
                  className={classNames(
                    'flex flex-col text-[9px] p-[3px] rounded-[5px] mr-[5px] mb-[5px]',
                    {
                      'bg-red-300': result.overallSummary.value < 0,
                      'bg-green-300': result.overallSummary.value > 0
                    }
                  )}
                >
                  daysTradedRate:{' '}
                  {`${(result.overallSummary.daysTradedRate * 100).toFixed(
                    0
                  )}%`}
                </div>
                <div
                  className={classNames(
                    'flex flex-col text-[9px] p-[3px] rounded-[5px] mr-[5px] mb-[5px]',
                    {
                      'bg-red-300': result.overallSummary.value < 0,
                      'bg-green-300': result.overallSummary.value > 0
                    }
                  )}
                >
                  averagePosition:{' '}
                  {dollarFormatter.format(
                    result.overallSummary.averagePosition
                  )}
                </div>
              </section>
            </div>
          </>
        ))}
      </div>
    </main>
  )
}
