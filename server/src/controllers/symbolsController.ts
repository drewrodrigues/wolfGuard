import express from 'express'
import { db } from '../access/db'
const router = express.Router()

const availableTypes = new Set(['1 min', '1 D'])

router.get('/', async (req, res) => {
  const { type = '1 min' } = req.query

  console.log({ query: req.query })

  try {
    if (!availableTypes.has(type as string)) {
      throw new Error(`type=${type} is not valid.`)
    }

    if (req.query.withCount === 'true') {
      const symbolWithCount =
        await db.$queryRaw`select symbol, count(symbol) from "Bar" where type=${type} group by symbol;`
      res.send(symbolWithCount)
    } else {
      const symbols =
        await db.$queryRaw`select DISTINCT(symbol) from "Bar" where type=${type};`
      res.send(symbols)
    }
  } catch (e) {
    res.status(500).send(e)
  }
})

export const symbolsController = router
