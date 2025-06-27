"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthContext"

const SocketContext = createContext(undefined)

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [eventListeners, setEventListeners] = useState(new Map())
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setIsConnected(true)
        setOnlineUsers(["user_1", "user_2", "user_3", "user_4"])
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      setIsConnected(false)
      setOnlineUsers([])
    }
  }, [user])

  const joinRoom = (roomId) => {
    console.log(`Joining room: ${roomId}`)
  }

  const leaveRoom = (roomId) => {
    console.log(`Leaving room: ${roomId}`)
  }

  const sendMessage = (event, data) => {
    console.log(`Sending ${event}:`, data)

    setTimeout(
      () => {
        const listeners = eventListeners.get(event) || []
        listeners.forEach((callback) => {
          if (event === "find_match") {
            callback({
              matchFound: true,
              opponent: {
                id: "opponent_1",
                username: "QuizMaster",
                avatar: "🧠",
                eloRating: 1300,
              },
              roomId: `room_${Date.now()}`,
            })
          } else if (event === "answer_submitted") {
            callback({
              correct: Math.random() > 0.5,
              timeBonus: Math.floor(Math.random() * 100),
            })
          }
        })
      },
      1000 + Math.random() * 2000,
    )
  }

  const onMessage = (event, callback) => {
    const currentListeners = eventListeners.get(event) || []
    const newListeners = [...currentListeners, callback]
    setEventListeners((prev) => new Map(prev.set(event, newListeners)))
  }

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        onlineUsers,
        joinRoom,
        leaveRoom,
        sendMessage,
        onMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
