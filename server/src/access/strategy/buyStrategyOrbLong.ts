// ORB will only go toward long for now for simplicity

import { Bar } from '@prisma/client'
import { IBuyOrder } from '../../../../common'

// with a buy at the open after a ORB breakout
export function buyStrategyOrbLong(
  bars: Bar[],
  duration: number,
  maxPositionPerTrade: number
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

  // TODO add as param
  for (let i = duration; i < bars.length; i++) {
    const bar = bars[i]

    // ! this should be changed... Technically, if the `high`
    // ! exceeds the opening range's high, then we shouldn't be
    // ! buying at the bar open (because there might be a large gap here)
    // ? how could we improve this? Trying to buy at the open/close/high/low instead?
    const barMaxPriceAction = Math.max(
      ...[bar.open, bar.close, bar.high, bar.low]
    )

    const lotSize = Math.floor(maxPositionPerTrade / bar.open)

    if (lotSize < 1) {
      throw new Error(
        `Cannot enter. Max position per trade doesn't allow 1 lot purchase ${bar.open}`
      )
    }

    if (barMaxPriceAction > openingRangeMax) {
      return {
        bar,
        buyBarIndex: i,
        openingRange: {
          lowBar: openingRangeLowBar,
          highBar: openingRangeHighBar
        },
        // TODO: implement based on maxPositionPerTrade
        value: lotSize * bar.open, // ! this is technically not correct,
        lotSize
      }
    }
  }

  return null // TODO add type to explain why a buy didn't occur
}
