import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { barsCacheController } from './controllers/barsCacheController'
import { barsController } from './controllers/barsController'
import { symbolsController } from './controllers/symbolsController'

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/bars', barsController)
app.use('/symbols', symbolsController)
app.use('/barsCache', barsCacheController)

app.listen(3000, () => {
  console.log('🚀 Server ready at http://localhost:3000')
})
