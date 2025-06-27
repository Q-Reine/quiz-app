"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { useGame } from "../contexts/GameContext"
import { useAuth } from "../contexts/AuthContext"

const { width } = Dimensions.get("window")

export default function GameBattleScreen() {
  const navigation = useNavigation()
  const { currentRoom, timeLeft, gamePhase, playerAnswer, opponentAnswer, submitAnswer } = useGame()
  const { user } = useAuth()
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  useEffect(() => {
    if (gamePhase === "finished") {
      navigation.navigate("GameResults")
    }
  }, [gamePhase, navigation])

  useEffect(() => {
    if (gamePhase === "question" && playerAnswer === null) {
      setSelectedAnswer(null)
    }
  }, [gamePhase, playerAnswer])

  if (!currentRoom || !user) {
    navigation.navigate("Dashboard")
    return null
  }

  const currentQuestion = currentRoom.questions[currentRoom.currentQuestion]
  const opponent = currentRoom.players.find((p) => p.id !== user.id)
  const userPlayer = currentRoom.players.find((p) => p.id === user.id)
  const progress = ((currentRoom.currentQuestion + 1) / currentRoom.questions.length) * 100

  const handleAnswerSelect = (answerIndex) => {
    if (playerAnswer !== null || gamePhase !== "question") return
    setSelectedAnswer(answerIndex)
    submitAnswer(answerIndex)
  }

  const getAnswerStyle = (index) => {
    if (gamePhase === "question") {
      if (selectedAnswer === index) {
        return [styles.answerButton, styles.selectedAnswer]
      }
      if (playerAnswer === null) {
        return [styles.answerButton, styles.activeAnswer]
      }
      return [styles.answerButton, styles.disabledAnswer]
    }

    if (gamePhase === "results") {
      if (index === currentQuestion.correctAnswer) {
        return [styles.answerButton, styles.correctAnswer]
      } else if (index === playerAnswer && index !== currentQuestion.correctAnswer) {
        return [styles.answerButton, styles.wrongAnswer]
      }
      return [styles.answerButton, styles.neutralAnswer]
    }

    return [styles.answerButton, styles.neutralAnswer]
  }

  const getTimerColor = () => {
    if (timeLeft <= 3) return "#EF4444"
    if (timeLeft <= 7) return "#F59E0B"
    return "#10B981"
  }

  // Countdown phase
  if (gamePhase === "countdown") {
    return (
      <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{timeLeft === 0 ? "GO!" : timeLeft}</Text>
          <Text style={styles.countdownSubtext}>
            {currentRoom.currentQuestion === 0 ? "Game Starting..." : "Next Question..."}
          </Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.questionInfo}>
            <Text style={styles.questionNumber}>
              Question {currentRoom.currentQuestion + 1} of {currentRoom.questions.length}
            </Text>
            <Text style={styles.category}>{currentQuestion.category}</Text>
          </View>

          {gamePhase === "question" && (
            <View style={styles.timerContainer}>
              <Text style={[styles.timerText, { color: getTimerColor() }]}>{timeLeft}s</Text>
              <View style={styles.timerBar}>
                <View
                  style={[
                    styles.timerProgress,
                    {
                      width: `${(timeLeft / 15) * 100}%`,
                      backgroundColor: getTimerColor(),
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Players Score */}
        <View style={styles.playersContainer}>
          <View style={styles.playerCard}>
            <Text style={styles.playerAvatar}>{user.avatar}</Text>
            <Text style={styles.playerName}>{user.username}</Text>
            <Text style={styles.playerScore}>{userPlayer?.score || 0}</Text>
            <View style={styles.playerStatus}>
              {userPlayer?.hasAnswered && <Text style={styles.statusText}>✓ Answered!</Text>}
              {!userPlayer?.hasAnswered && gamePhase === "question" && (
                <Text style={styles.statusText}>Thinking...</Text>
              )}
            </View>
          </View>

          <View style={styles.playerCard}>
            <Text style={styles.playerAvatar}>{opponent?.avatar}</Text>
            <Text style={styles.playerName}>{opponent?.username}</Text>
            <Text style={styles.playerScore}>{opponent?.score || 0}</Text>
            <View style={styles.playerStatus}>
              {opponent?.hasAnswered && <Text style={styles.statusText}>✓ Answered!</Text>}
              {!opponent?.hasAnswered && gamePhase === "question" && <Text style={styles.statusText}>Thinking...</Text>}
            </View>
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {currentQuestion.category} • {currentQuestion.difficulty}
            </Text>
          </View>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {gamePhase === "question" && (
            <Text style={styles.questionHint}>⚡ Choose your answer quickly for bonus points!</Text>
          )}
        </View>

        {/* Answers */}
        <View style={styles.answersContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getAnswerStyle(index)}
              onPress={() => handleAnswerSelect(index)}
              disabled={playerAnswer !== null || gamePhase !== "question"}
            >
              <View style={styles.answerContent}>
                <View style={styles.answerLetter}>
                  <Text style={styles.answerLetterText}>{String.fromCharCode(65 + index)}</Text>
                </View>
                <Text style={styles.answerText}>{option}</Text>

                {gamePhase === "results" && (
                  <View style={styles.answerIcon}>
                    {index === currentQuestion.correctAnswer ? (
                      <Text style={styles.correctIcon}>✓</Text>
                    ) : index === playerAnswer && index !== currentQuestion.correctAnswer ? (
                      <Text style={styles.wrongIcon}>✗</Text>
                    ) : null}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Game Phase Status */}
        <View style={styles.statusContainer}>
          {gamePhase === "question" && playerAnswer === null && (
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Choose your answer before time runs out!</Text>
              <Text style={styles.statusSubtitle}>⚡ Faster answers earn bonus points</Text>
            </View>
          )}

          {gamePhase === "question" && playerAnswer !== null && (
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>✓ Answer submitted!</Text>
              <Text style={styles.statusSubtitle}>Waiting for opponent...</Text>
            </View>
          )}

          {gamePhase === "results" && (
            <View style={styles.statusContent}>
              <Text
                style={[
                  styles.statusTitle,
                  {
                    color:
                      playerAnswer === currentQuestion.correctAnswer
                        ? "#10B981"
                        : playerAnswer === -1
                          ? "#F59E0B"
                          : "#EF4444",
                  },
                ]}
              >
                {playerAnswer === currentQuestion.correctAnswer
                  ? "Correct! 🎉"
                  : playerAnswer === -1
                    ? "Time's Up! ⏰"
                    : "Incorrect 😔"}
              </Text>

              <View style={styles.resultCard}>
                <Text style={styles.resultText}>
                  <Text style={styles.resultLabel}>Correct Answer: </Text>
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </Text>
                {playerAnswer === currentQuestion.correctAnswer && userPlayer && (
                  <Text style={styles.pointsEarned}>
                    +{Math.floor(userPlayer.score - (userPlayer.score - 100) || 0)} points earned!
                  </Text>
                )}
              </View>

              <Text style={styles.statusSubtitle}>
                {currentRoom.currentQuestion < currentRoom.questions.length - 1
                  ? "Next question in 3 seconds..."
                  : "Calculating final results..."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 50,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    fontSize: 120,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  countdownSubtext: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.8)",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  questionInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  category: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  timerContainer: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  timerBar: {
    width: 80,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  timerProgress: {
    height: "100%",
    borderRadius: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 4,
  },
  playersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  playerCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  playerAvatar: {
    fontSize: 24,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  playerScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  playerStatus: {
    minHeight: 20,
  },
  statusText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  questionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryBadgeText: {
    color: "#C4B5FD",
    fontSize: 12,
    fontWeight: "500",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 16,
  },
  questionHint: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  answersContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  answerButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  activeAnswer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  selectedAnswer: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  disabledAnswer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  correctAnswer: {
    backgroundColor: "rgba(16, 185, 129, 0.3)",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  wrongAnswer: {
    backgroundColor: "rgba(239, 68, 68, 0.3)",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  neutralAnswer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  answerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  answerLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  answerLetterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    color: "white",
  },
  answerIcon: {
    marginLeft: 16,
  },
  correctIcon: {
    fontSize: 20,
    color: "#10B981",
  },
  wrongIcon: {
    fontSize: 20,
    color: "#EF4444",
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  statusContent: {
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  resultCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    width: "100%",
  },
  resultText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 8,
  },
  resultLabel: {
    fontWeight: "bold",
  },
  pointsEarned: {
    fontSize: 14,
    color: "#10B981",
    textAlign: "center",
    fontWeight: "500",
  },
})
