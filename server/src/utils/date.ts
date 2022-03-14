// time always comes in as 20211222  15:29:00
// YYYYMMDD
// we change it to YYYY/MM/DD 15:29:00 (which the Date object can parse)
export function barTimeToDate(dateString: string): Date {
  const year = dateString.slice(0, 4)
  const month = dateString.slice(4, 6)
  const day = dateString.slice(6, 8)
  const time = dateString.slice(8)

  return new Date(`${year}/${month}/${day} ${time}`)
}

export function barTimeToSavableFormat(dateString: string): Date {
  return barTimeToDate(dateString)
}

export function barTimeToEtc(dateString: string): string {
  const date = barTimeToDate(dateString)
  return date.toLocaleString('en-US', { timeZone: 'America/New_York' })
}
