import { useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"

export default function Timer({ duration, timeLeft, onTimeUp }) {
  const progress = (timeLeft / duration) * 100

  useEffect(() => {
    if (timeLeft === 0 && onTimeUp) {
      onTimeUp()
    }
  }, [timeLeft, onTimeUp])

  const getTimerColor = () => {
    if (timeLeft <= 3) return ["#ef4444", "#dc2626"]
    if (timeLeft <= 7) return ["#f59e0b", "#d97706"]
    return ["#7c3aed", "#a855f7"]
  }

  return (
    <View style={styles.container}>
      <View style={styles.timerHeader}>
        <Text style={styles.label}>Time Left</Text>
        <Animatable.Text
          animation={timeLeft <= 5 ? "pulse" : undefined}
          iterationCount={timeLeft <= 5 ? "infinite" : 1}
          style={[styles.timeText, { color: timeLeft <= 5 ? "#ef4444" : "#a855f7" }]}
        >
          {timeLeft}s
        </Animatable.Text>
      </View>
      <View style={styles.progressBarContainer}>
        <LinearGradient colors={getTimerColor()} style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 300,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  timerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  timeText: {
    fontSize: 32,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
})
