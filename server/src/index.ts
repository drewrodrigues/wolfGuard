import cors from 'cors'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import { Server } from 'socket.io'
import { liveBars } from './access/liveBars'
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

io.on('connection', (socket) => {
  console.log('a user connected, emitting barUpdate')

  console.log('Calling live bars')
  liveBars((update) => {
    console.log('Sending live bar update')
    socket.emit('barUpdate', update)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })
})

server.listen(3000, () => {
  console.log('🚀 Server ready at http://localhost:3000')
})
