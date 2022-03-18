import { IBuyOrder, LiveBar } from '../../../../common'

// buy after n bars increase on close
export function buyStrategyIncreasingBars(
  bars: LiveBar[],
  nBars: number,
  maxPositionPerTrade: number
): IBuyOrder | null {
  if (nBars < 2) throw new Error('Cannot buy increasing bars with n < 2')
  // * exclude current bar as it hasn't closed yet
  const nPreviousBars = bars.slice(bars.length - nBars - 1, bars.length - 1)

  if (nPreviousBars.length < nBars) {
    return null
  }

  for (let i = 1; i < nPreviousBars.length; i++) {
    const [previousBar, currentBar] = [nPreviousBars[i - 1], nPreviousBars[i]]

    if (previousBar.close > currentBar.close) {
      return null
    }
  }
  // all are increasing
  const barToBuyAt = nPreviousBars[nPreviousBars.length - 1]

  return {
    bar: barToBuyAt,
    buyBarIndex: nPreviousBars.length - 1,
    value: barToBuyAt.close,
    lotSize: Math.floor(maxPositionPerTrade / barToBuyAt.close),
    signalReasoning: JSON.stringify(nPreviousBars)
  }
}
