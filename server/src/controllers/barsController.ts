import express from 'express'
import { db } from '../access/db'
const router = express.Router()

router.get('/:symbol', async (req, res) => {
  try {
    const bars = await db.bar.findMany({ where: { symbol: req.params.symbol } })
    res.send({ bars })
  } catch (e) {
    res.status(500).send({ error: e })
  }
})

export const barsController = router
