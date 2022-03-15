import cors from 'cors'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import { Server } from 'socket.io'
import { startLiveBars, stopLiveBars } from './access/liveBars'
import { getOpenOrders, getPositions } from './access/orders'
import { barsCacheController } from './controllers/barsCacheController'
import { barsController } from './controllers/barsController'
import { strategyController } from './controllers/strategyController'
import { symbolsController } from './controllers/symbolsController'
import { traderController } from './controllers/traderController'

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

io.on('connection', async (socket) => {
  console.log('a socket connected with id=', socket.id)

  // keep open orders in memory after first query?
  // then keep in sync?
  // TODO: send these to the client -- and also store them in memory

  startLiveBars(async (update) => {
    console.count('startLiveBars (update count)')
    const openOrders = await getOpenOrders()
    const positions = await getPositions()
    console.log('liveBars callback')
    
    // TODO: check if we should buy or sell and return open positions with bar update
    // let shouldBuy
    // try {
    //   shouldBuy = buyStrategyIncreasingBars(update.bars, 2)
    // } catch (e) {
    //   console.error('Failed to buy with: ', e)
    // }
    // console.log({ shouldBuy })

    // if (shouldBuy && !openOrders.length) {
    //   console.log('Attemping a buy order...')
    //   const lastBar = update.bars[update.bars.length - 1]
    //   buyOrder()
    // }

    socket.emit('barUpdate', {
      ...update,
      shouldBuy: false,
      openOrders,
      openPositions: positions
    })
  })

  socket.on('disconnect', async () => {
    await stopLiveBars()
    console.log('Socket disconnected & live bars stopped')
  })
})

server.listen(3000, () => {
  console.log('🚀 Server ready at http://localhost:3000')
})
