import express from 'express'
import { IStrategy, IStrategyResponse, IStrategyRun } from '../../../common'
import { runStrategy } from '../access/strategy'
const router = express.Router()

const ORB_BUY_DURATIONS = [1, 5, 10, 15, 30]
const SMA_SELL_DROP_DURATIONS = [3, 4, 5, 10, 20, 30, 60]
// ! go from 0 < 1000 and push at the below intervals
const WITHIN_LAST_N_TRADING_DAYS = [7, 15, 30, 60, 90, 180, 365, 500, 1000] // ! we can do this in 1 loop (just push out subsections of bars as we go--from low to high)

router.post('/', async (req, res) => {
  const overallRuns: IStrategyResponse = []
  const { symbol, lotSize } = req.body

  try {
    if (!symbol || !lotSize) {
      throw new Error('Required params are missing')
    }

    for (let i = 0; i < ORB_BUY_DURATIONS.length; i++) {
      const orbBuy = ORB_BUY_DURATIONS[i]

      for (let j = 0; j < SMA_SELL_DROP_DURATIONS.length; j++) {
        const smaSell = SMA_SELL_DROP_DURATIONS[j]
        const buySellCombinationRun: IStrategy = {
          buyStrategy: orbBuy,
          sellStrategy: smaSell,
          runs: []
        }

        for (let k = 0; k < WITHIN_LAST_N_TRADING_DAYS.length; k++) {
          const nDays = WITHIN_LAST_N_TRADING_DAYS[k]
          console.log({ nDays, smaSell, orbBuy })

          const strategyResult = await runStrategy({
            buyOptions: { buyCondition: { orbDuration: orbBuy } },
            sellOptions: { sellCondition: { smaDuration: smaSell } },
            symbol,
            lotSize,
            nLastTradingDays: nDays
          })

          const builtStrageyRun: IStrategyRun = {
            ...strategyResult,
            withLastNTradingDays: nDays,
            ...{
              setup: {
                symbol,
                orbBuyDuration: orbBuy,
                smaSellDuration: smaSell,
                lotSize,
                nLastTradingDays: nDays
              }
            }
          }

          buySellCombinationRun.runs.push(builtStrageyRun)
        }

        overallRuns.push(buySellCombinationRun)
      }
    }

    res.send(overallRuns)
  } catch (e) {
    console.error(e)
    res.status(500).send(e)
  }
})

export const strategyController = router
