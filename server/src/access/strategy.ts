import moment from 'moment'
import {
  IOrders,
  IOrderSummary,
  IOverallSummary,
  IRunStrategyResult,
  RunStrategyBuyOptions,
  RunStrategySellOptions
} from '../../../common'
import { barsByDay } from '../utils/bars'
import { db } from './db'
import { buyStrategyOrbLong } from './strategy/buyStrategyOrbLong'
import { sellStrategyBeforeMarketClose } from './strategy/sellStrategyBeforeMarketClose'
import { sellStrategySmaDrop } from './strategy/sellStrategySmaDrop'

export const BARS_IN_DAY = 390
export const WITHIN_LAST_N_TRADING_DAYS = [
  7, 15, 30, 60, 90, 180, 365, 500, 1000
]

// TODO add support for multiple buy/sells each day
export async function runStrategy(options: {
  buyOptions: RunStrategyBuyOptions
  sellOptions: RunStrategySellOptions
  symbol: string
  lotSize: number
}): Promise<IRunStrategyResult[]> {
  const bars = await db.bar.findMany({
    where: { symbol: options.symbol },
    orderBy: { time: 'desc' }
  })

  const strategyRunOnDay: IRunStrategyResult[] = []
  const _barsByDay = barsByDay(bars)

  // TODO: re-write logic
  // if (barQuantityToUse !== barsToUse.length) {
  //   strategyRuns.push(null)
  //   throw new Error(
  //     `Not enough data to run strategy for n=${nTradingDays} days`
  //   )
  // computed
  const runningSummary = {
    totalValue: 0,
    winningTrades: 0,
    losingTrades: 0,
    nonTradingDays: 0,
    tradingDays: 0,
    biggestLoss: 0,
    biggestWin: 0,
    sellTypes: {
      'close-out': 0,
      'sma-drop': 0
    }
  }

  // to calculate average position size
  let totalBuyInPositionValues = 0

  const orders: IOrders = {}
  let onTradingDay = 1

  // at each day --
  for (const date in _barsByDay) {
    const barsToday = _barsByDay[date]
    const buyOrder = buyStrategyOrbLong(
      barsToday,
      options.buyOptions.buyCondition.orbDuration,
      options.lotSize
    )

    if (buyOrder) {
      totalBuyInPositionValues += buyOrder.value

      runningSummary.tradingDays++
      let sellOrder = sellStrategySmaDrop(
        barsToday,
        options.sellOptions.sellCondition.smaDuration,
        buyOrder.buyBarIndex,
        options.lotSize
      )

      if (!sellOrder) {
        sellOrder = sellStrategyBeforeMarketClose(
          barsToday,
          30,
          buyOrder.buyBarIndex,
          options.lotSize
        )
      }

      const start = moment(buyOrder.bar.time)
      const end = moment(sellOrder.bar.time)

      const difference = sellOrder.value - buyOrder.value

      if (difference > runningSummary.biggestWin) {
        runningSummary.biggestWin = difference
      }

      if (difference < runningSummary.biggestLoss) {
        runningSummary.biggestLoss = difference
      }

      if (difference < 0) {
        runningSummary.losingTrades++
      } else if (difference > 0) {
        runningSummary.winningTrades++
      }

      // TODO: pull out and test summary
      const orderSummary: IOrderSummary = {
        difference,
        durationOpen: moment.duration(end.diff(start)).asMinutes()
      }

      runningSummary.sellTypes[sellOrder.type]++
      runningSummary.totalValue += difference

      orders[date] = { buy: buyOrder, sell: sellOrder, summary: orderSummary }
    } else {
      runningSummary.nonTradingDays++
      orders[date] = null
    }

    const shouldTrackSection = WITHIN_LAST_N_TRADING_DAYS.includes(onTradingDay)
    if (shouldTrackSection) {
      const overallSummary: IOverallSummary = {
        value: runningSummary.totalValue,
        winningTrades: runningSummary.winningTrades,
        losingTrades: runningSummary.losingTrades,
        tradingDays: runningSummary.tradingDays,
        nonTradingDays: runningSummary.nonTradingDays,
        successRate: runningSummary.winningTrades / runningSummary.tradingDays,
        daysTradedRate:
          runningSummary.tradingDays /
          (runningSummary.tradingDays + runningSummary.nonTradingDays),
        sellTypes: runningSummary.sellTypes,
        biggestWin: runningSummary.biggestWin,
        biggestLoss: runningSummary.biggestLoss,
        averageValuePerDay:
          runningSummary.totalValue / runningSummary.tradingDays,
        averagePosition: totalBuyInPositionValues / runningSummary.tradingDays // ! update when supporting multiple trades
        // TODO: profit margin?
      }
      // need to do the below, otherwise they'll all point to the same reference
      strategyRunOnDay.unshift({
        orders: { ...orders },
        overallSummary: { ...overallSummary },
        nTradingDays: onTradingDay
      })
    }

    onTradingDay++ // to keep track of sections
  }

  return strategyRunOnDay
}
