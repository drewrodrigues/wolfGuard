import moment from 'moment'
import {
  BuyStrategyType,
  IBuyOrder,
  IOrders,
  IOrderSummary,
  IOverallSummary,
  IRunStrategyResult,
  ISellOrder,
  SellStrategyType
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

interface RunStrategyBuyCondition {
  strategy: BuyStrategyType
  quantity: number
}

interface RunStrategySellCondition {
  strategy: SellStrategyType
  quantity: number
  closeOutNMinutesBeforeMarketClose: number
}

// TODO add support for multiple buy/sells each day
export async function runStrategy(
  buyCondition: RunStrategyBuyCondition,
  sellCondition: RunStrategySellCondition,
  symbol: string,
  startingPortfolioBalance: number,
  maxPositionPerTrade: number
): Promise<IRunStrategyResult[]> {
  const bars = await db.bar.findMany({
    where: { symbol: symbol },
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
    // TODO: average time to enter
    // TODO: average time to exit
    // TODO: average time position open
    totalValue: 0,
    winningTrades: 0,
    losingTrades: 0,
    nonTradingDays: 0,
    tradingDays: 0,
    biggestLoss: 0,
    biggestWin: 0,
    // TODO: strong type with client
    sellTypes: {
      'close-out': 0,
      'sma-drop': 0
    },
    portfolioBalance: startingPortfolioBalance,
    lowestPortfolioBalance: startingPortfolioBalance,
    highestPortfolioBalance: startingPortfolioBalance
  }

  // to calculate average position size
  let totalBuyInPositionValues = 0

  const orders: IOrders = {}
  let onTradingDay = 1

  // at each day --
  for (const date in _barsByDay) {
    const barsToday = _barsByDay[date]

    let buyOrder: IBuyOrder | null = null
    if (buyCondition.strategy === 'ORB Long') {
      buyOrder = buyStrategyOrbLong(
        barsToday,
        buyCondition.quantity,
        maxPositionPerTrade
      )
    } else {
      throw new Error(
        `BuyCondition strategy not implemented: ${buyCondition.strategy}`
      )
    }

    if (buyOrder) {
      totalBuyInPositionValues += buyOrder.value

      runningSummary.tradingDays++

      let sellOrder: ISellOrder | null = null

      if (sellCondition.strategy === 'SMA Drop') {
        sellOrder = sellStrategySmaDrop(
          barsToday,
          sellCondition.quantity,
          buyOrder.buyBarIndex,
          buyOrder.lotSize
        )
      } else {
        throw new Error(
          `SellCondition strategy not implemented: ${sellCondition.strategy}`
        )
      }

      if (!sellOrder) {
        sellOrder = sellStrategyBeforeMarketClose(
          barsToday,
          sellCondition.closeOutNMinutesBeforeMarketClose,
          buyOrder.buyBarIndex,
          buyOrder.lotSize
        )
      }

      const start = moment(buyOrder.bar.time)
      const end = moment(sellOrder.bar.time)

      const difference = sellOrder.value - buyOrder.value
      runningSummary.portfolioBalance += difference

      if (difference > runningSummary.biggestWin) {
        runningSummary.biggestWin = difference
      }

      if (difference < runningSummary.biggestLoss) {
        runningSummary.biggestLoss = difference
      }

      if (
        runningSummary.lowestPortfolioBalance > runningSummary.portfolioBalance
      ) {
        runningSummary.lowestPortfolioBalance = runningSummary.portfolioBalance
      }

      if (
        runningSummary.highestPortfolioBalance < runningSummary.portfolioBalance
      ) {
        runningSummary.highestPortfolioBalance = runningSummary.portfolioBalance
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
        averagePosition: totalBuyInPositionValues / runningSummary.tradingDays, // ! update when supporting multiple trades,
        highestPortfolioBalance: runningSummary.highestPortfolioBalance,
        lowestPortfolioBalance: runningSummary.lowestPortfolioBalance,
        portfolioBalance: runningSummary.portfolioBalance,
        return:
          (runningSummary.portfolioBalance - startingPortfolioBalance) /
          startingPortfolioBalance
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
