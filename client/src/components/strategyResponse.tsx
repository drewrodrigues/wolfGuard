import classNames from 'classnames'
import React, { useState } from 'react'
import { IStrategy } from '../../../common'

export const dollarFormatter = new Intl.NumberFormat('en-US', {
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
  const [toggleDetails, setToggleDetails] = useState(false)

  return (
    <main onClick={() => setToggleDetails((p) => !p)}>
      <header className="text-[12px] flex justify-between mb-[5px]">
        <h2 className="text-white">
          Buy Strategy: <span className="font-bold">{buyStrategy} ORB</span>
        </h2>
        <h2 className="text-white">
          Sell Strategy:{' '}
          <span className="font-bold">{sellStrategy} SMA drop</span>
        </h2>
      </header>

      <div className="flex flex-wrap justify-between mx-[-5px]">
        {strategyResult.map((result) => (
          <>
            <div
              className={classNames(
                'p-[5px] rounded-[5px] mb-[10px] flex-1 text-[12px] mx-[5px] relative cursor-pointer select-none',
                {
                  'bg-red-400 text-red-900': result.overallSummary.value < 0,
                  'bg-green-400 text-green-900': result.overallSummary.value > 0
                }
              )}
            >
              <p className="font-bold text-[22px] leading-[1]">
                {dollarFormatter.format(result.overallSummary.value)}
              </p>

              <p className="text-[12px] opacity-50">
                {dollarFormatter.format(
                  result.overallSummary.averageValuePerDay
                )}
              </p>

              <p className="absolute top-[5px] right-[10px] text-[10px] rounded-[10px]">
                {result.nTradingDays}
              </p>

              <p>
                Balance: {dollarFormatter.format(result.overallSummary.portfolioBalance)}
              </p>
              <p>
                Return: {(result.overallSummary.return * 100).toFixed(2)}%
              </p>
              <p>
                Highest Balance: {dollarFormatter.format(
                  result.overallSummary.highestPortfolioBalance
                )}
              </p>
              <p>
                Lowest Balance: {dollarFormatter.format(
                  result.overallSummary.lowestPortfolioBalance
                )}
              </p>

              {toggleDetails && (
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
              )}
            </div>
          </>
        ))}
      </div>
    </main>
  )
}
