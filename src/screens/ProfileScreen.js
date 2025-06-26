"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  Switch,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialIcons"
import * as Animatable from "react-native-animatable"

import { useAuth } from "../contexts/AuthContext"
import { gameService } from "../services/gameService"
import AvatarPicker from "../components/AvatarPicker"


export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile } = useAuth()
  const [stats, setStats] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [recentGames, setRecentGames] = useState([])
  const [loading, setLoading] = useState(true)

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [settingsModalVisible, setSettingsModalVisible] = useState(false)
  const [avatarModalVisible, setAvatarModalVisible] = useState(false)

  // Edit user form states
  const [editUsername, setEditUsername] = useState(user?.username || "")
  const [editEmail, setEditEmail] = useState(user?.email || "")

  // Settings states
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)

      // Fetch user stats
      const statsResponse = await gameService.getUserStats()
      if (statsResponse.success) {
        setStats(statsResponse.stats)
      }

      // Fetch achievements
      const achievementsResponse = await gameService.getUserAchievements()
      if (achievementsResponse.success) {
        setAchievements(achievementsResponse.achievements)
      }

      // Fetch recent games
      const gamesResponse = await gameService.getRecentGames()
      if (gamesResponse.success) {
        setRecentGames(gamesResponse.games)
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const success = await updateProfile({
        username: editUsername,
        email: editEmail,
      })

      if (success) {
        setEditModalVisible(false)
        Alert.alert("Success", "Profile updated successfully!")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile")
    }
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: logout },
    ])
  }

  const getRankInfo = (eloRating) => {
    if (eloRating >= 2000) return { rank: "Grandmaster", color: "#9C27B0", icon: "military-tech" }
    if (eloRating >= 1800) return { rank: "Master", color: "#FF9800", icon: "star" }
    if (eloRating >= 1600) return { rank: "Expert", color: "#2196F3", icon: "trending-up" }
    if (eloRating >= 1400) return { rank: "Advanced", color: "#4CAF50", icon: "thumb-up" }
    if (eloRating >= 1200) return { rank: "Intermediate", color: "#FF5722", icon: "school" }
    return { rank: "Beginner", color: "#9E9E9E", icon: "emoji-events" }
  }

  const rankInfo = getRankInfo(user?.elo_rating || 1200)

  if (loading) {
    return (
      <LinearGradient colors={["#FFF5F0", "#FFE5D9", "#FFCAB0"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Animatable.View animation="pulse" iterationCount="infinite">
              <Icon name="person" size={60} color="#FF6B35" />
            </Animatable.View>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#FFF5F0", "#FFE5D9", "#FFCAB0"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FF6B35" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => setSettingsModalVisible(true)} style={styles.settingsButton}>
            <Icon name="settings" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animatable.View animation="fadeInDown" style={styles.profileHeader}>
            <LinearGradient colors={["#FF6B35", "#FF4500"]} style={styles.profileCard}>
              <TouchableOpacity onPress={() => setAvatarModalVisible(true)} style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user?.username?.substring(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.editAvatarBadge}>
                  <Icon name="edit" size={12} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.profileInfo}>
                <Text style={styles.username}>{user?.username}</Text>
                <Text style={styles.email}>{user?.email}</Text>

                <View style={styles.rankContainer}>
                  <Icon name={rankInfo.icon} size={16} color={rankInfo.color} />
                  <Text style={[styles.rankText, { color: rankInfo.color }]}>{rankInfo.rank}</Text>
                </View>

                <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editButton}>
                  <Icon name="edit" size={16} color="#FF6B35" />
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animatable.View>

          
          <Animatable.View animation="fadeInUp" delay={200} style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.statGradient}>
                  <Icon name="emoji-events" size={24} color="#FFFFFF" />
                  <Text style={styles.statNumber}>{user?.wins || 0}</Text>
                  <Text style={styles.statLabel}>Wins</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient colors={["#F44336", "#C62828"]} style={styles.statGradient}>
                  <Icon name="close" size={24} color="#FFFFFF" />
                  <Text style={styles.statNumber}>{user?.losses || 0}</Text>
                  <Text style={styles.statLabel}>Losses</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient colors={["#2196F3", "#1565C0"]} style={styles.statGradient}>
                  <Icon name="games" size={24} color="#FFFFFF" />
                  <Text style={styles.statNumber}>{user?.total_games || 0}</Text>
                  <Text style={styles.statLabel}>Total Games</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient colors={["#9C27B0", "#6A1B9A"]} style={styles.statGradient}>
                  <Icon name="trending-up" size={24} color="#FFFFFF" />
                  <Text style={styles.statNumber}>{user?.elo_rating || 1200}</Text>
                  <Text style={styles.statLabel}>ELO Rating</Text>
                </LinearGradient>
              </View>
            </View>
          </Animatable.View>

          {/* Performance Chart */}
          <Animatable.View animation="fadeInUp" delay={400} style={styles.performanceSection}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.performanceCard}>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Win Rate</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={["#4CAF50", "#2E7D32"]}
                      style={[
                        styles.progressFill,
                        { width: `${user?.total_games > 0 ? (user.wins / user.total_games) * 100 : 0}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {user?.total_games > 0 ? Math.round((user.wins / user.total_games) * 100) : 0}%
                  </Text>
                </View>
              </View>

              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Accuracy</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient colors={["#FF9800", "#F57C00"]} style={[styles.progressFill, { width: "78%" }]} />
                  </View>
                  <Text style={styles.progressText}>78%</Text>
                </View>
              </View>

              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Speed</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient colors={["#2196F3", "#1565C0"]} style={[styles.progressFill, { width: "85%" }]} />
                  </View>
                  <Text style={styles.progressText}>85%</Text>
                </View>
              </View>
            </View>
          </Animatable.View>

          {/* Achievements */}
          <Animatable.View animation="fadeInUp" delay={600} style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
              {mockAchievements.map((achievement, index) => (
                <View key={index} style={styles.achievementCard}>
                  <LinearGradient
                    colors={achievement.unlocked ? ["#FFD700", "#FFA000"] : ["#E0E0E0", "#BDBDBD"]}
                    style={styles.achievementIcon}
                  >
                    <Icon name={achievement.icon} size={24} color={achievement.unlocked ? "#FFFFFF" : "#757575"} />
                  </LinearGradient>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              ))}
            </ScrollView>
          </Animatable.View>

          {/* Recent Games */}
          <Animatable.View animation="fadeInUp" delay={800} style={styles.recentGamesSection}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            {mockRecentGames.map((game, index) => (
              <View key={index} style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <View style={styles.gameResult}>
                    <Icon
                      name={game.result === "win" ? "check-circle" : "cancel"}
                      size={20}
                      color={game.result === "win" ? "#4CAF50" : "#F44336"}
                    />
                    <Text style={[styles.gameResultText, { color: game.result === "win" ? "#4CAF50" : "#F44336" }]}>
                      {game.result === "win" ? "Victory" : "Defeat"}
                    </Text>
                  </View>
                  <Text style={styles.gameDate}>{game.date}</Text>
                </View>

                <View style={styles.gameDetails}>
                  <Text style={styles.gameOpponent}>vs {game.opponent}</Text>
                  <Text style={styles.gameScore}>{game.score}</Text>
                  <Text style={styles.gameCategory}>{game.category}</Text>
                </View>
              </View>
            ))}
          </Animatable.View>

          {/* Logout Button */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={20} color="#F44336" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Edit Profile */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editUsername}
                    onChangeText={setEditUsername}
                    placeholder="Enter username"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="Enter email"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCancelButton}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleUpdateProfile} style={styles.modalSaveButton}>
                  <LinearGradient colors={["#FF6B35", "#FF4500"]} style={styles.modalSaveGradient}>
                    <Text style={styles.modalSaveText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Settings */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={settingsModalVisible}
          onRequestClose={() => setSettingsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Icon name="volume-up" size={20} color="#666" />
                    <Text style={styles.settingText}>Sound Effects</Text>
                  </View>
                  <Switch
                    value={soundEnabled}
                    onValueChange={setSoundEnabled}
                    trackColor={{ false: "#E0E0E0", true: "#FF6B35" }}
                    thumbColor={soundEnabled ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Icon name="notifications" size={20} color="#666" />
                    <Text style={styles.settingText}>Push Notifications</Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: "#E0E0E0", true: "#FF6B35" }}
                    thumbColor={notificationsEnabled ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Icon name="vibration" size={20} color="#666" />
                    <Text style={styles.settingText}>Vibration</Text>
                  </View>
                  <Switch
                    value={vibrationEnabled}
                    onValueChange={setVibrationEnabled}
                    trackColor={{ false: "#E0E0E0", true: "#FF6B35" }}
                    thumbColor={vibrationEnabled ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Avatar Picker */}
        <AvatarPicker
          visible={avatarModalVisible}
          onClose={() => setAvatarModalVisible(false)}
          onSelect={(avatar) => {
            setAvatarModalVisible(false)
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  )
}

// Mock data 
const mockAchievements = [
  {
    id: 1,
    title: "First Win",
    description: "Win your first game",
    icon: "emoji-events",
    unlocked: true,
  },
  {
    id: 2,
    title: "Speed Demon",
    description: "Answer 10 questions in under 5 seconds each",
    icon: "flash-on",
    unlocked: true,
  },
  {
    id: 3,
    title: "Perfect Game",
    description: "Get all 10 questions correct",
    icon: "star",
    unlocked: false,
  },
  {
    id: 4,
    title: "Streak Master",
    description: "Win 5 games in a row",
    icon: "trending-up",
    unlocked: false,
  },
]

const mockRecentGames = [
  {
    id: 1,
    opponent: "QuizMaster99",
    result: "win",
    score: "8-6",
    category: "Science",
    date: "2 hours ago",
  },
  {
    id: 2,
    opponent: "BrainBox42",
    result: "loss",
    score: "5-7",
    category: "History",
    date: "1 day ago",
  },
  {
    id: 3,
    opponent: "TriviaKing",
    result: "win",
    score: "9-4",
    category: "Sports",
    date: "2 days ago",
  },
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 107, 53, 0.1)",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
    color: "#FFFFFF",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF6B35",
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  performanceSection: {
    marginBottom: 24,
  },
  performanceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  performanceRow: {
    marginBottom: 16,
  },
  performanceLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    minWidth: 40,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsScroll: {
    paddingVertical: 8,
  },
  achievementCard: {
    width: 120,
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  recentGamesSection: {
    marginBottom: 24,
  },
  gameCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  gameResult: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameResultText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  gameDate: {
    fontSize: 12,
    color: "#666",
  },
  gameDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gameOpponent: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  gameScore: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B35",
    marginHorizontal: 12,
  },
  gameCategory: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F44336",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
  },
  modalSaveButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
  },
  modalSaveGradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
})
