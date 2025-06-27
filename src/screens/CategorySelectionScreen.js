import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Animated, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import CategoryChip from "../components/CategoryChip"
import QuizCard from "../components/QuizCard"

const { width, height } = Dimensions.get("window")

const CategorySelectionScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedGameMode, setSelectedGameMode] = useState(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const categories = [
    { title: "Space", icon: "rocket-outline" },
    { title: "Sports", icon: "football-outline" },
    { title: "History", icon: "shield-outline" },
    { title: "Maths", icon: "calculator-outline" },
    { title: "Random Quiz", icon: "shuffle-outline" },
    { title: "Science", icon: "flask-outline" },
  ]

  const gameModes = [
    { title: "Quick Battle", color: "#667eea", icon: "flash" },
    { title: "Tournament", color: "#f093fb", icon: "trophy" },
    { title: "Practice", color: "#4facfe", icon: "book" },
    { title: "Daily Challenge", color: "#43e97b", icon: "calendar" },
  ]

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  const handleGameModeSelect = (gameMode) => {
    setSelectedGameMode(gameMode)
  }

  const handleStartGame = () => {
    if (selectedCategory && selectedGameMode) {
      navigation.navigate("GameBattle", {
        category: selectedCategory,
        gameMode: selectedGameMode,
        playerName: "Player", 
      })
    }
  }

  const canStart = selectedCategory && selectedGameMode

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Category & Mode</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Category</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category, index) => (
                  <View key={index} style={styles.categoryWrapper}>
                    <CategoryChip title={category.title} onPress={() => handleCategorySelect(category.title)} />
                    {selectedCategory === category.title && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Game Mode</Text>
              <View style={styles.gameModesGrid}>
                {gameModes.map((mode, index) => (
                  <View key={index} style={styles.gameModeWrapper}>
                    <QuizCard
                      title={mode.title}
                      color={mode.color}
                      icon={mode.icon}
                      onPress={() => handleGameModeSelect(mode.title)}
                    />
                    {selectedGameMode === mode.title && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            
            {(selectedCategory || selectedGameMode) && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Your Selection</Text>
                {selectedCategory && (
                  <View style={styles.summaryRow}>
                    <Ionicons name="library" size={20} color="#667eea" />
                    <Text style={styles.summaryText}>Category: {selectedCategory}</Text>
                  </View>
                )}
                {selectedGameMode && (
                  <View style={styles.summaryRow}>
                    <Ionicons name="game-controller" size={20} color="#667eea" />
                    <Text style={styles.summaryText}>Mode: {selectedGameMode}</Text>
                  </View>
                )}
              </View>
            )}

            
            {canStart && (
              <Animated.View style={styles.startButtonContainer}>
                <TouchableOpacity onPress={handleStartGame} style={styles.startButton}>
                  <LinearGradient colors={["#10b981", "#059669"]} style={styles.startButtonGradient}>
                    <Ionicons name="play" size={24} color="#ffffff" />
                    <Text style={styles.startButtonText}>Start Game</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>

        <View style={styles.backgroundElements}>
          <Animated.View style={[styles.circle1, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.circle2, { opacity: fadeAnim }]} />
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryWrapper: {
    width: "48%",
    marginBottom: 16,
    position: "relative",
  },
  gameModesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gameModeWrapper: {
    width: "48%",
    marginBottom: 16,
    position: "relative",
  },
  selectedIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: "#1f2937",
    marginLeft: 12,
  },
  startButtonContainer: {
    marginTop: 20,
  },
  startButton: {
    borderRadius: 25,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 25,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  backgroundElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -50,
  },
  circle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -30,
    left: -30,
  },
})

export default CategorySelectionScreen