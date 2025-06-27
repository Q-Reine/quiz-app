"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { useGame } from "../contexts/GameContext"
import { useAuth } from "../contexts/AuthContext"

export default function GameResultsScreen() {
  const navigation = useNavigation()
  const { currentRoom, leaveRoom } = useGame()
  const { user } = useAuth()

  if (!currentRoom || !user) {
    navigation.navigate("Dashboard")
    return null
  }

  const userPlayer = currentRoom.players.find((p) => p.id === user.id)
  const opponent = currentRoom.players.find((p) => p.id !== user.id)
  const isWinner = (userPlayer?.score || 0) > (opponent?.score || 0)
  const isDraw = (userPlayer?.score || 0) === (opponent?.score || 0)

  const handlePlayAgain = () => {
    leaveRoom()
    navigation.navigate("Matchmaking")
  }

  const handleBackToDashboard = () => {
    leaveRoom()
    navigation.navigate("Dashboard")
  }

  return (
    <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Result Header */}
        <View style={styles.resultHeader}>
          <View style={styles.resultIcon}>
            {isWinner ? (
              <Text style={styles.resultEmoji}>🏆</Text>
            ) : isDraw ? (
              <Text style={styles.resultEmoji}>🤝</Text>
            ) : (
              <Text style={styles.resultEmoji}>💪</Text>
            )}
          </View>

          <Text style={styles.resultTitle}>{isWinner ? "Victory! 🎉" : isDraw ? "Draw! 🤝" : "Good Game! 💪"}</Text>

          <Text style={styles.resultSubtitle}>
            {isWinner
              ? "Congratulations! You won this battle!"
              : isDraw
                ? "Great match! It's a tie!"
                : "Keep practicing and you'll improve!"}
          </Text>
        </View>

        {/* Final Scores */}
        <View style={styles.scoresCard}>
          <Text style={styles.scoresTitle}>Final Scores</Text>

          <View style={styles.scoresContainer}>
            {/* User Score */}
            <View style={[styles.scoreCard, isWinner && styles.winnerCard]}>
              <View style={styles.scoreAvatar}>
                <Text style={styles.scoreAvatarText}>{user.avatar}</Text>
              </View>
              <Text style={styles.scoreName}>{user.username}</Text>
              <Text style={styles.scoreValue}>{userPlayer?.score || 0}</Text>
              <View style={styles.scoreElo}>
                <Text style={styles.scoreEloText}>{user.eloRating} ELO</Text>
              </View>
              {isWinner && (
                <View style={styles.winnerBadge}>
                  <Text style={styles.winnerBadgeText}>🏆 Winner</Text>
                </View>
              )}
            </View>

            {/* Opponent Score */}
            <View style={[styles.scoreCard, !isWinner && !isDraw && styles.winnerCard]}>
              <View style={[styles.scoreAvatar, styles.opponentAvatar]}>
                <Text style={styles.scoreAvatarText}>{opponent?.avatar}</Text>
              </View>
              <Text style={styles.scoreName}>{opponent?.username}</Text>
              <Text style={styles.scoreValue}>{opponent?.score || 0}</Text>
              <View style={styles.scoreElo}>
                <Text style={styles.scoreEloText}>{opponent?.eloRating} ELO</Text>
              </View>
              {!isWinner && !isDraw && (
                <View style={styles.winnerBadge}>
                  <Text style={styles.winnerBadgeText}>🏆 Winner</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Game Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Game Statistics</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statsColumn}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Category:</Text>
                <Text style={styles.statValue}>{currentRoom.category}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Difficulty:</Text>
                <Text style={styles.statValue}>{currentRoom.difficulty}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Questions:</Text>
                <Text style={styles.statValue}>{currentRoom.questions.length}</Text>
              </View>
            </View>

            <View style={styles.statsColumn}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Your Correct:</Text>
                <Text style={styles.statValue}>
                  {Math.floor((userPlayer?.score || 0) / 100)}/{currentRoom.questions.length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Opponent Correct:</Text>
                <Text style={styles.statValue}>
                  {Math.floor((opponent?.score || 0) / 100)}/{currentRoom.questions.length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Accuracy:</Text>
                <Text style={styles.statValue}>
                  {Math.round((Math.floor((userPlayer?.score || 0) / 100) / currentRoom.questions.length) * 100)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ELO Change */}
        <View style={styles.eloCard}>
          <View style={styles.eloHeader}>
            <Text style={styles.eloIcon}>📈</Text>
            <Text style={styles.eloTitle}>ELO Rating Change</Text>
          </View>
          <Text
            style={[
              styles.eloChange,
              {
                color: isWinner ? "#10B981" : isDraw ? "#F59E0B" : "#EF4444",
              },
            ]}
          >
            {isWinner ? "+15 ELO" : isDraw ? "+0 ELO" : "-10 ELO"}
          </Text>
          <Text style={styles.eloNewRating}>New Rating: {user.eloRating + (isWinner ? 15 : isDraw ? 0 : -10)}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handlePlayAgain}>
            <LinearGradient colors={["#10B981", "#3B82F6"]} style={styles.buttonGradient}>
              <Text style={styles.primaryButtonText}>🔄 Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToDashboard}>
            <Text style={styles.secondaryButtonText}>🏠 Back to Dashboard</Text>
          </TouchableOpacity>
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
  resultHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  resultIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  resultEmoji: {
    fontSize: 48,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  resultSubtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  scoresCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  scoresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  scoresContainer: {
    flexDirection: "row",
    gap: 16,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  winnerCard: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  scoreAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  opponentAvatar: {
    backgroundColor: "rgba(249, 115, 22, 0.3)",
  },
  scoreAvatarText: {
    fontSize: 24,
  },
  scoreName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  scoreElo: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  scoreEloText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "600",
  },
  winnerBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  winnerBadgeText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
  },
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 24,
  },
  statsColumn: {
    flex: 1,
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  eloCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  eloHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eloIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  eloTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  eloChange: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  eloNewRating: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
})
