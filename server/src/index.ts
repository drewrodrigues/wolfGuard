import { EventName } from '@stoqey/ib'
import cors from 'cors'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import { Server } from 'socket.io'
import { db } from './access/db'
import { initConnection } from './access/ib'
import { startLiveBars, stopLiveBars } from './access/liveBars'
import { getOpenOrders, getPositions } from './access/orders'
import { buyStrategyIncreasingBars } from './access/strategy/buyStrategyIncreasingBars'
import { sellStrategyDecreasingBars } from './access/strategy/sellStrategyDecreasingBars'
import { barsCacheController } from './controllers/barsCacheController'
import { barsController } from './controllers/barsController'
import { strategyController } from './controllers/strategyController'
import { symbolsController } from './controllers/symbolsController'
import { traderController } from './controllers/traderController'
import { buyOrder } from './utils/buyOrder'
import { getDayTradingStatus } from './utils/getDayTradingStatus'
import { sellOrder } from './utils/sellOrder'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001']
  }
})

// TODO: we can put the caching middleware here based on the request body / params
// * this is so I wouldn't have to manually adding caching for each request
// ? also, we could add a timeout of how long until a new request is cached

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/bars', barsController)
app.use('/symbols', symbolsController)
app.use('/barsCache', barsCacheController)
app.use('/strategy', strategyController)
app.use('/trader', traderController)

// * once we send an order, there's a race condition
// * where the order is being processed, but won't
// * show up in `openOrders` for a moment
let buyOrderInFlight = false
let sellOrderInFlight = false

io.on('connection', async (socket) => {
  console.log('a socket connected with id=', socket.id)
  const ib = await initConnection()
  ib.on(EventName.error, (...args) => {
    console.log('EventName.error: ', args)
  })

  // keep open orders in memory after first query?
  // then keep in sync?
  // TODO: send these to the client -- and also store them in memory

  startLiveBars(async (update) => {
    const openOrders = await getOpenOrders()
    const positions = await getPositions()

    const dayTradingStatus = getDayTradingStatus(openOrders, positions)

    if (
      dayTradingStatus === 'closed-position' &&
      buyOrderInFlight &&
      sellOrderInFlight
    ) {
      // * reset so we can enter again
      buyOrderInFlight = false
      sellOrderInFlight = false
    }

    // TODO: check if we should buy or sell and return open positions with bar update
    // TODO: add (maxPositionPerTrade) & symbol
    let shouldCheckForBuySignal =
      dayTradingStatus === 'none' || dayTradingStatus === 'closed-position'
    let hasBuySignal = undefined
    try {
      if (shouldCheckForBuySignal) {
        hasBuySignal = buyStrategyIncreasingBars(update.bars, 3, 5000)
      }
    } catch (e) {
      console.error('Failed to buy with: ', e)
    }

    // TODO: pull this out into a utility which logs
    if (
      hasBuySignal &&
      !buyOrderInFlight &&
      !openOrders.length &&
      !positions.open.length
    ) {
      buyOrderInFlight = true
      console.log('Placing buy order at: ', hasBuySignal)
      // TODO: buy at current bars price (which will be close?)
      // db.liveTradingOrder.create({
      //   data: { symbol: hasBuySignal.bar.symbol, time: hasBuySignal.bar.time, barsDetail: }
      // })
      buyOrder(hasBuySignal.bar.close, hasBuySignal.lotSize)
    }

    const openPosition = positions.open[0]
    let hasSellSignal = undefined
    if (openPosition && !sellOrderInFlight) {
      hasSellSignal = sellStrategyDecreasingBars(
        update.bars,
        2,
        openPosition.lotSize
      )

      const shouldOrder =
        hasSellSignal &&
        !sellOrderInFlight &&
        !openOrders.length &&
        !buyOrderInFlight
      console.log({
        '!sellOrderInFlight': !sellOrderInFlight,
        '!openOrders.length': !openOrders.length,
        '!buyOrderInFlight': !buyOrderInFlight,
        hasSellSignal,
        shouldOrder
      })

      // ! wtf is up with this typing
      if (shouldOrder && hasSellSignal) {
        console.log('Opening sell order: ', hasSellSignal)
        sellOrderInFlight = true
        sellOrder(hasSellSignal.bar.close, hasSellSignal.lotSize)
      }
    }

    socket.emit('barUpdate', {
      ...update,
      hasBuySignal,
      hasSellSignal,
      openOrders,
      openPositions: positions.open,
      dayTradingStatus
    })
  })

  socket.on('disconnect', async () => {
    await stopLiveBars()
    ib.removeAllListeners(EventName.error)
    console.log('Socket disconnected & live bars stopped')
  })
})

server.listen(3001, () => {
  console.log('🚀 Server ready at http://localhost:3000')
})
