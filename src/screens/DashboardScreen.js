"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialIcons"
import { Picker } from "@react-native-picker/picker"
import * as Animatable from "react-native-animatable"

import { useAuth } from "../contexts/AuthContext"
import { useGame } from "../contexts/GameContext"
import { gameService } from "../services/gameService"

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth()
  const { createRoom, joinRoom } = useGame()
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium")
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const response = await gameService.getCategories()
    if (response.success) {
      setCategories(response.categories)
      if (response.categories.length > 0) {
        setSelectedCategory(response.categories[0].id.toString())
      }
    }
  }

  const handleCreateRoom = async () => {
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category")
      return
    }

    setLoading(true)
    const roomCode = await createRoom(Number.parseInt(selectedCategory), selectedDifficulty)
    if (roomCode) {
      navigation.navigate("GameLobby")
    }
    setLoading(false)
  }

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert("Error", "Please enter a room code")
      return
    }

    setLoading(true)
    const success = await joinRoom(roomCode.trim().toUpperCase())
    if (success) {
      navigation.navigate("GameLobby")
    }
    setLoading(false)
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: logout },
    ])
  }

  return (
    <LinearGradient colors={["#f8fafc", "#e2e8f0", "#cbd5e1"]} style={styles.container}>
      <View style={styles.backgroundShapes}>
        <LinearGradient colors={["#8b5cf6", "#a78bfa"]} style={[styles.shape, styles.shape1]} />
        <LinearGradient colors={["#ec4899", "#f472b6"]} style={[styles.shape, styles.shape2]} />
        <LinearGradient colors={["#06b6d4", "#67e8f9"]} style={[styles.shape, styles.shape3]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <LinearGradient colors={["#8b5cf6", "#a78bfa"]} style={styles.logoGradient}>
                <Icon name="psychology" size={20} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.headerTitle}>QuizBattle</Text>
              <View style={styles.eloContainer}>
                <Icon name="star" size={12} color="#f59e0b" />
                <Text style={styles.eloText}>{user?.elo_rating} ELO</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <Animatable.View animation="fadeInDown" style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome back, {user?.username}!</Text>
            <Text style={styles.welcomeSubtitle}>Ready for your next challenge?</Text>
          </Animatable.View>

          {/* Stats Cards */}
          <Animatable.View animation="fadeInUp" delay={200} style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient colors={["#10b981", "#34d399"]} style={styles.statGradient}>
                <Icon name="emoji-events" size={20} color="#FFFFFF" />
                <Text style={styles.statNumber}>{user?.wins}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient colors={["#ef4444", "#f87171"]} style={styles.statGradient}>
                <Icon name="close" size={20} color="#FFFFFF" />
                <Text style={styles.statNumber}>{user?.losses}</Text>
                <Text style={styles.statLabel}>Losses</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient colors={["#3b82f6", "#60a5fa"]} style={styles.statGradient}>
                <Icon name="games" size={20} color="#FFFFFF" />
                <Text style={styles.statNumber}>{user?.total_games}</Text>
                <Text style={styles.statLabel}>Games</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient colors={["#8b5cf6", "#a78bfa"]} style={styles.statGradient}>
                <Icon name="percent" size={20} color="#FFFFFF" />
                <Text style={styles.statNumber}>
                  {user?.total_games > 0 ? Math.round((user.wins / user.total_games) * 100) : 0}%
                </Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </LinearGradient>
            </View>
          </Animatable.View>

          {/* Create Room Card */}
          <Animatable.View animation="fadeInUp" delay={400} style={styles.card}>
            <View style={styles.cardHeader}>
              <LinearGradient colors={["#8b5cf6", "#a78bfa"]} style={styles.cardIcon}>
                <Icon name="add-circle" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Create Room</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={styles.picker}>
                  {categories.map((category) => (
                    <Picker.Item
                      key={category.id}
                      label={`${category.icon} ${category.name}`}
                      value={category.id.toString()}
                      color="#1e293b"
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Difficulty</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={selectedDifficulty} onValueChange={setSelectedDifficulty} style={styles.picker}>
                  <Picker.Item label="Easy" value="easy" color="#1e293b" />
                  <Picker.Item label="Medium" value="medium" color="#1e293b" />
                  <Picker.Item label="Hard" value="hard" color="#1e293b" />
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, loading && styles.disabledButton]}
              onPress={handleCreateRoom}
              disabled={loading}
            >
              <LinearGradient colors={["#8b5cf6", "#a78bfa"]} style={styles.buttonGradient}>
                <Icon name="add" size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>{loading ? "Creating..." : "Create Room"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          {/* Join Room Card */}
          <Animatable.View animation="fadeInUp" delay={600} style={styles.card}>
            <View style={styles.cardHeader}>
              <LinearGradient colors={["#06b6d4", "#67e8f9"]} style={styles.cardIcon}>
                <Icon name="group-add" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Join Room</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Room Code</Text>
              <View style={styles.inputContainer}>
                <Icon name="vpn-key" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={roomCode}
                  onChangeText={setRoomCode}
                  placeholder="Enter room code"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="characters"
                  maxLength={6}
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, loading && styles.disabledButton]}
              onPress={handleJoinRoom}
              disabled={loading}
            >
              <LinearGradient colors={["#06b6d4", "#67e8f9"]} style={styles.buttonGradient}>
                <Icon name="login" size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>{loading ? "Joining..." : "Join Room"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          {/* Quick Actions */}
          <Animatable.View animation="fadeInUp" delay={800} style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("Leaderboard")}>
              <LinearGradient colors={["#f59e0b", "#fbbf24"]} style={styles.quickActionGradient}>
                <Icon name="leaderboard" size={24} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Leaderboard</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("Profile")}>
              <LinearGradient colors={["#ec4899", "#f472b6"]} style={styles.quickActionGradient}>
                <Icon name="person" size={24} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundShapes: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  shape: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.08,
  },
  shape1: {
    width: 200,
    height: 200,
    top: "5%",
    right: "-10%",
  },
  shape2: {
    width: 150,
    height: 150,
    top: "50%",
    left: "-15%",
  },
  shape3: {
    width: 120,
    height: 120,
    bottom: "15%",
    right: "10%",
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    marginRight: 12,
  },
  logoGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  eloContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  eloText: {
    color: "#d97706",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  picker: {
    height: 50,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1e293b",
  },
  actionButton: {
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 16,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 8,
  },
})
