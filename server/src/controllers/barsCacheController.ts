import { Contract, SecType } from '@stoqey/ib'
import express from 'express'
import { db } from '../access/db'
import { getHistoricalData } from '../access/history'
const router = express.Router()

router.get('/:symbol', async (req, res) => {
  const contract: Contract = {
    symbol: req.params.symbol, // should be MSFT for now
    exchange: req.body.exchange,
    currency: 'USD',
    secType: SecType.STK
  }
  try {
    const bars = await getHistoricalData(contract)
    console.log('saving bars')
    db.bar
      .createMany({ data: bars })
      .then(() => {
        console.log('bars saved')
      })
      .catch((e) => {
        console.error(e)
        console.error('bars failed to save')
      })
    console.log('after bars')
    res.send({ bars })
  } catch (e) {
    console.error(e)
    console.error('Oh noes')
    res.status(500).send(e)
  }
})

export const barsCacheController = router
