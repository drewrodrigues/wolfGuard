import { Bar } from '@prisma/client'

export type BarRequiredPropsType = 'close' | 'open' | 'high' | 'low'
export type TestMockBar = Pick<Bar, BarRequiredPropsType> & {
  id?: number | string
}

export const LOT_SIZE_TO_BUY = 1
export const ORB_HIGH_OPENING_RANGE_VALUE = 1000
export const ORB_LOW_OPENING_RANGE_VALUE = 100
export const LOW_IN_OPENING_RANGE = {
  open: ORB_LOW_OPENING_RANGE_VALUE + 1,
  close: ORB_LOW_OPENING_RANGE_VALUE + 1,
  high: ORB_LOW_OPENING_RANGE_VALUE + 1,
  low: ORB_LOW_OPENING_RANGE_VALUE
}
export const HIGH_IN_OPENING_RANGE = {
  open: ORB_LOW_OPENING_RANGE_VALUE + 1,
  close: ORB_LOW_OPENING_RANGE_VALUE + 1,
  high: ORB_HIGH_OPENING_RANGE_VALUE,
  low: ORB_LOW_OPENING_RANGE_VALUE + 1
}

export const LOW_AND_HIGH_BAR = {
  low: ORB_LOW_OPENING_RANGE_VALUE,
  open: ORB_LOW_OPENING_RANGE_VALUE,
  close: ORB_HIGH_OPENING_RANGE_VALUE,
  high: ORB_HIGH_OPENING_RANGE_VALUE
}

export const BAR_TO_BUY_AT = {
  ...LOW_AND_HIGH_BAR,
  high: ORB_HIGH_OPENING_RANGE_VALUE + 1
}

export const NEUTRAL_BAR: TestMockBar = {
  id: 'NEUTRAL_BAR',
  low: ORB_LOW_OPENING_RANGE_VALUE + 2,
  high: ORB_HIGH_OPENING_RANGE_VALUE - 3,
  close: ORB_LOW_OPENING_RANGE_VALUE + 4,
  open: ORB_LOW_OPENING_RANGE_VALUE + 5
}
