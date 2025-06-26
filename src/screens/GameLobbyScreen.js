import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Clipboard } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialIcons"
import * as Animatable from "react-native-animatable"

import { useAuth } from "../contexts/AuthContext"
import { useGame } from "../contexts/GameContext"

export default function GameLobbyScreen({ navigation }) {
  const { user } = useAuth()
  const { currentRoom, opponent, leaveRoom } = useGame()
  const [copied, setCopied] = useState(false)

  const copyRoomCode = async () => {
    if (currentRoom?.room_code) {
      await Clipboard.setString(currentRoom.room_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLeaveRoom = () => {
    Alert.alert("Leave Room", "Are you sure you want to leave the room?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        onPress: () => {
          leaveRoom()
          navigation.navigate("Dashboard")
        },
      },
    ])
  }

  if (!currentRoom || !user) {
    navigation.navigate("Dashboard")
    return null
  }

  return (
    <LinearGradient colors={["#FFF5F0", "#FFE5D9", "#FFCAB0"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLeaveRoom} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FF6B35" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Lobby</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Animatable.View animation="fadeInDown" style={styles.titleContainer}>
            <Text style={styles.title}>Game Lobby</Text>
            <Text style={styles.subtitle}>Waiting for players to join...</Text>
          </Animatable.View>

          {/* Room Code Card */}
          <Animatable.View animation="fadeInUp" delay={200} style={styles.roomCodeCard}>
            <View style={styles.cardHeader}>
              <Icon name="group" size={24} color="#FF6B35" />
              <Text style={styles.cardTitle}>Room Code</Text>
            </View>
            <View style={styles.roomCodeContainer}>
              <Text style={styles.roomCode}>{currentRoom.room_code}</Text>
              <TouchableOpacity onPress={copyRoomCode} style={styles.copyButton}>
                <Icon name="content-copy" size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
            {copied && (
              <Animatable.Text animation="fadeIn" style={styles.copiedText}>
                Room code copied to clipboard!
              </Animatable.Text>
            )}
          </Animatable.View>

          {/* Players */}
          <View style={styles.playersContainer}>
            {/* Player 1 */}
            <Animatable.View animation="fadeInLeft" delay={400} style={styles.playerCard}>
              <Text style={styles.playerTitle}>Player 1</Text>
              <View style={styles.playerInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.username.substring(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.playerName}>{user.username}</Text>
                <Text style={styles.playerElo}>{user.elo_rating} ELO</Text>
                <View style={styles.readyBadge}>
                  <Text style={styles.readyText}>Ready</Text>
                </View>
              </View>
            </Animatable.View>

            {/* VS */}
            <Animatable.View animation="pulse" iterationCount="infinite" style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </Animatable.View>

            {/* Player 2 */}
            <Animatable.View animation="fadeInRight" delay={600} style={styles.playerCard}>
              <Text style={styles.playerTitle}>Player 2</Text>
              {opponent ? (
                <View style={styles.playerInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{opponent.username.substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.playerName}>{opponent.username}</Text>
                  <Text style={styles.playerElo}>{opponent.elo_rating} ELO</Text>
                  <View style={styles.readyBadge}>
                    <Text style={styles.readyText}>Ready</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.waitingContainer}>
                  <Animatable.View animation="pulse" iterationCount="infinite" style={styles.waitingAvatar} />
                  <Text style={styles.waitingText}>Waiting for opponent...</Text>
                </View>
              )}
            </Animatable.View>
          </View>

          {/* Game Settings */}
          <Animatable.View animation="fadeInUp" delay={800} style={styles.settingsCard}>
            <View style={styles.cardHeader}>
              <Icon name="settings" size={24} color="#FF6B35" />
              <Text style={styles.cardTitle}>Game Settings</Text>
            </View>
            <View style={styles.settingsContent}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Difficulty:</Text>
                <Text style={styles.settingValue}>{currentRoom.difficulty}</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Questions:</Text>
                <Text style={styles.settingValue}>10</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Time per question:</Text>
                <Text style={styles.settingValue}>15 seconds</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Leave Button */}
          <TouchableOpacity onPress={handleLeaveRoom} style={styles.leaveButton}>
            <Text style={styles.leaveButtonText}>Leave Room</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  roomCodeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  roomCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  roomCode: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B35",
    letterSpacing: 4,
    marginRight: 12,
  },
  copyButton: {
    padding: 8,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    borderRadius: 8,
  },
  copiedText: {
    textAlign: "center",
    color: "#4CAF50",
    fontSize: 14,
    marginTop: 8,
  },
  playersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  playerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 16,
    flex: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  playerInfo: {
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  playerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  playerElo: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  readyBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  vsContainer: {
    marginHorizontal: 16,
  },
  vsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  waitingContainer: {
    alignItems: "center",
  },
  waitingAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
    marginBottom: 12,
  },
  waitingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  settingsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsContent: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  settingValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF6B35",
  },
  leaveButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  leaveButtonText: {
    color: "#FF6B35",
    fontSize: 16,
    fontWeight: "bold",
  },
})
