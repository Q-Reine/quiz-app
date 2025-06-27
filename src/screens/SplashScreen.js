import { useEffect } from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Animatable from "react-native-animatable"
import Icon from "react-native-vector-icons/MaterialIcons"

export default function SplashScreen({ onComplete }) {
  const fadeAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(0.8)

  useEffect(() => {
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    const timer = setTimeout(() => {
      onComplete()
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <LinearGradient colors={["#f8fafc", "#e2e8f0", "#cbd5e1"]} style={styles.container}>
      
      <View style={styles.backgroundShapes}>
        <LinearGradient colors={["#8b5cf6", "#a78bfa"]} style={[styles.shape, styles.shape1]} />
        <LinearGradient colors={["#ec4899", "#f472b6"]} style={[styles.shape, styles.shape2]} />
        <LinearGradient colors={["#06b6d4", "#67e8f9"]} style={[styles.shape, styles.shape3]} />
        <LinearGradient colors={["#10b981", "#34d399"]} style={[styles.shape, styles.shape4]} />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        
        <View style={styles.logoContainer}>
          <LinearGradient colors={["#8b5cf6", "#a78bfa"]} style={styles.logoGradient}>
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
              <Icon name="psychology" size={48} color="#FFFFFF" />
            </Animatable.View>
          </LinearGradient>
        </View>

        
        <Animatable.Text animation="fadeInUp" delay={500} style={styles.title}>
          QuizBattle
        </Animatable.Text>

        
        <Animatable.Text animation="fadeInUp" delay={700} style={styles.subtitle}>
          Challenge your mind
        </Animatable.Text>

        
        <Animatable.View animation="fadeInUp" delay={900} style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={800}
              delay={0}
              style={[styles.dot, styles.dot1]}
            />
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={800}
              delay={200}
              style={[styles.dot, styles.dot2]}
            />
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={800}
              delay={400}
              style={[styles.dot, styles.dot3]}
            />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </Animatable.View>
      </Animated.View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundShapes: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  shape: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.1,
  },
  shape1: {
    width: 200,
    height: 200,
    top: "10%",
    right: "-10%",
  },
  shape2: {
    width: 150,
    height: 150,
    top: "60%",
    left: "-15%",
  },
  shape3: {
    width: 120,
    height: 120,
    bottom: "20%",
    right: "15%",
  },
  shape4: {
    width: 180,
    height: 180,
    top: "30%",
    left: "-5%",
  },
  content: {
    alignItems: "center",
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
    marginBottom: 48,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  dot1: {
    backgroundColor: "#8b5cf6",
  },
  dot2: {
    backgroundColor: "#ec4899",
  },
  dot3: {
    backgroundColor: "#06b6d4",
  },
  loadingText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
})
