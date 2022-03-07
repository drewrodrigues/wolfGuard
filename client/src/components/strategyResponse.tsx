import React from 'react'
import { IStrategyResponse } from './strategy'
import classnames from 'classnames'

const dollarFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  signDisplay: 'auto'
})
interface IStrategyResponseProps {
  strategy: IStrategyResponse
}

export function StrategyResponse({
  strategy: {
    overallSummary: {
      value,
      winningTrades,
      losingTrades,
      tradingDays,
      nonTradingDays,
      successRate,
      biggestWin,
      biggestLoss,
      daysTradedRate,
      averagePosition
    },
    setup: { symbol, orbBuyDuration, smaSellDuration, lotSize }
  }
}: IStrategyResponseProps) {
  return (
    <div
      className={classnames('p-[10px] rounded-[5px] mb-[10px]', {
        'bg-red-400 text-red-900': value < 0,
        'bg-green-400 text-green-900': value > 0
      })}
    >
      <p>Value: {dollarFormatter.format(value)}</p>
      <p>Success rate: {`${(successRate * 100).toFixed(0)}%`}</p>
      <p>symbol: {symbol}</p>
      <p>orbBuyDuration: {orbBuyDuration} m</p>
      <p>smaSellDuration: {smaSellDuration} m</p>
      <p>lotSize: {lotSize}</p>
      <p>biggestWin: {dollarFormatter.format(biggestWin)}</p>
      <p>biggestLoss: {dollarFormatter.format(biggestLoss)}</p>
      <p>daysTradedRate: {`${(daysTradedRate * 100).toFixed(0)}%`}</p>
      <p>averagePosition: {dollarFormatter.format(averagePosition)}</p>
      <p>lowestAccountBalance: ?</p>
      <p>highestAccountBalance: ?</p>
      <p>endingAccountBalance: ?</p>
    </div>
  )
}
