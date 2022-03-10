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

  if (buyBarIndex > 390 - minutesToSellBeforeMarketClose) {
    // TODO instead, attempt a sell on the bar after the buy (whichever is greater)
    throw new Error('Buy order bar is after sell before market attempt')
  }
  const closingBar = bars[bars.length - minutesToSellBeforeMarketClose]

  return {
    bar: closingBar,
    value: closingBar.open * lotSize,
    type: 'close-out'
  }
}
