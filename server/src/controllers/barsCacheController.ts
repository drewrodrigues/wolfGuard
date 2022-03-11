import { Contract, SecType } from '@stoqey/ib'
import express from 'express'
import { db } from '../access/db'
import { getHistoricalData } from '../access/history'
const router = express.Router()

router.post('/:symbol', async (req, res) => {
  const {
    params: { symbol },
    body: { exchange }
  } = req

  if (!symbol || !exchange) {
    res
      .status(500)
      .send(`Missing required params symbol=${symbol} or exhange=${exchange}`)
  } else {
    const contract: Contract = {
      symbol: req.params.symbol, // should be MSFT for now
      exchange: req.body.exchange,
      currency: 'USD',
      secType: SecType.STK
    }
    console.log({ contract })
    try {
      if (!contract.symbol || !contract.exchange) {
        throw new Error('No symbol or exchange specified')
      }
      const bars = await getHistoricalData(contract)
      console.log('saving bars')
      db.bar
        .createMany({ data: bars, skipDuplicates: true })
        .then(() => {
          console.log('bars saved')
        })
        .catch((e) => {
          console.error(e)
          console.error('bars failed to save')
        })
      console.log('after bars')
      res.send({ bars })
    } catch (e: any) {
      console.error(e)
      console.error('Oh noes')
      res.status(500).send(e)
    }
  }
})

export const barsCacheController = router
