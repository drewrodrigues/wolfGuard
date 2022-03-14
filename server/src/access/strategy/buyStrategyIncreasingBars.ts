import { LiveBar } from '../../../../common'

// buy after n bars increase on close
export function buyStrategyIncreasingBars(
  bars: LiveBar[],
  nBars: number
): boolean {
  if (nBars < 2) throw new Error('Cannot buy increasing bars with n < 2')
  const nPreviousBars = bars.slice(bars.length - nBars, bars.length)
  if (nPreviousBars.length < nBars) {
    throw new Error('Not enough data')
  }

  for (let i = 1; i < nPreviousBars.length; i++) {
    const [previousBar, currentBar] = [bars[i - 1], bars[i]]

    console.log({
      previousClose: previousBar.close,
      currentClose: currentBar.close
    })

    if (previousBar.close > currentBar.close) {
      return false
    }
  }
  // all are increasing
  return true
}
