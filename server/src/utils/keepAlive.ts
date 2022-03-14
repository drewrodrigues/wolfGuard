export function keepAlive(): NodeJS.Timer {
  return setInterval(() => {
    console.log(`Ping <${'-'.repeat(Math.floor(Math.random() * 20))}`)
  }, 1000 * 10)
}
