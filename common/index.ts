// ! are these project references correct?
import { Bar } from '../server/node_modules/.prisma/client/index'
import {
  Contract,
  Order,
  OrderState
} from '../server/node_modules/@stoqey/ib/dist/index'

export type LiveBar = Omit<Bar, 'id'>

export type BuyStrategyType = 'ORB Long' | 'Increasing Bars'
export type SellStrategyType = 'SMA Drop' | 'Decreasing Bars'

export interface BuyConditionOrb {
  orbDuration: number
}

export interface RunStrategyBuyOptions {
  buyCondition: BuyConditionOrb
}

export interface SellConditionSMADrop {
  smaDuration: number
}

export interface RunStrategySellOptions {
  sellCondition: SellConditionSMADrop
  closeOutNMinutesBeforeMarketClose: number
}

export interface RunStrategyReturn {
  // orderPairs: []
  _barsByDay: any[]
}

export interface IRunStrategy {
  buyOptions: RunStrategyBuyOptions
  sellOptions: RunStrategySellOptions
  symbol: string
  lotSize: number
  nLastTradingDays: number
}

export interface ISellOrder {
  bar: Bar
  value: number
  type: 'sma-drop' | 'close-out'
}

export interface IBuyOrder {
  bar: Bar | LiveBar
  buyBarIndex: number
  // TODO: pull this into another type (then don't destructure props so we keep typing)
  openingRange?: { highBar: Bar }
  value: number
  // ? not sure that this function should determine the lot size
  // ? maybe it just returns what we should buy at
  // ? then the enclosing function determines what lot size we need
  lotSize: number

  // stringify bars so I can look at them
  signalReasoning?: string
}

export interface IOrderSummary {
  difference: number
  durationOpen: number
}

export interface IOrderGroup {
  buy: IBuyOrder
  sell: ISellOrder
  summary: IOrderSummary
}

type IOrderDate = string
export type IOrders = Record<IOrderDate, IOrderGroup | null>

export interface IOverallSummary {
  value: number
  winningTrades: number
  losingTrades: number
  tradingDays: number
  nonTradingDays: number
  daysTradedRate: number
  sellTypes: { 'close-out': number; 'sma-drop': number }
  successRate: number
  biggestWin: number
  biggestLoss: number
  averagePosition: number
  averageValuePerDay: number
  highestPortfolioBalance: number
  lowestPortfolioBalance: number
  portfolioBalance: number
  return: number
}

export interface IRunStrategyResult {
  orders: IOrders
  overallSummary: IOverallSummary
  nTradingDays: number
}

export interface IStrategy {
  buyStrategy: number // ! this should be a string -- which aligns with an enum
  sellStrategy: number // ! this should be a string -- which aligns with an enum

  strategyResult: IRunStrategyResult[]
  setup: {
    symbol: number
    orbBuyDuration: number
    smaSellDuration: number
  }
}

export type IStrategyResponse = IStrategy[]

// live trading
export interface OpenOrder {
  orderId: number
  contract: Contract
  order: Order
  orderState: OrderState
}

export interface OpenPosition {
  account: string
  lotSize: number
  contract: Contract
  averageCost?: number
}
