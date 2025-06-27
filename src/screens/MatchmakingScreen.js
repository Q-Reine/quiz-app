"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { useGame } from "../contexts/GameContext"

export default function MatchmakingScreen() {
  const navigation = useNavigation()
  const [searchTime, setSearchTime] = useState(0)
  const { isSearching, currentRoom } = useGame()

  useEffect(() => {
    if (isSearching) {
      const timer = setInterval(() => {
        setSearchTime((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isSearching])

  useEffect(() => {
    if (currentRoom) {
      navigation.navigate("GameLobby")
    }
  }, [currentRoom, navigation])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
      <View style={styles.content}>
        {/* Animated Search Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.searchIcon}>
            <Text style={styles.searchEmoji}>🔍</Text>
          </View>
        </View>

        {/* Status */}
        <Text style={styles.title}>Finding Your Opponent</Text>
        <Text style={styles.subtitle}>Searching for a player with similar skill level...</Text>

        {/* Search Time */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(searchTime)}</Text>
          <Text style={styles.timeLabel}>Search time</Text>
        </View>

        {/* Animated Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>

        {/* Tips */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>
            💡 <Text style={styles.tipBold}>Tip:</Text> The better your ELO rating, the more challenging opponents
            you'll face!
          </Text>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.cancelButtonText}>✕ Cancel Search</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 32,
  },
  searchIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 32,
    textAlign: "center",
  },
  timeContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  timeText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#F59E0B",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  timeLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dot1: {
    backgroundColor: "#3B82F6",
  },
  dot2: {
    backgroundColor: "#8B5CF6",
  },
  dot3: {
    backgroundColor: "#EC4899",
  },
  tipContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: "100%",
  },
  tipText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  tipBold: {
    fontWeight: "bold",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: "100%",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
})
