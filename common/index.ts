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

export interface IStrategyRun {
  withLastNTradingDays: number
  overallSummary: {
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
  }
  setup: {
    symbol: number
    orbBuyDuration: number
    smaSellDuration: number
    lotSize: number
    nLastTradingDays: number
  }
  orders: object[]
}

export interface IStrategy {
  buyStrategy: number
  sellStrategy: number

  runs: IStrategyRun[]
}

export type IStrategyResponse = IStrategy[]
