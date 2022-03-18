import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
// ? difference between io & socket?

const socket = io('http://localhost:3001')

type SocketStatus = 'disconnected' | 'connected'

export function useSocket() {
  const [socketStatus, setSocketStatus] = useState<SocketStatus>(() => {
    console.log('socket.connected: ', socket.connected)
    return socket.connected ? 'connected' : 'disconnected'
  })

  useEffect(() => {
    socket.removeAllListeners()

    socket.on('connect', () => {
      console.log('Socket (open)')
      setSocketStatus('connected')
    })

    socket.on('close', (reason) => {
      setSocketStatus('disconnected')
      console.log('Socket (close): ', reason)
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket (reconnect attempt): ', attemptNumber)
      setSocketStatus('connected')
    })

    if (socket.connected) {
      console.log('Socket (is already connected)')
      setSocketStatus('connected')
    } else {
      console.log('Socket (attempting connection)')
      socket.connect()
    }

    return () => {
      console.log(
        'Component unmounting. Removing all listeners & disconnecting socket'
      )
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [])

  return { socketStatus, socket }
}
