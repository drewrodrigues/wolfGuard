import express from 'express'
import cache from 'memory-cache'
import { IStrategy, IStrategyResponse } from '../../../common'
import { runStrategy } from '../access/strategy'
const router = express.Router()

function cacheKey(symbol: string, lotSize: string) {
  return `symbol=${symbol}-lotSize=${lotSize}`
}

const ORB_BUY_DURATIONS = [1, 5, 10, 15, 30]
const SMA_SELL_DROP_DURATIONS = [3, 4, 5, 10, 20, 30, 60]
// ! go from 0 < 1000 and push at the below intervals

router.post('/', async (req, res) => {
  const overallRuns: IStrategyResponse = []
  // TODO allow configuring starting portfolio size and buy position
  // TODO add portfolio balance at each point after an order (this will allow client
  // TODO to chart this)
  const { symbol, lotSize } = req.body

  let cachedResponse
  try {
    cachedResponse = JSON.parse(cache.get(cacheKey(symbol, lotSize)))
  } catch (e) {
    console.error('Issue pulling from cache', e)
  }

  if (cachedResponse) {
    console.log('Returning cached response')
    res.send(cachedResponse)
  } else {
    console.log("Couldn't pull a cached response. Getting a new one")
    try {
      if (!symbol || !lotSize) {
        throw new Error('Required params are missing')
      }

      for (let i = 0; i < ORB_BUY_DURATIONS.length; i++) {
        const orbBuy = ORB_BUY_DURATIONS[i]

        for (let j = 0; j < SMA_SELL_DROP_DURATIONS.length; j++) {
          const smaSell = SMA_SELL_DROP_DURATIONS[j]

          try {
            const strategyResult = await runStrategy({
              buyOptions: { buyCondition: { orbDuration: orbBuy } },
              sellOptions: { sellCondition: { smaDuration: smaSell } },
              symbol,
              lotSize
            })

            const builtStrageyRun = {
              strategyResult,
              ...{
                setup: {
                  symbol,
                  orbBuyDuration: orbBuy,
                  smaSellDuration: smaSell,
                  lotSize
                }
              }
            }
            const buySellCombinationRun: IStrategy = {
              buyStrategy: orbBuy,
              sellStrategy: smaSell,
              ...builtStrageyRun
            }
            overallRuns.push({ ...builtStrageyRun, ...buySellCombinationRun })
          } catch (e) {
            console.error('Failed to run strategy', e)
          }
        }
      }

      cache.put(cacheKey(symbol, lotSize), JSON.stringify(overallRuns))
      res.send(overallRuns)
    } catch (e) {
      console.error(e)
      res.status(500).send(e)
    }
  }
})

export const strategyController = router
