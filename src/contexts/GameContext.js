"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSocket } from "./SocketContext"
import { useAuth } from "./AuthContext"
import { useToast } from "./ToastContext"

const GameContext = createContext(undefined)

const mockQuestions = [
  {
    id: "q1",
    question: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctAnswer: 2,
    category: "Geography",
    difficulty: "medium",
    timeLimit: 15,
  },
  {
    id: "q2",
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Au", "Ag", "Gd"],
    correctAnswer: 1,
    category: "Science",
    difficulty: "medium",
    timeLimit: 15,
  },
  {
    id: "q3",
    question: "Who painted the Mona Lisa?",
    options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"],
    correctAnswer: 2,
    category: "Art",
    difficulty: "easy",
    timeLimit: 15,
  },
  {
    id: "q4",
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Jupiter", "Saturn", "Mars"],
    correctAnswer: 1,
    category: "Science",
    difficulty: "easy",
    timeLimit: 15,
  },
  {
    id: "q5",
    question: "In which year did World War II end?",
    options: ["1944", "1945", "1946", "1947"],
    correctAnswer: 1,
    category: "History",
    difficulty: "medium",
    timeLimit: 15,
  },
]

export function GameProvider({ children }) {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [gamePhase, setGamePhase] = useState("lobby")
  const [playerAnswer, setPlayerAnswer] = useState(null)
  const [opponentAnswer, setOpponentAnswer] = useState(null)
  const [questionStartTime, setQuestionStartTime] = useState(null)

  const { user } = useAuth()
  const { sendMessage, onMessage, joinRoom: socketJoinRoom, leaveRoom: socketLeaveRoom } = useSocket()
  const { showToast } = useToast()

  // Timer effects
  useEffect(() => {
    if (gamePhase === "question" && timeLeft > 0 && playerAnswer === null) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gamePhase === "question" && playerAnswer === null) {
      submitAnswer(-1)
    }
  }, [timeLeft, gamePhase, playerAnswer])

  useEffect(() => {
    if (gamePhase === "countdown" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gamePhase === "countdown") {
      startNextQuestion()
    }
  }, [timeLeft, gamePhase])

  // Simulate opponent answers
  useEffect(() => {
    if (gamePhase === "question" && playerAnswer !== null && opponentAnswer === null && currentRoom) {
      const opponentDelay = Math.random() * 8000 + 2000
      const timer = setTimeout(() => {
        const randomAnswer = Math.floor(Math.random() * 4)
        setOpponentAnswer(randomAnswer)

        setCurrentRoom((prev) => {
          if (!prev) return prev
          const updatedPlayers = prev.players.map((p) =>
            p.id !== user?.id ? { ...p, hasAnswered: true, currentAnswer: randomAnswer, answerTime: Date.now() } : p,
          )
          return { ...prev, players: updatedPlayers }
        })

        setTimeout(() => {
          setGamePhase("results")
          setTimeout(() => {
            if (currentRoom.currentQuestion < currentRoom.questions.length - 1) {
              nextQuestion()
            } else {
              finishGame()
            }
          }, 3000)
        }, 500)
      }, opponentDelay)

      return () => clearTimeout(timer)
    }
  }, [gamePhase, playerAnswer, opponentAnswer, currentRoom, user])

  // Socket listeners
  useEffect(() => {
    onMessage("match_found", (data) => {
      setIsSearching(false)
      const room = {
        id: data.roomId,
        code: data.roomCode || "",
        players: [
          {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            eloRating: user.eloRating,
            score: 0,
            isReady: true,
            hasAnswered: false,
            currentAnswer: null,
            answerTime: null,
          },
          {
            id: data.opponent.id,
            username: data.opponent.username,
            avatar: data.opponent.avatar,
            eloRating: data.opponent.eloRating,
            score: 0,
            isReady: true,
            hasAnswered: false,
            currentAnswer: null,
            answerTime: null,
          },
        ],
        currentQuestion: 0,
        questions: mockQuestions.slice(0, 5),
        status: "waiting",
        category: data.category || "Mixed",
        difficulty: data.difficulty || "medium",
        maxPlayers: 2,
        startTime: null,
      }
      setCurrentRoom(room)
      socketJoinRoom(data.roomId)

      showToast("Match Found!", `You're matched with ${data.opponent.username}`, "success")

      setTimeout(() => {
        startGame()
      }, 3000)
    })
  }, [user])

  const createRoom = async (category, difficulty) => {
    try {
      if (!user) return null

      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const room = {
        id: `room_${Date.now()}`,
        code: roomCode,
        players: [
          {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            eloRating: user.eloRating,
            score: 0,
            isReady: true,
            hasAnswered: false,
            currentAnswer: null,
            answerTime: null,
          },
        ],
        currentQuestion: 0,
        questions: mockQuestions.slice(0, 5),
        status: "waiting",
        category,
        difficulty,
        maxPlayers: 2,
        startTime: null,
      }

      setCurrentRoom(room)
      socketJoinRoom(room.id)

      showToast("Room Created!", `Room code: ${roomCode}`, "success")
      return roomCode
    } catch (error) {
      showToast("Failed to Create Room", "Please try again", "error")
      return null
    }
  }

  const joinRoom = async (code) => {
    try {
      if (!user) return false

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const room = {
        id: `room_${Date.now()}`,
        code: code,
        players: [
          {
            id: "host_user",
            username: "RoomHost",
            avatar: "🎯",
            eloRating: 1400,
            score: 0,
            isReady: true,
            hasAnswered: false,
            currentAnswer: null,
            answerTime: null,
          },
          {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            eloRating: user.eloRating,
            score: 0,
            isReady: true,
            hasAnswered: false,
            currentAnswer: null,
            answerTime: null,
          },
        ],
        currentQuestion: 0,
        questions: mockQuestions.slice(0, 5),
        status: "waiting",
        category: "Mixed",
        difficulty: "medium",
        maxPlayers: 2,
        startTime: null,
      }

      setCurrentRoom(room)
      socketJoinRoom(room.id)

      showToast("Joined Room!", `Welcome to ${code}`, "success")

      setTimeout(() => {
        startGame()
      }, 2000)

      return true
    } catch (error) {
      showToast("Failed to Join Room", "Room not found or full", "error")
      return false
    }
  }

  const findMatch = async (category, difficulty) => {
    setIsSearching(true)
    sendMessage("find_match", { category, difficulty })
    showToast("Searching for Match", "Finding an opponent...", "info")
  }

  const startGame = () => {
    if (currentRoom && currentRoom.players.length === 2) {
      setCurrentRoom((prev) => (prev ? { ...prev, status: "playing", startTime: Date.now() } : prev))
      setGamePhase("countdown")
      setTimeLeft(3)
      showToast("Game Starting!", "Get ready for the first question", "info")
    }
  }

  const startNextQuestion = () => {
    if (currentRoom) {
      setGamePhase("question")
      setTimeLeft(15)
      setPlayerAnswer(null)
      setOpponentAnswer(null)
      setQuestionStartTime(Date.now())

      setCurrentRoom((prev) => {
        if (!prev) return prev
        const updatedPlayers = prev.players.map((p) => ({
          ...p,
          hasAnswered: false,
          currentAnswer: null,
          answerTime: null,
        }))
        return { ...prev, players: updatedPlayers }
      })
    }
  }

  const submitAnswer = (answerIndex) => {
    if (playerAnswer !== null) return

    const answerTime = Date.now()
    setPlayerAnswer(answerIndex)

    if (currentRoom && questionStartTime) {
      const currentQ = currentRoom.questions[currentRoom.currentQuestion]
      const isCorrect = answerIndex === currentQ.correctAnswer
      const timeTaken = answerTime - questionStartTime
      const timeBonus = Math.max(0, Math.floor((15000 - timeTaken) / 300))
      const points = isCorrect ? 100 + timeBonus : 0

      setCurrentRoom((prev) => {
        if (!prev) return prev
        const updatedPlayers = prev.players.map((p) =>
          p.id === user?.id
            ? {
                ...p,
                score: p.score + points,
                hasAnswered: true,
                currentAnswer: answerIndex,
                answerTime: answerTime,
              }
            : p,
        )
        return { ...prev, players: updatedPlayers }
      })

      sendMessage("answer_submitted", {
        roomId: currentRoom.id,
        questionId: currentQ.id,
        answer: answerIndex,
        timeTaken,
        isCorrect,
        points,
      })

      if (isCorrect) {
        showToast("Correct! 🎉", `+${points} points (${timeBonus} time bonus)`, "success")
      } else if (answerIndex === -1) {
        showToast("Time's Up! ⏰", "No answer submitted", "warning")
      } else {
        showToast("Incorrect 😔", "Better luck next time!", "error")
      }
    }
  }

  const nextQuestion = () => {
    if (currentRoom && currentRoom.currentQuestion < currentRoom.questions.length - 1) {
      setCurrentRoom((prev) => (prev ? { ...prev, currentQuestion: prev.currentQuestion + 1 } : prev))
      setGamePhase("countdown")
      setTimeLeft(2)
    } else {
      finishGame()
    }
  }

  const finishGame = () => {
    setGamePhase("finished")
    setCurrentRoom((prev) => (prev ? { ...prev, status: "finished" } : prev))

    if (currentRoom) {
      const userPlayer = currentRoom.players.find((p) => p.id === user?.id)
      const opponent = currentRoom.players.find((p) => p.id !== user?.id)
      const isWinner = (userPlayer?.score || 0) > (opponent?.score || 0)

      showToast(
        "Game Finished!",
        isWinner ? "Congratulations! You won! 🏆" : "Good game! Better luck next time! 💪",
        isWinner ? "success" : "info",
      )
    }
  }

  const leaveRoom = () => {
    if (currentRoom) {
      socketLeaveRoom(currentRoom.id)
      setCurrentRoom(null)
      setGamePhase("lobby")
      setPlayerAnswer(null)
      setOpponentAnswer(null)
      setTimeLeft(15)
      setQuestionStartTime(null)
    }
  }

  return (
    <GameContext.Provider
      value={{
        currentRoom,
        isSearching,
        timeLeft,
        gamePhase,
        playerAnswer,
        opponentAnswer,
        questionStartTime,
        createRoom,
        joinRoom,
        findMatch,
        submitAnswer,
        leaveRoom,
        startGame,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
