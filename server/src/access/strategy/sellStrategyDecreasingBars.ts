import { IBuyOrder, LiveBar } from '../../../../common'

// * change this strategy to (green/red bar) -- which is based on bar's relationship
// * between open and close

// buy after n bars increase on close
export function sellStrategyDecreasingBars(
  bars: LiveBar[],
  nBars: number,
  lotSize: number
  // TODO: change to sell order
): IBuyOrder | false {
  if (nBars < 2) throw new Error('Cannot sell decreasing bars with n < 2')
  // * exclude current bar (since it hasn't closed yet)
  const nPreviousBars = bars.slice(bars.length - nBars - 1, bars.length - 1)

  if (nPreviousBars.length < nBars) {
    return false
  }

  for (let i = 1; i < nPreviousBars.length; i++) {
    const [previousBar, currentBar] = [nPreviousBars[i - 1], nPreviousBars[i]]

    if (previousBar.close < currentBar.close) {
      return false
    }
  }
  // all are decreasing
  const barToSellAt = nPreviousBars[nPreviousBars.length - 1]

  return {
    bar: barToSellAt,
    buyBarIndex: nPreviousBars.length - 1,
    value: barToSellAt.close,
    lotSize,
    signalDetail: JSON.stringify(nPreviousBars)
  }
}
