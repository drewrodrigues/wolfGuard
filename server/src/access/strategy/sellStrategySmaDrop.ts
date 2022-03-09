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
  barBuyIndex: number,
  lotSize: number
): ISellOrder | null {
  const previousSmas: number[] = []
  const smas = _runningSmasForBars(bars, duration)

  for (let i = duration; i < bars.length; i++) {
    const currentSma = smas[i]
    const previousSma = previousSmas[previousSmas.length - 1]

    if (!currentSma) {
      // too early to have a sma
    } else if (previousSma > currentSma && i > barBuyIndex) {
      // sma has dropped, we need to sell
      return { bar: bars[i], value: bars[i].open * lotSize, type: 'sma-drop' }
    }
  }

  return null

  // TODO: pull this into another strategy (not within this one)
  // // sell 30 minutes before close
  // const closingBar = bars[bars.length - 31]
  // return {
  //   bar: closingBar,
  //   value: closingBar.open * lotSize,
  //   type: 'close-out'
  // }
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
