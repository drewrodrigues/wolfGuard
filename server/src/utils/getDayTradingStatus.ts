import { OpenOrder, OpenPosition } from '../../../common'

type DayTradingStatus =
  | 'none'
  | 'open-buy-order'
  | 'open-position'
  | 'open-sell-order'
  | 'closed-position'

export function getDayTradingStatus(
  openOrders: OpenOrder[],
  positions: { open: OpenPosition[]; closed: OpenPosition[] }
): DayTradingStatus {
  // ! throw if there's more than 1 order anywhere

  if (openOrders.length && openOrders[0].order.action === 'BUY') {
    return 'open-buy-order'
  } else if (openOrders.length && openOrders[0].order.action === 'SELL') {
    return 'open-sell-order'
  }

  if (positions.closed.length) {
    return 'closed-position'
  } else if (positions.open.length) {
    return 'open-position'
  }

  return 'none'
}
