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

describe('sellStrategySmaDrop', () => {
  it("it won't create a sell order before or on the buy bar", () => {
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
      ...threeMinSmaIncrease,
      ...threeMinSmaIncrease
    ]

    const smaDuration = 3
    const buyBarIndex = 4
    const sellOrder = sellStrategySmaDrop(
      threeMinSmaDrop as Bar[],
      smaDuration,
      buyBarIndex,
      LOT_SIZE_TO_BUY
    )

    expect(sellOrder).toBeNull()
  })

  it('will create a sell order on the first bar after a buy if the sma drops', () => {
    const threeMinSmaStable: TestMockBar[] = [
      { ...NEUTRAL_BAR, id: 1, close: 10 },
      { ...NEUTRAL_BAR, id: 2, close: 10 },
      { ...NEUTRAL_BAR, id: 3, close: 10 }
    ]

    const barThatDecreasesSma = { ...NEUTRAL_BAR, id: 4, close: 9 }
    const threeMinSmaDecrease: TestMockBar[] = [
      barThatDecreasesSma, // this is the sell
      { ...NEUTRAL_BAR, id: 5, close: 10 },
      { ...NEUTRAL_BAR, id: 6, close: 10 }
    ]

    const threeMinSmaDrop: TestMockBar[] = [
      LOW_IN_OPENING_RANGE,
      HIGH_IN_OPENING_RANGE,
      ...threeMinSmaStable,
      {
        ...NEUTRAL_BAR,
        close: 10,
        id: 'BUY'
      },
      ...threeMinSmaDecrease, // this is where we can sell
      NEUTRAL_BAR
    ]

    const sellOrder = sellStrategySmaDrop(
      threeMinSmaDrop as Bar[],
      3,
      5,
      LOT_SIZE_TO_BUY
    )

    expect(sellOrder).toEqual({
      bar: barThatDecreasesSma,
      type: 'sma-drop',
      value: barThatDecreasesSma.close
    })
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
