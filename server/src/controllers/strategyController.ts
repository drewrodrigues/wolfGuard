import express from 'express'
import { runStrategy } from '../access/strategy'
const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { symbol, orbBuyDuration, smaSellDuration, lotSize } = req.body

    if (!symbol || !orbBuyDuration || !smaSellDuration || !lotSize) {
      throw new Error('Require params are missing')
    }

    const strategyResult = await runStrategy({
      buyOptions: { buyCondition: { orbDuration: orbBuyDuration } },
      sellOptions: { sellCondition: { smaDuration: smaSellDuration } },
      symbol,
      lotSize
    })

    const strategyResponse = {
      ...strategyResult,
      ...{
        setup: {
          symbol,
          orbBuyDuration,
          smaSellDuration,
          lotSize
        }
      }
    }

    res.send(strategyResponse)
  } catch (e) {
    res.status(500).send(e)
  }
})

export const strategyController = router
