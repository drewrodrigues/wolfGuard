import { Bar } from '@prisma/client'
import { ISellOrder } from '../../../../common'

export function sellStrategySmaDrop(
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
