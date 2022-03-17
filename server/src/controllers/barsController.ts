import express from 'express'
import { db } from '../access/db'
const router = express.Router()

router.get('/:symbol', async (req, res) => {
  const { startDate = '2000-01-01', endDate = '2100-01-01' } = req.query
  console.log({ query: { startDate, endDate } })

  try {
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
