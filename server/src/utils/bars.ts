import { Bar } from '@prisma/client'
import moment from 'moment'

export function barsByDay(bars: Bar[]) {
  const dateWithBars: Record<string, Bar[]> = {}

  bars.forEach((bar) => {
    const date = moment(bar.time).format('MM/DD/YYYY')
    if (dateWithBars[date]) {
      dateWithBars[date].push(bar)
    } else {
      dateWithBars[date] = [bar]
    }
  })

  return dateWithBars
}
