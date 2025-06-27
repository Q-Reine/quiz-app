"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../contexts/AuthContext"

export default function ProfileScreen() {
  const navigation = useNavigation()
  const { user, updateProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  })
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    vibrationEnabled: true,
  })

  if (!user) {
    navigation.navigate("Dashboard")
    return null
  }

  const handleSaveProfile = async () => {
    const success = await updateProfile(editData)
    if (success) {
      setIsEditing(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigation.navigate("Welcome")
  }

  const getRankInfo = (eloRating) => {
    if (eloRating >= 2000) return { rank: "Grandmaster", color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.2)" }
    if (eloRating >= 1800) return { rank: "Master", color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.2)" }
    if (eloRating >= 1600) return { rank: "Expert", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.2)" }
    if (eloRating >= 1400) return { rank: "Advanced", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.2)" }
    if (eloRating >= 1200) return { rank: "Intermediate", color: "#F97316", bgColor: "rgba(249, 115, 22, 0.2)" }
    return { rank: "Beginner", color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.2)" }
  }

  const rankInfo = getRankInfo(user.eloRating)
  const winRate = user.totalGames > 0 ? Math.round((user.wins / user.totalGames) * 100) : 0

  return (
    <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Dashboard")}>
            <Text style={styles.backButtonText}>← Back to Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{user.avatar}</Text>
            </View>

            <View style={styles.profileInfo}>
              {isEditing ? (
                <View style={styles.editForm}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Username</Text>
                    <TextInput
                      style={styles.input}
                      value={editData.username}
                      onChangeText={(text) => setEditData((prev) => ({ ...prev, username: text }))}
                      placeholder="Username"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={editData.email}
                      onChangeText={(text) => setEditData((prev) => ({ ...prev, email: text }))}
                      placeholder="Email"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      keyboardType="email-address"
                    />
                  </View>
                  <View style={styles.editButtons}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.profileName}>{user.username}</Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                  <View style={styles.profileBadges}>
                    <View style={[styles.rankBadge, { backgroundColor: rankInfo.bgColor }]}>
                      <Text style={[styles.rankBadgeText, { color: rankInfo.color }]}>🏆 {rankInfo.rank}</Text>
                    </View>
                    <View style={styles.eloBadge}>
                      <Text style={styles.eloBadgeText}>{user.eloRating} ELO</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                      <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>🎯</Text>
            </View>
            <Text style={styles.statValue}>{user.totalGames}</Text>
            <Text style={styles.statLabel}>Total Games</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>🏆</Text>
            </View>
            <Text style={[styles.statValue, { color: "#10B981" }]}>{user.wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>❌</Text>
            </View>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>{user.losses}</Text>
            <Text style={styles.statLabel}>Losses</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>📊</Text>
            </View>
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
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

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <Text style={styles.settingsSubtitle}>Customize your game experience</Text>

          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Sound Effects</Text>
                <Text style={styles.settingDescription}>Play sounds during gameplay</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, soundEnabled: value }))}
                trackColor={{ false: "#374151", true: "#3B82F6" }}
                thumbColor={settings.soundEnabled ? "#FFFFFF" : "#9CA3AF"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Get notified about game invites</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, notificationsEnabled: value }))}
                trackColor={{ false: "#374151", true: "#3B82F6" }}
                thumbColor={settings.notificationsEnabled ? "#FFFFFF" : "#9CA3AF"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Vibration</Text>
                <Text style={styles.settingDescription}>Vibrate on correct/incorrect answers</Text>
              </View>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, vibrationEnabled: value }))}
                trackColor={{ false: "#374151", true: "#3B82F6" }}
                thumbColor={settings.vibrationEnabled ? "#FFFFFF" : "#9CA3AF"}
              />
            </View>
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
  logoutButton: {
    paddingVertical: 8,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 24,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  profileAvatarText: {
    fontSize: 40,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 16,
  },
  profileBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  eloBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eloBadgeText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "600",
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    color: "white",
    fontSize: 12,
  },
  editForm: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "white",
    fontSize: 16,
  },
  editButtons: {
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  activityCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
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
    padding: 16,
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
  settingsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 16,
    padding: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 20,
  },
  settingsList: {
    gap: 20,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
})
