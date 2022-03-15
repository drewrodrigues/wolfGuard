import { Bar } from '@prisma/client'
import { ISellOrder } from '../../../../common'
import { BARS_IN_DAY } from '../strategy'

export function sellStrategyBeforeMarketClose(
  bars: Bar[],
  minutesToSellBeforeMarketClose: number,
  buyBarIndex: number,
  lotSize: number
): ISellOrder {
  if (
    minutesToSellBeforeMarketClose < 1 ||
    minutesToSellBeforeMarketClose >= BARS_IN_DAY
  ) {
    throw new Error(
      `Selling ${minutesToSellBeforeMarketClose} minutes before market close is invalid`
    )
  }

  let closingBar = bars[bars.length - minutesToSellBeforeMarketClose - 1]
  if (buyBarIndex > 390 - minutesToSellBeforeMarketClose) {
    // // TODO instead, attempt a sell on the bar after the buy (whichever is greater)
    // // TODO constrain the buy to a certain time period
    // throw new Error(
    //   `Buy order bar at index=${buyBarIndex} is after sell before market attempt of minutesToSellBeforeMarketClose=${minutesToSellBeforeMarketClose}`
    // )
    closingBar = bars[buyBarIndex + 1]
  }

  return {
    bar: closingBar,
    value: closingBar.open * lotSize,
    type: 'close-out'
  }
}
