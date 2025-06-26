import { createContext, useContext, useEffect, useState } from "react"
import Toast from "react-native-toast-message"

import { gameService } from "../services/gameService"
import { useAuth } from "./AuthContext"

const GameContext = createContext()

export function GameProvider({ children }) {
  const { user } = useAuth()
  const [currentRoom, setCurrentRoom] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questions, setQuestions] = useState([])
  const [opponent, setOpponent] = useState(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [gamePhase, setGamePhase] = useState("waiting")
  const [playerAnswer, setPlayerAnswer] = useState(null)
  const [opponentAnswer, setOpponentAnswer] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  
  useEffect(() => {
    if (gamePhase === "question" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gamePhase === "question") {
      submitAnswer("")
    }
  }, [timeLeft, gamePhase])

 
  useEffect(() => {
    if (gamePhase === "answer" && playerAnswer !== null && !opponentAnswer) {
      const opponentDelay = Math.random() * 3000 + 1000 // 1-4 seconds
      const timer = setTimeout(() => {
        const randomAnswers = currentQuestion
          ? [currentQuestion.correct_answer, ...currentQuestion.incorrect_answers]
          : ["A", "B", "C", "D"]
        const randomAnswer = randomAnswers[Math.floor(Math.random() * randomAnswers.length)]
        setOpponentAnswer(randomAnswer)

       
        setTimeout(() => {
          setGamePhase("results")

          
          setTimeout(() => {
            if (currentQuestionIndex < 9) {
              nextQuestion()
            } else {
              setGamePhase("finished")
            }
          }, 3000)
        }, 500)
      }, opponentDelay)

      return () => clearTimeout(timer)
    }
  }, [gamePhase, playerAnswer, opponentAnswer, currentQuestion, currentQuestionIndex])

  const createRoom = async (categoryId, difficulty) => {
    try {
      const response = await gameService.createRoom(categoryId, difficulty)
      if (response.success) {
        setCurrentRoom(response.room)
        setGamePhase("waiting")

       
        const gameQuestions = gameService.getQuestionsByCategory(categoryId, difficulty, 10)
        setQuestions(gameQuestions)

        return response.room.room_code
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to Create Room",
          text2: response.message || "Please try again",
        })
        return null
      }
    } catch (error) {
      console.error("Create room error:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to create room",
      })
      return null
    }
  }

  const joinRoom = async (roomCode) => {
    try {
      const response = await gameService.joinRoom(roomCode)
      if (response.success) {
        setCurrentRoom(response.room)
        setOpponent(response.opponent)

       
        const gameQuestions = gameService.getQuestionsByCategory(
          response.room.category_id,
          response.room.difficulty,
          10,
        )
        setQuestions(gameQuestions)

      
        setTimeout(() => {
          startGame(gameQuestions)
        }, 2000)

        return true
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to Join Room",
          text2: response.message || "Room not found",
        })
        return false
      }
    } catch (error) {
      console.error("Join room error:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to join room",
      })
      return false
    }
  }

  const startGame = (gameQuestions) => {
    if (gameQuestions && gameQuestions.length > 0) {
      setCurrentQuestion(gameQuestions[0])
      setCurrentQuestionIndex(0)
      setGamePhase("question")
      setTimeLeft(15)
      setPlayerAnswer(null)
      setOpponentAnswer(null)
    }
  }

  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex)
      setCurrentQuestion(questions[nextIndex])
      setGamePhase("question")
      setTimeLeft(15)
      setPlayerAnswer(null)
      setOpponentAnswer(null)

      
      if (currentRoom) {
        setCurrentRoom({
          ...currentRoom,
          current_question: nextIndex,
        })
      }
    } else {
      setGamePhase("finished")
    }
  }

  const submitAnswer = async (answer) => {
    if (!currentRoom || !currentQuestion || !user) return

    try {
      setPlayerAnswer(answer)
      setGamePhase("answer")

      const response = await gameService.submitAnswer({
        roomId: currentRoom.id,
        questionId: currentQuestion.id,
        answer,
        timeTaken: (15 - timeLeft) * 1000,
      })

      if (response.success && response.isCorrect) {
        
        setCurrentRoom((prev) => ({
          ...prev,
          player1_score: prev.player1_score + 1,
        }))
      }
    } catch (error) {
      console.error("Submit answer error:", error)
    }
  }

  const leaveRoom = () => {
    setCurrentRoom(null)
    setCurrentQuestion(null)
    setQuestions([])
    setOpponent(null)
    setGamePhase("waiting")
    setPlayerAnswer(null)
    setOpponentAnswer(null)
    setTimeLeft(15)
    setCurrentQuestionIndex(0)
  }

  return (
    <GameContext.Provider
      value={{
        currentRoom,
        currentQuestion,
        questions,
        opponent,
        timeLeft,
        gamePhase,
        playerAnswer,
        opponentAnswer,
        createRoom,
        joinRoom,
        submitAnswer,
        leaveRoom,
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
