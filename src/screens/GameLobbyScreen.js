import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { useGame } from "../contexts/GameContext"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"

export default function GameLobbyScreen() {
  const navigation = useNavigation()
  const [countdown, setCountdown] = useState(null)
  const { currentRoom, leaveRoom, gamePhase, startGame } = useGame()
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (gamePhase === "countdown" || gamePhase === "question") {
      navigation.navigate("GameBattle")
    }
  }, [gamePhase, navigation])

  useEffect(() => {
    if (currentRoom && currentRoom.players.length === 2 && currentRoom.status === "waiting") {
      setCountdown(5)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            return null
          }
          return prev - 1
        })
      }, 1000)

      const startTimer = setTimeout(() => {
        startGame()
      }, 5000)

      return () => {
        clearInterval(timer)
        clearTimeout(startTimer)
      }
    }
  }, [currentRoom, startGame])

  const copyRoomCode = () => {
    if (currentRoom?.code) {
      showToast("Room Code Copied!", "Share this code with your friends", "success")
    }
  }

  const handleLeaveRoom = () => {
    leaveRoom()
    navigation.navigate("Dashboard")
  }

  const handleStartGame = () => {
    if (currentRoom && currentRoom.players.length === 2) {
      startGame()
    } else {
      showToast("Cannot Start Game", "Need 2 players to start the game", "error")
    }
  }

  if (!currentRoom || !user) {
    navigation.navigate("Dashboard")
    return null
  }

  const isHost = currentRoom.players[0]?.id === user.id
  const opponent = currentRoom.players.find((p) => p.id !== user.id)
  const canStart = currentRoom.players.length === 2

  return (
    <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
      {countdown !== null && countdown > 0 && (
        <View style={styles.countdownOverlay}>
          <View style={styles.countdownContent}>
            <Text style={styles.countdownText}>{countdown}</Text>
            <Text style={styles.countdownSubtext}>Game starting...</Text>
            <View style={styles.countdownProgress}>
              <View style={[styles.countdownProgressFill, { width: `${((5 - countdown) / 5) * 100}%` }]} />
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleLeaveRoom}>
            <Text style={styles.backButtonText}>← Leave Room</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Lobby</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.roomInfoCard}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomTitle}>👥 Room: {currentRoom.code}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyRoomCode}>
              <Text style={styles.copyButtonText}>📋 Copy Code</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.roomDetails}>
            <View style={styles.roomDetailItem}>
              <Text style={styles.roomDetailLabel}>Category</Text>
              <Text style={styles.roomDetailValue}>{currentRoom.category}</Text>
            </View>
            <View style={styles.roomDetailItem}>
              <Text style={styles.roomDetailLabel}>Difficulty</Text>
              <Text style={styles.roomDetailValue}>{currentRoom.difficulty}</Text>
            </View>
            <View style={styles.roomDetailItem}>
              <Text style={styles.roomDetailLabel}>Questions</Text>
              <Text style={styles.roomDetailValue}>{currentRoom.questions.length}</Text>
            </View>
            <View style={styles.roomDetailItem}>
              <Text style={styles.roomDetailLabel}>Players</Text>
              <Text style={styles.roomDetailValue}>
                {currentRoom.players.length}/{currentRoom.maxPlayers}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.playersContainer}>
          <View style={styles.playerCard}>
            <View style={styles.playerHeader}>
              {isHost && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>Host</Text>
                </View>
              )}
              <Text style={styles.playerTitle}>Player 1</Text>
            </View>

            <View style={styles.playerContent}>
              <View style={styles.playerAvatar}>
                <Text style={styles.playerAvatarText}>{user.avatar}</Text>
              </View>
              <Text style={styles.playerName}>{user.username}</Text>
              <View style={styles.playerElo}>
                <Text style={styles.playerEloText}>{user.eloRating} ELO</Text>
              </View>
              <View style={styles.playerStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ready</Text>
              </View>
            </View>
          </View>

          
          <View style={styles.playerCard}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerTitle}>{opponent ? "Player 2" : "Waiting for Player..."}</Text>
            </View>

            <View style={styles.playerContent}>
              {opponent ? (
                <>
                  <View style={[styles.playerAvatar, styles.opponentAvatar]}>
                    <Text style={styles.playerAvatarText}>{opponent.avatar}</Text>
                  </View>
                  <Text style={styles.playerName}>{opponent.username}</Text>
                  <View style={styles.playerElo}>
                    <Text style={styles.playerEloText}>{opponent.eloRating} ELO</Text>
                  </View>
                  <View style={styles.playerStatus}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Ready</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.waitingAvatar}>
                    <Text style={styles.waitingAvatarText}>👥</Text>
                  </View>
                  <Text style={styles.waitingText}>Waiting for opponent...</Text>
                  <Text style={styles.waitingSubtext}>Share the room code with a friend!</Text>
                  <View style={styles.roomCodeDisplay}>
                    <Text style={styles.roomCodeText}>
                      Room Code: <Text style={styles.roomCodeValue}>{currentRoom.code}</Text>
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>⚙️ Game Rules</Text>

          <View style={styles.rulesContent}>
            <View style={styles.rulesSection}>
              <Text style={styles.rulesSectionTitle}>⏱️ Timing & Scoring</Text>
              <Text style={styles.rulesText}>• 15 seconds per question</Text>
              <Text style={styles.rulesText}>• Correct answer: 100 points</Text>
              <Text style={styles.rulesText}>• Speed bonus: Up to 50 points</Text>
              <Text style={styles.rulesText}>• Wrong/No answer: 0 points</Text>
            </View>

            <View style={styles.rulesSection}>
              <Text style={styles.rulesSectionTitle}>🎮 Gameplay</Text>
              <Text style={styles.rulesText}>• {currentRoom.questions.length} questions total</Text>
              <Text style={styles.rulesText}>• Real-time multiplayer battle</Text>
              <Text style={styles.rulesText}>• Fastest correct answers win</Text>
              <Text style={styles.rulesText}>• Live score updates</Text>
            </View>
          </View>
        </View>

        {isHost && (
          <View style={styles.startGameContainer}>
            <TouchableOpacity
              style={[styles.startGameButton, !canStart && styles.disabledButton]}
              onPress={handleStartGame}
              disabled={!canStart}
            >
              <LinearGradient
                colors={canStart ? ["#10B981", "#3B82F6"] : ["#6B7280", "#6B7280"]}
                style={styles.startGameGradient}
              >
                <Text style={styles.startGameText}>{canStart ? "▶️ Start Game" : "⏳ Waiting for Players"}</Text>
              </LinearGradient>
            </TouchableOpacity>
            {canStart && (
              <Text style={styles.autoStartText}>Game will start automatically in {countdown || 5} seconds</Text>
            )}
          </View>
        )}

        
        {!isHost && (
          <View style={styles.statusContainer}>
            {canStart ? (
              <View style={styles.readyStatus}>
                <Text style={styles.readyStatusTitle}>▶️ All players ready!</Text>
                <Text style={styles.readyStatusText}>Waiting for host to start the game...</Text>
                {countdown && <Text style={styles.autoStartText}>Auto-starting in {countdown} seconds</Text>}
              </View>
            ) : (
              <View style={styles.waitingStatus}>
                <Text style={styles.waitingStatusText}>
                  Waiting for {currentRoom.maxPlayers - currentRoom.players.length} more player(s)
                </Text>
              </View>
            )}
          </View>
        )}
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
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  countdownContent: {
    alignItems: "center",
  },
  countdownText: {
    fontSize: 120,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  countdownSubtext: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  countdownProgress: {
    width: 128,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  countdownProgressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  headerSpacer: {
    width: 80,
  },
  roomInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  copyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  copyButtonText: {
    color: "white",
    fontSize: 12,
  },
  roomDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  roomDetailItem: {
    flex: 1,
    minWidth: "45%",
  },
  roomDetailLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  roomDetailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textTransform: "capitalize",
  },
  playersContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 16,
  },
  playerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  hostBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  hostBadgeText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "600",
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  playerContent: {
    alignItems: "center",
  },
  playerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  opponentAvatar: {
    backgroundColor: "rgba(249, 115, 22, 0.3)",
  },
  playerAvatarText: {
    fontSize: 32,
  },
  playerName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  playerElo: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  playerEloText: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "600",
  },
  playerStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  statusText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "500",
  },
  waitingAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  waitingAvatarText: {
    fontSize: 32,
    opacity: 0.5,
  },
  waitingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 8,
  },
  waitingSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
  },
  roomCodeDisplay: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
  },
  roomCodeText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  roomCodeValue: {
    fontFamily: "monospace",
    fontWeight: "bold",
    color: "white",
  },
  rulesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  rulesContent: {
    gap: 16,
  },
  rulesSection: {
    gap: 8,
  },
  rulesSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
  },
  startGameContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  startGameButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  startGameGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  startGameText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  autoStartText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  readyStatus: {
    alignItems: "center",
  },
  readyStatusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  readyStatusText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  waitingStatus: {
    alignItems: "center",
  },
  waitingStatusText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
})
