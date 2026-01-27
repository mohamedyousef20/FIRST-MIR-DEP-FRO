'use client'

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { toast } from 'sonner'

interface NotificationPayload {
  title: string
  message?: string
}

interface ISocketContext {
  socket: Socket | null
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
})

export const useSocket = () => {
  return useContext(SocketContext)
}

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = useMemo(
    () =>
      io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        withCredentials: true,
        transports: ['websocket'],
      }),
    []
  )

  useEffect(() => {
    socket.on('connect', () => {
      //console.log('Connected to WebSocket server')
    })

    socket.on('notification', (notif: NotificationPayload) => {
      toast.message(notif.title, {
        description: notif.message,
      })
    })

    socket.on('connect_error', (err: Error) => {
      console.error('Connection error:', err)
      toast.error('Connection to notification service failed')
    })

    return () => {
      socket.off('connect')
      socket.off('notification')
      socket.off('connect_error')
      socket.disconnect()
    }
  }, [socket])

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}
