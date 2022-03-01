import { Bar } from '@prisma/client'
import moment from 'moment'
import { barsByDay } from '../utils/bars'
import { db } from './db'

interface BuyConditionOrb {
  orbDuration: number
}

interface RunStrategyBuyOptions {
  buyCondition: BuyConditionOrb
}

interface SellConditionSMADrop {
  smaDuration: number
}

interface RunStrategySellOptions {
  sellCondition: SellConditionSMADrop
}

interface RunStrategyReturn {
  // orderPairs: []
  _barsByDay: any[]
}

// ORB will only go toward long for now for simplicity
function orbBuyStrategy(
  bars: Bar[],
  duration: number,
  lotSize: number
): { bar: Bar; barIndex: number; orbHigh: Bar; value: number } | null {
  const openingBars = bars.slice(0, duration)
  const highs = openingBars.map((bar) => bar.close)
  const orbHigh = Math.max(...highs)

  for (let i = duration; i < bars.length; i++) {
    const bar = bars[i]
    if (bar.open > orbHigh) {
      return {
        bar,
        barIndex: i,
        orbHigh: openingBars.find((bar) => bar.high === orbHigh)!,
        value: bar.open * lotSize
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
): { bar: Bar; value: number; type: 'sma-drop' | 'close-out' } {
  console.log('smaDropSellStrategy')
  const previousSmas: number[] = []

  console.log({ duration, barsLength: bars.length })

  for (let i = duration; i < bars.length; i++) {
    const barsBefore = bars.slice(i - duration, duration)
    const barCloses = barsBefore.map((bar) => bar.close)
    const currentSma = barCloses.reduce((val, total) => val + total, 0)

    const previousSma = previousSmas[previousSmas.length - 1]

    console.log({ barsBefore })
    console.log({ barCloses })
    console.log({ currentSma })
    console.log({ previousSma })

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

// TODO add support for multiple buy/sells each day
export async function runStrategy(options: {
  buyOptions: RunStrategyBuyOptions
  sellOptions: RunStrategySellOptions
  symbol: string
  lotSize: number
}): Promise<any> {
  const bars = await db.bar.findMany({ where: { symbol: options.symbol } })
  const _barsByDay = barsByDay(bars)

  // computed
  let totalValue = 0
  let winningTrades = 0
  let losingTrades = 0
  let nonTradingDays = 0
  let tradingDays = 0
  const sellTypes: Record<'close-out' | 'sma-drop', number> = {
    'close-out': 0,
    'sma-drop': 0
  }

  const orders: Record<
    string,
    {
      buy: { bar: Bar; barIndex: number; orbHigh: Bar }
      sell: { bar: Bar; value: number }
      summary: object
    } | null
  > = {}

  for (const date in _barsByDay) {
    const bars = _barsByDay[date]
    const buyOrder = orbBuyStrategy(
      bars,
      options.buyOptions.buyCondition.orbDuration,
      options.lotSize
    )

    if (buyOrder) {
      tradingDays++
      const sellOrder = smaDropSellStrategy(
        bars,
        options.sellOptions.sellCondition.smaDuration,
        buyOrder.barIndex,
        options.lotSize
      )

      const start = moment(buyOrder.bar.time)
      const end = moment(sellOrder.bar.time)

      const difference = sellOrder.value - buyOrder.value

      if (difference < 0) {
        losingTrades++
      } else if (difference > 0) {
        winningTrades++
      }

      const summary = {
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
    sellTypes
  }

  return { orders, overallSummary }
}
