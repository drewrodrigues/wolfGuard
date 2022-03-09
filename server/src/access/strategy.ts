import moment from 'moment'
import {
  IOrder,
  IOrderSummary,
  RunStrategyBuyOptions,
  RunStrategySellOptions
} from '../../../common'
import { barsByDay } from '../utils/bars'
import { db } from './db'
import { buyStrategyOrbLong } from './strategy/buyStrategyOrbLong'
import { sellStrategySmaDrop } from './strategy/sellStrategySmaDrop'

const BARS_IN_DAY = 390
// 390 bars in a day
// TODO add support for multiple buy/sells each day
export async function runStrategy(options: {
  buyOptions: RunStrategyBuyOptions
  sellOptions: RunStrategySellOptions
  symbol: string
  lotSize: number
  nLastTradingDays: number
}): Promise<any> {
  const barCount = options.nLastTradingDays * BARS_IN_DAY
  const bars = await db.bar.findMany({
    where: { symbol: options.symbol },
    orderBy: { time: 'desc' },
    take: barCount
  })
  const _barsByDay = barsByDay(bars)

  // computed
  let totalValue = 0
  let winningTrades = 0
  let losingTrades = 0
  let nonTradingDays = 0
  let tradingDays = 0
  let biggestLoss = 0
  let biggestWin = 0

  // to calculate average position size
  let totalBuyInPositionValues = 0

  const sellTypes: Record<'close-out' | 'sma-drop', number> = {
    'close-out': 0,
    'sma-drop': 0
  }

  const orders: IOrder = {}

  for (const date in _barsByDay) {
    const bars = _barsByDay[date]
    const buyOrder = buyStrategyOrbLong(
      bars,
      options.buyOptions.buyCondition.orbDuration,
      options.lotSize
    )

    if (buyOrder) {
      totalBuyInPositionValues += buyOrder.value

      tradingDays++
      const sellOrder = sellStrategySmaDrop(
        bars,
        options.sellOptions.sellCondition.smaDuration,
        buyOrder.buyBarIndex,
        options.lotSize
      )

      const start = moment(buyOrder.bar.time)
      const end = moment(sellOrder.bar.time)

      const difference = sellOrder.value - buyOrder.value

      if (difference > biggestWin) {
        biggestWin = difference
      }

      if (difference < biggestLoss) {
        biggestLoss = difference
      }

      if (difference < 0) {
        losingTrades++
      } else if (difference > 0) {
        winningTrades++
      }

      const summary: IOrderSummary = {
        difference,
        durationOpen: moment.duration(end.diff(start)).asMinutes()
      }

      sellTypes[sellOrder.type]++
      totalValue += difference

      orders[date] = { buy: buyOrder, sell: sellOrder, summary }
    } else {
      nonTradingDays++
      orders[date] = null
    }
  }

  const overallSummary = {
    value: totalValue,
    winningTrades,
    losingTrades,
    tradingDays,
    nonTradingDays,
    successRate: winningTrades / tradingDays,
    daysTradedRate: tradingDays / (tradingDays + nonTradingDays),
    sellTypes,
    biggestWin,
    biggestLoss,
    averagePosition: totalBuyInPositionValues / tradingDays // ! update when supporting multiple trades
  }

  return { orders, overallSummary }
}
