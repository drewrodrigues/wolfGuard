import express from 'express'
import cache from 'memory-cache'
import { IStrategy, IStrategyResponse } from '../../../common'
import { runStrategy } from '../access/strategy'
const router = express.Router()

function cacheKey(
  symbol: string,
  closeOutNMinutesBeforeMarketClose: number,
  buyStrategy: string,
  sellStrategy: string
) {
  return `symbol=${symbol}-closeOutNMinutesBeforeMarketClose=${closeOutNMinutesBeforeMarketClose}-buyStrategy=${buyStrategy}-sellStrategy=${sellStrategy}`
}

const ORB_BUY_DURATIONS = [1, 5, 10, 15, 30]
const SMA_SELL_DROP_DURATIONS = [3, 4, 5, 10, 20, 30, 60]

router.post('/', async (req, res) => {
  const overallRuns: IStrategyResponse = []
  // TODO allow configuring starting portfolio size and buy position
  // TODO add portfolio balance at each point after an order (this will allow client
  // TODO to chart this)
  const {
    symbol,
    closeOutNMinutesBeforeMarketClose,
    buyStrategy,
    sellStrategy
  } = req.body

  let cachedResponse
  try {
    cachedResponse = JSON.parse(
      cache.get(
        cacheKey(
          symbol,
          closeOutNMinutesBeforeMarketClose,
          buyStrategy,
          sellStrategy
        )
      )
    )
  } catch (e) {
    console.error('Issue pulling from cache', e)
  }

  if (cachedResponse) {
    console.log('Returning cached response')
    res.send(cachedResponse)
  } else {
    console.log("Couldn't pull a cached response. Getting a new one")
    try {
      if (
        !symbol ||
        !closeOutNMinutesBeforeMarketClose ||
        !buyStrategy ||
        !sellStrategy
      ) {
        throw new Error('Required params are missing')
      }

      for (let i = 0; i < ORB_BUY_DURATIONS.length; i++) {
        const orbBuy = ORB_BUY_DURATIONS[i]

        for (let j = 0; j < SMA_SELL_DROP_DURATIONS.length; j++) {
          const smaSell = SMA_SELL_DROP_DURATIONS[j]

          const strategyResult = await runStrategy(
            { strategy: buyStrategy, quantity: orbBuy }, // TODO: make these quantities configurable
            {
              strategy: sellStrategy,
              quantity: smaSell, // TODO: make these quantities configurable
              closeOutNMinutesBeforeMarketClose
            },
            symbol
          )

          const buildStrategyRun = {
            strategyResult,
            ...{
              setup: {
                symbol,
                orbBuyDuration: orbBuy,
                smaSellDuration: smaSell
              }
            }
          }
          const buySellCombinationRun: IStrategy = {
            buyStrategy: orbBuy,
            sellStrategy: smaSell,
            ...buildStrategyRun
          }
          overallRuns.push({ ...buildStrategyRun, ...buySellCombinationRun })
        }
      }

      cache.put(
        cacheKey(
          symbol,
          closeOutNMinutesBeforeMarketClose,
          buyStrategy,
          sellStrategy
        ),
        JSON.stringify(overallRuns)
      )
      res.send(overallRuns)
    } catch (e) {
      console.error(e)
      res.status(500).send({ error: (e as Error).message })
    }
  }
})

export const strategyController = router
