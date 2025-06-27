"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../contexts/AuthContext"
import { useGame } from "../contexts/GameContext"
import { useSocket } from "../contexts/SocketContext"

export default function DashboardScreen() {
  const navigation = useNavigation()
  const [roomCode, setRoomCode] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("mixed")
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium")

  const { user, logout } = useAuth()
  const { createRoom, joinRoom, findMatch, isSearching } = useGame()
  const { isConnected, onlineUsers } = useSocket()

  const handleCreateRoom = async () => {
    const code = await createRoom(selectedCategory, selectedDifficulty)
    if (code) {
      navigation.navigate("GameLobby")
    }
  }

  const handleJoinRoom = async () => {
    if (roomCode.trim()) {
      const success = await joinRoom(roomCode.trim().toUpperCase())
      if (success) {
        navigation.navigate("GameLobby")
      }
    }
  }

  const handleFindMatch = async () => {
    await findMatch(selectedCategory, selectedDifficulty)
    navigation.navigate("Matchmaking")
  }

  const handleLogout = () => {
    logout()
    navigation.navigate("Welcome")
  }

  if (!user) return null

  return (
    <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🧠</Text>
            </View>
            <View>
              <Text style={styles.appName}>QuizBattle</Text>
              <View style={styles.connectionStatus}>
                <View style={[styles.statusDot, { backgroundColor: isConnected ? "#10B981" : "#EF4444" }]} />
                <Text style={styles.statusText}>{isConnected ? "Connected" : "Disconnected"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.eloBadge}>
              <Text style={styles.eloText}>🏆 {user.eloRating} ELO</Text>
            </View>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate("Profile")}>
              <Text style={styles.headerButtonText}>⚙️ Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
              <Text style={styles.headerButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, {user.username}! 👋</Text>
          <Text style={styles.welcomeSubtitle}>Ready for your next quiz battle? Choose your game mode below.</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>⚡</Text>
            </View>
            <Text style={styles.statLabel}>Total Games</Text>
            <Text style={styles.statValue}>{user.totalGames}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>🏆</Text>
            </View>
            <Text style={styles.statLabel}>Wins</Text>
            <Text style={[styles.statValue, { color: "#10B981" }]}>{user.wins}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>📊</Text>
            </View>
            <Text style={styles.statLabel}>Win Rate</Text>
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>
              {user.totalGames > 0 ? Math.round((user.wins / user.totalGames) * 100) : 0}%
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>👥</Text>
            </View>
            <Text style={styles.statLabel}>Online Players</Text>
            <Text style={[styles.statValue, { color: "#8B5CF6" }]}>{onlineUsers.length}</Text>
          </View>
        </View>

        {/* Game Options */}
        <View style={styles.gameOptionsContainer}>
          {/* Quick Match */}
          <View style={styles.gameCard}>
            <View style={styles.gameCardHeader}>
              <Text style={styles.gameCardTitle}>⚡ Quick Match</Text>
              <Text style={styles.gameCardDescription}>Find an opponent instantly and start battling</Text>
            </View>

            <View style={styles.gameCardContent}>
              <View style={styles.optionsRow}>
                <View style={styles.optionContainer}>
                  <Text style={styles.optionLabel}>Category</Text>
                  <TouchableOpacity style={styles.selectButton}>
                    <Text style={styles.selectButtonText}>{selectedCategory}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.optionContainer}>
                  <Text style={styles.optionLabel}>Difficulty</Text>
                  <TouchableOpacity style={styles.selectButton}>
                    <Text style={styles.selectButtonText}>{selectedDifficulty}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleFindMatch} disabled={isSearching}>
                <LinearGradient colors={["#F59E0B", "#F97316"]} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>{isSearching ? "Searching..." : "🔍 Find Match"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Private Room */}
          <View style={styles.gameCard}>
            <View style={styles.gameCardHeader}>
              <Text style={styles.gameCardTitle}>👥 Private Room</Text>
              <Text style={styles.gameCardDescription}>Create a room or join with a code</Text>
            </View>

            <View style={styles.gameCardContent}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleCreateRoom}>
                <LinearGradient colors={["#3B82F6", "#8B5CF6"]} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>➕ Create Room</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.joinRoomContainer}>
                <Text style={styles.optionLabel}>Room Code</Text>
                <TextInput
                  style={styles.roomCodeInput}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={roomCode}
                  onChangeText={(text) => setRoomCode(text.toUpperCase())}
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={[styles.secondaryButton, roomCode.length !== 6 && styles.disabledButton]}
                onPress={handleJoinRoom}
                disabled={roomCode.length !== 6}
              >
                <Text style={styles.secondaryButtonText}>Join Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          <Text style={styles.activitySubtitle}>Your latest quiz battles</Text>

          <View style={styles.activityList}>
            {[
              { opponent: "QuizMaster", result: "win", score: "8-6", category: "Science", time: "2 hours ago" },
              { opponent: "BrainBox", result: "loss", score: "5-7", category: "History", time: "1 day ago" },
              { opponent: "TriviaKing", result: "win", score: "9-4", category: "Sports", time: "2 days ago" },
            ].map((game, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View
                    style={[styles.resultDot, { backgroundColor: game.result === "win" ? "#10B981" : "#EF4444" }]}
                  />
                  <View>
                    <Text style={styles.activityOpponent}>vs {game.opponent}</Text>
                    <Text style={styles.activityDetails}>
                      {game.category} • {game.time}
                    </Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Text style={[styles.activityResult, { color: game.result === "win" ? "#10B981" : "#EF4444" }]}>
                    {game.result === "win" ? "Victory" : "Defeat"}
                  </Text>
                  <Text style={styles.activityScore}>{game.score}</Text>
                </View>
              </View>
            ))}
          </View>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  eloBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  eloText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "600",
  },
  headerButton: {
    marginBottom: 4,
  },
  headerButtonText: {
    color: "white",
    fontSize: 12,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  gameOptionsContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  gameCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
  },
  gameCardHeader: {
    marginBottom: 16,
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  gameCardDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  gameCardContent: {
    gap: 16,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 16,
  },
  optionContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    color: "white",
    marginBottom: 8,
    fontWeight: "500",
  },
  selectButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectButtonText: {
    color: "white",
    fontSize: 16,
    textTransform: "capitalize",
  },
  primaryButton: {
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginHorizontal: 16,
  },
  joinRoomContainer: {
    gap: 8,
  },
  roomCodeInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "monospace",
  },
  secondaryButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  activityCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 24,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  activityOpponent: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  activityDetails: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  activityRight: {
    alignItems: "flex-end",
  },
  activityResult: {
    fontSize: 14,
    fontWeight: "bold",
  },
  activityScore: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
})
