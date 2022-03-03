import express from 'express'
import { db } from '../access/db'
const router = express.Router()

router.get('/', async (req, res) => {
  if (req.query.withCount === 'true') {
    const symbolWithCount =
      await db.$queryRaw`select symbol, count(symbol) from "Bar" group by symbol;`
    res.send(symbolWithCount)
  } else {
    const symbols = await db.$queryRaw`select DISTINCT(symbol) from "Bar";`
    res.send(symbols)
  }
})

export const symbolsController = router
