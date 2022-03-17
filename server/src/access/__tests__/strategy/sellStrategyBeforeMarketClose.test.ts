import { Bar } from '@prisma/client'
import { BARS_IN_DAY } from '../../strategy'
import { sellStrategyBeforeMarketClose } from '../../strategy/sellStrategyBeforeMarketClose'
import { LOT_SIZE_TO_BUY, NEUTRAL_BAR, TestMockBar } from './_helpers'

describe('sellStrategyBeforeMarketClose', () => {
  it('rejects invalid minute values', () => {
    expect(() => {
      const invalidSellBeforeValue = 0
      sellStrategyBeforeMarketClose(
        [],
        invalidSellBeforeValue,
        0,
        LOT_SIZE_TO_BUY
      )
    }).toThrowError()

    expect(() => {
      const invalidSellBeforeValue = BARS_IN_DAY
      sellStrategyBeforeMarketClose(
        [],
        invalidSellBeforeValue,
        0,
        LOT_SIZE_TO_BUY
      )
    }).toThrowError()
  })

  describe('when 1 minute passed', () => {
    it('returns the last bar & creates a `close-out` sell order', () => {
      const lastBar = { ...NEUTRAL_BAR, id: 'last_bar' }
      const bars: TestMockBar[] = [
        NEUTRAL_BAR,
        NEUTRAL_BAR,
        NEUTRAL_BAR,
        NEUTRAL_BAR,
        lastBar
      ]

      const minutesToSellBeforeMarketClose = 1
      const buyBarIndex = 0
      const sellOrder = sellStrategyBeforeMarketClose(
        bars as Bar[],
        minutesToSellBeforeMarketClose,
        buyBarIndex,
        LOT_SIZE_TO_BUY
      )
      expect(sellOrder).toEqual({
        bar: lastBar,
        type: 'close-out',
        value: lastBar.open
      })
    })
  })
})
