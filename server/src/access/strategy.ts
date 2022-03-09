import { Bar } from '@prisma/client'
import moment from 'moment'
import {
  IBuyOrder,
  IOrder,
  IOrderSummary,
  ISellOrder,
  RunStrategyBuyOptions,
  RunStrategySellOptions
} from '../../../common'
import { barsByDay } from '../utils/bars'
import { db } from './db'

// ORB will only go toward long for now for simplicity
// with a buy at the open after a ORB breakout
export function orbBuyStrategy(
  bars: Bar[],
  duration: number,
  lotSize: number
): IBuyOrder | null {
  const openingBars = bars.slice(0, duration)
  const lows = openingBars.map((bar) => bar.low)
  const openingRangeMin = Math.min(...lows)
  const openingRangeLowBar = openingBars.find(
    (bar) => bar.low === openingRangeMin
  )
  const highs = openingBars.map((bar) => bar.high)
  const openingRangeMax = Math.max(...highs)
  const openingRangeHighBar = openingBars.find(
    (bar) => bar.high === openingRangeMax
  )
  if (!openingRangeHighBar) throw new Error('No opening range high bar found')
  if (!openingRangeLowBar) throw new Error('No opening range low bar found')

  for (let i = duration; i < bars.length; i++) {
    const bar = bars[i]

    // ! this should be changed... Technically, if the `high`
    // ! exceeds the opening range's high, then we shouldn't be
    // ! buying at the bar open (because there might be a large gap here)
    // ? how could we improve this? Trying to buy at the open/close/high/low instead?
    const barMaxPriceAction = Math.max(
      ...[bar.open, bar.close, bar.high, bar.low]
    )

    if (barMaxPriceAction > openingRangeMax) {
      return {
        bar,
        buyBarIndex: i,
        openingRange: {
          lowBar: openingRangeLowBar,
          highBar: openingRangeHighBar
        },
        value: bar.open * lotSize // ! this is technically not correct
      }
    }
  }

  return null
}

function smaDropSellStrategy(
  bars: Bar[],
  duration: number,
  sellIndexStart: number,
  lotSize: number
): ISellOrder {
  const previousSmas: number[] = []

  for (let i = duration; i < bars.length; i++) {
    const barsBefore = bars.slice(i - duration, duration)
    const barCloses = barsBefore.map((bar) => bar.close)
    const currentSma = barCloses.reduce((val, total) => val + total, 0)

    const previousSma = previousSmas[previousSmas.length - 1]

    if (previousSma > currentSma && i >= sellIndexStart) {
      // sma has dropped, we need to sell
      return { bar: bars[i], value: bars[i].open * lotSize, type: 'sma-drop' }
    } else {
      previousSmas.push(currentSma)
    }
  }

  // sell 30 minutes before close
  const closingBar = bars[bars.length - 31]
  return {
    bar: closingBar,
    value: closingBar.open * lotSize,
    type: 'close-out'
  }
}

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
    const buyOrder = orbBuyStrategy(
      bars,
      options.buyOptions.buyCondition.orbDuration,
      options.lotSize
    )

    if (buyOrder) {
      totalBuyInPositionValues += buyOrder.value

      tradingDays++
      const sellOrder = smaDropSellStrategy(
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
