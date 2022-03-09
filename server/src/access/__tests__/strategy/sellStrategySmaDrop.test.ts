import { Bar } from '@prisma/client'
import {
  sellStrategySmaDrop,
  _runningSmasForBars
} from '../../strategy/sellStrategySmaDrop'
import {
  HIGH_IN_OPENING_RANGE,
  LOT_SIZE_TO_BUY,
  LOW_IN_OPENING_RANGE,
  NEUTRAL_BAR,
  TestMockBar
} from './_helpers'

/*
  bars: Bar[],
  duration: number,
  barBuyIndex: number,
  lotSize: number
*/

describe('sellStrategySmaDrop', () => {
  it('it ignores bars at and before the buy', () => {
    const threeMinSmaDecrease: TestMockBar[] = [
      { ...NEUTRAL_BAR, id: 1, close: 3 },
      { ...NEUTRAL_BAR, id: 2, close: 2 },
      { ...NEUTRAL_BAR, id: 3, close: 1 }
    ]

    const threeMinSmaIncrease: TestMockBar[] = [
      { ...NEUTRAL_BAR, id: 4, close: NEUTRAL_BAR.close + 1 },
      { ...NEUTRAL_BAR, id: 5, close: NEUTRAL_BAR.close + 2 },
      { ...NEUTRAL_BAR, id: 6, close: NEUTRAL_BAR.close + 3 }
    ]

    const threeMinSmaDrop: TestMockBar[] = [
      LOW_IN_OPENING_RANGE,
      HIGH_IN_OPENING_RANGE,
      ...threeMinSmaDecrease,
      ...threeMinSmaDecrease,
      NEUTRAL_BAR,
      ...threeMinSmaIncrease
    ]

    const sellOrder = sellStrategySmaDrop(
      threeMinSmaDrop as Bar[],
      3,
      7,
      LOT_SIZE_TO_BUY
    )
    expect(sellOrder).toEqual(NEUTRAL_BAR)
  })
})

describe('_runningSmasForBars', () => {
  it('throws on < 2 minute SMA', () => {
    const bars: TestMockBar[] = []

    expect(() => {
      _runningSmasForBars(bars as Bar[], 1)
    }).toThrowError()
  })

  test('2 minute SMA', () => {
    const bars: TestMockBar[] = [
      { ...NEUTRAL_BAR, close: 2 },
      { ...NEUTRAL_BAR, close: 4 },
      { ...NEUTRAL_BAR, close: 6 }
    ]

    const smas = _runningSmasForBars(bars as Bar[], 2)

    expect(smas).toEqual([null, 3, 5])
  })

  test('3 minute SMA', () => {
    const bars: TestMockBar[] = [
      { ...NEUTRAL_BAR, close: 2 },
      { ...NEUTRAL_BAR, close: 4 },
      { ...NEUTRAL_BAR, close: 6 }
    ]

    const smas = _runningSmasForBars(bars as Bar[], 3)

    expect(smas).toEqual([null, null, 4])
  })
})
