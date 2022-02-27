import express from 'express'
import { db } from '../access/db'
const router = express.Router()

router.get('/', async (req, res) => {
  const barRecords = await db.bar.findMany({ distinct: 'symbol' })
  const distinctSymbols = barRecords.map((record) => record.symbol)
  console.log({ symbols: distinctSymbols })
  res.send({ symbols: distinctSymbols })
})

export const symbolsController = router
