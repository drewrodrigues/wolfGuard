import fs from 'fs'
import { db } from '../access/db'
import { keepAlive } from '../utils/keepAlive'

const fileNames = fs.readdirSync('./oneDayBars')

async function createBars() {
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i]
    const filePath = `./oneDayBars/${fileName}`

    const file = fs.readFileSync(filePath, { encoding: 'utf-8' })
    const lines = file.split('\n')
    const linesWithColumns = lines.map((line) => {
      const [time, open, high, low, close, _, volume] = line.split(',')
      return {
        time: new Date(time),
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        volume: parseFloat(volume)
      }
    })

    console.log(fileName)
    const symbol = fileName.match(/\w+/)![0]

    for (const line of linesWithColumns) {
      try {
        await db.bar.create({
          data: {
            ...line,
            type: '1 D',
            symbol,
            dataSource: 'YAHOO'
          }
        })
      } catch (e) {
        if (e && (e as Error).message.includes('Unique constraint')) {
          // unique constraint, skip
        } else {
          console.error({ line })
          console.error(`Failed to create bar`, e)
        }
      }
    }
  }
}

createBars()
  .then(() => {
    console.log('Done creating bars')
  })
  .catch((e) => console.error(e))
