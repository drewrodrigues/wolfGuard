import express from 'express'
import { db } from '../access/db'
const router = express.Router()

// TODO: type me
const availableTypes = new Set(['1 min', '1 D'])

router.get('/:symbol', async (req, res) => {
  const {
    startDate = '2000-01-01',
    endDate = '2100-01-01',
    type = '1 min'
  } = req.query

  try {
    if (!availableTypes.has(type as string)) {
      throw new Error(`type=${type} is not valid.`)
    }

    console.log({ query: { startDate, endDate } })

    const bars = await db.bar.findMany({
      where: {
        symbol: req.params.symbol,
        time: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      }
    })
    res.send({ bars })
  } catch (e) {
    console.error(e)
    res.status(500).send({ error: e })
  }
})

export const barsController = router
