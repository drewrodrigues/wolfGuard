import React, { useEffect, useState } from 'react'
import { useSocket } from '../hooks/useSocket'

export function Trader() {
  const { socketStatus, socket } = useSocket()
  const [liveBars, setLiveBars] = useState<object>({})

  useEffect(() => {
    if (socketStatus === 'connected') {
      console.log('Listening for barUpdate')
      socket.on<any>('barUpdate', (arg: any) => {
        console.log('Received `barUpdate`')
        console.log(arg)
        setLiveBars(arg)
      })
    }
  }, [socketStatus])

  return (
    <main>
      <h2>Socket status: {socketStatus}</h2>

      {Object.keys(liveBars).map((dateTime) => {
        // @ts-ignore
        const barData = liveBars[dateTime]

        return (
          <div className="mb-[5px] rounded-[5px] text-white bg-[#333] border-stone-700 p-[20px]">
            <p>time: {barData.time}</p>
            <p>high: {barData.high}</p>
            <p>low: {barData.low}</p>
            <p>open: {barData.open}</p>
            <p>close: {barData.close}</p>
            <p>wap: {barData.wap}</p>
            <p>volume: {barData.volume}</p>
          </div>
        )
      })}
    </main>
  )
}
