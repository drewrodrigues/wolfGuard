import { Bar } from '../server/node_modules/.prisma/client/index'

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
  bar: Bar
  buyBarIndex: number
  openingRange: { lowBar: Bar; highBar: Bar }
  value: number
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
    lotSize: number
  }
}

export type IStrategyResponse = IStrategy[]
