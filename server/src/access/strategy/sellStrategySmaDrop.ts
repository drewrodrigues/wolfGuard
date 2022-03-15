import { Bar } from '@prisma/client'
import { ISellOrder } from '../../../../common'

// * sma is dependent upon the closing value
// * when live trading, it depends on previous closes
// * and the current price action
export function sellStrategySmaDrop(
  bars: Bar[],
  duration: number,
  // * we have `barBuyIndex` do this so we can have a SMA setup before
  // * before a buy is actually done (so a 3 minute SMA drop
  // * might occur one the first bar we can sell)
  // ? or do we want to allow the ability to start the sma
  // ? after we start a buy?
  barBuyIndex: number,
  lotSize: number
): ISellOrder | null {
  const smas = _runningSmasForBars(bars, duration)

  for (let i = Math.max(duration - 1, barBuyIndex + 1); i < bars.length; i++) {
    const previousSma = smas[i - 1]
    const currentSma = smas[i]

    if (!currentSma || !previousSma) {
      continue
    }

    const currentBar = bars[i]
    const smaHasDropped = previousSma > currentSma

    if (smaHasDropped) {
      return {
        bar: currentBar,
        value: currentBar.close * lotSize,
        type: 'sma-drop'
      }
    }
  }

  return null
}

export function _runningSmasForBars(
  bars: Bar[],
  duration: number
): (number | null)[] {
  if (duration < 2) throw new Error('SMA cannot be less than 2')
  const smas: (number | null)[] = []

  for (let i = 0; i < bars.length; i++) {
    const barSection = bars.slice(Math.max(i - duration + 1, 0), i + 1)
    const closes = barSection.map((bar) => bar.close)

    if (closes.length < duration) {
      smas.push(null)
    } else {
      smas.push(
        closes.reduce((total, current) => total + current, 0) / closes.length
      )
    }
  }

  return smas
}
