import { Bar } from '@prisma/client'
import { buyStrategyOrbLong } from '../../strategy/buyStrategyOrbLong'
import {
  BAR_TO_BUY_AT,
  HIGH_IN_OPENING_RANGE,
  LOT_SIZE_TO_BUY,
  LOW_IN_OPENING_RANGE,
  NEUTRAL_BAR,
  ORB_HIGH_OPENING_RANGE_VALUE,
  TestMockBar
} from './_helpers'

// ORB is when after a duration, we take the max high value
// and then wait until we have a bar which has a price action that
// goes above this value. This can be the `open`, `close`, `high`, or even
// the `low` of successive bars.
describe('buyStrategyOrbLong', () => {
  describe('when 5 minute duration ORB hits', () => {
    it('returns a buy order', () => {
      const barToBuyAt: TestMockBar = {
        open: ORB_HIGH_OPENING_RANGE_VALUE + 1,
        close: 1,
        high: 1,
        low: 1
      } as Bar
      const fiveMinuteOrb: TestMockBar[] = [
        HIGH_IN_OPENING_RANGE,
        NEUTRAL_BAR,
        LOW_IN_OPENING_RANGE,
        NEUTRAL_BAR,
        NEUTRAL_BAR,
        // end of 5 minute range
        NEUTRAL_BAR,
        barToBuyAt,
        NEUTRAL_BAR,
        NEUTRAL_BAR
      ]

      const buyOrder = buyStrategyOrbLong(
        fiveMinuteOrb as Bar[],
        5,
        LOT_SIZE_TO_BUY
      )

      expect(buyOrder).toEqual({
        bar: barToBuyAt,
        buyBarIndex: 6,
        value: barToBuyAt.open * LOT_SIZE_TO_BUY,
        openingRange: {
          lowBar: LOW_IN_OPENING_RANGE,
          highBar: HIGH_IN_OPENING_RANGE
        }
      })
    })
  })

  describe('when 3 minute duration ORB has preceding bars that have any higher price action', () => {
    describe('when close is higher', () => {
      it('returns a buy order', () => {
        const barToBuyAt = {
          ...NEUTRAL_BAR,
          close: ORB_HIGH_OPENING_RANGE_VALUE + 1
        }

        const fiveMinuteOrb: TestMockBar[] = [
          LOW_IN_OPENING_RANGE,
          NEUTRAL_BAR,
          HIGH_IN_OPENING_RANGE,
          NEUTRAL_BAR,
          NEUTRAL_BAR,
          barToBuyAt
        ]
        const buyOrder = buyStrategyOrbLong(
          fiveMinuteOrb as Bar[],
          5,
          LOT_SIZE_TO_BUY
        )
        expect(buyOrder).toEqual({
          bar: barToBuyAt,
          buyBarIndex: 5,
          value: barToBuyAt.open * LOT_SIZE_TO_BUY,
          openingRange: {
            lowBar: LOW_IN_OPENING_RANGE,
            highBar: HIGH_IN_OPENING_RANGE
          }
        })
      })
    })

    describe('when open is higher', () => {
      it('returns a buy order', () => {
        const barToBuyAt = {
          ...NEUTRAL_BAR,
          open: ORB_HIGH_OPENING_RANGE_VALUE + 1
        } as Bar
        const fiveMinuteOrb: TestMockBar[] = [
          LOW_IN_OPENING_RANGE,
          NEUTRAL_BAR,
          NEUTRAL_BAR,
          NEUTRAL_BAR,
          HIGH_IN_OPENING_RANGE, // minute 5 done
          barToBuyAt // minute 6 should be where the buy happens
        ]

        const buyOrder = buyStrategyOrbLong(
          fiveMinuteOrb as Bar[],
          5,
          LOT_SIZE_TO_BUY
        )

        expect(buyOrder).toEqual({
          bar: barToBuyAt,
          buyBarIndex: 5,
          value: barToBuyAt.open * LOT_SIZE_TO_BUY,
          openingRange: {
            lowBar: LOW_IN_OPENING_RANGE,
            highBar: HIGH_IN_OPENING_RANGE
          }
        })
      })
    })

    describe('when high is higher', () => {
      it('returns a buy order', () => {
        const barToBuyAt = {
          ...NEUTRAL_BAR,
          high: ORB_HIGH_OPENING_RANGE_VALUE + 1
        }

        const fiveMinuteOrb: TestMockBar[] = [
          LOW_IN_OPENING_RANGE,
          NEUTRAL_BAR,
          NEUTRAL_BAR,
          NEUTRAL_BAR,
          HIGH_IN_OPENING_RANGE,
          barToBuyAt
        ]

        const buyOrder = buyStrategyOrbLong(
          fiveMinuteOrb as Bar[],
          5,
          LOT_SIZE_TO_BUY
        )

        expect(buyOrder).toEqual({
          bar: barToBuyAt,
          buyBarIndex: 5,
          value: barToBuyAt.open * LOT_SIZE_TO_BUY,
          openingRange: {
            lowBar: LOW_IN_OPENING_RANGE,
            highBar: HIGH_IN_OPENING_RANGE
          }
        })
      })
    })

    describe('when low is higher', () => {
      it('returns a buy order', () => {
        const LOT_SIZE_TO_BUY = 1
        const fiveMinuteOrb: TestMockBar[] = [
          LOW_IN_OPENING_RANGE,
          NEUTRAL_BAR,
          NEUTRAL_BAR,
          NEUTRAL_BAR,
          HIGH_IN_OPENING_RANGE,
          BAR_TO_BUY_AT
        ]

        const buyOrder = buyStrategyOrbLong(
          fiveMinuteOrb as Bar[],
          5,
          LOT_SIZE_TO_BUY
        )

        expect(buyOrder).toEqual({
          bar: BAR_TO_BUY_AT,
          buyBarIndex: 5,
          value: BAR_TO_BUY_AT.open * LOT_SIZE_TO_BUY,
          openingRange: {
            lowBar: LOW_IN_OPENING_RANGE,
            highBar: HIGH_IN_OPENING_RANGE
          }
        })
      })
    })
  })

  describe('when price action never exceeds ORB closing range', () => {
    it('returns null', () => {
      const fiveMinuteOrb: TestMockBar[] = [
        NEUTRAL_BAR,
        NEUTRAL_BAR,
        NEUTRAL_BAR,
        NEUTRAL_BAR,
        HIGH_IN_OPENING_RANGE,
        LOW_IN_OPENING_RANGE,
        LOW_IN_OPENING_RANGE,
        LOW_IN_OPENING_RANGE,
        LOW_IN_OPENING_RANGE
      ]

      const buyOrder = buyStrategyOrbLong(
        fiveMinuteOrb as Bar[],
        5,
        LOT_SIZE_TO_BUY
      )

      expect(buyOrder).toBeNull()
    })
  })
})
