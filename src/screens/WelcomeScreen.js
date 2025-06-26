import { useState } from "react"

import { useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, SafeAreaView, StatusBar } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialIcons"
import * as Animatable from "react-native-animatable"

const { width, height } = Dimensions.get("window")

export default function WelcomeScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0)).current
  const titleSlide = useRef(new Animated.Value(-100)).current
  const buttonSlide = useRef(new Animated.Value(100)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  
  const [particles] = useState(
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
    })),
  )

  const particleRefs = useRef(
    Array.from({ length: 25 }, () => ({
      translateX: new Animated.Value(Math.random() * width - width / 2),
      translateY: new Animated.Value(Math.random() * height - height / 2),
      opacity: new Animated.Value(Math.random() * 0.8 + 0.2),
    })),
  ).current

  useEffect(() => {
    // Entrance animations 
    const entranceSequence = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ])

    entranceSequence.start()

    // Continuous animations
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    )

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      }),
    )

    pulseAnimation.start()
    rotateAnimation.start()

    // Particle animations
    particles.forEach((particle, index) => {
      const animateParticle = () => {
        Animated.parallel([
          Animated.timing(particleRefs[index].translateX, {
            toValue: Math.random() * width - width / 2,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(particleRefs[index].translateY, {
            toValue: Math.random() * height - height / 2,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(particleRefs[index].opacity, {
                toValue: 0.1,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(particleRefs[index].opacity, {
                toValue: 0.8,
                duration: 3000,
                useNativeDriver: true,
              }),
            ]),
          ),
        ]).start(() => animateParticle())
      }
      setTimeout(() => animateParticle(), index * 100)
    })

    return () => {
      pulseAnimation.stop()
      rotateAnimation.stop()
    }
  }, [])

  const handleGetStarted = () => {
    navigation.navigate("Onboarding")
  }

  const handleQuickPlay = () => {
    // Navigate to AuthFlow navigator, which will show QuickPlay as the initial screen
    navigation.navigate("AuthFlow")
  }

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <LinearGradient colors={["#667eea", "#764ba2", "#f093fb"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Animated Particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              transform: [
                { translateX: particleRefs[index].translateX },
                { translateY: particleRefs[index].translateY },
              ],
              opacity: particleRefs[index].opacity,
            },
          ]}
        />
      ))}

      {/* Rotating Background Elements */}
      <Animated.View style={[styles.backgroundElement, styles.element1, { transform: [{ rotate: spin }] }]}>
        <LinearGradient colors={["rgba(255,255,255,0.1)", "transparent"]} style={styles.elementGradient} />
      </Animated.View>
      <Animated.View style={[styles.backgroundElement, styles.element2, { transform: [{ rotate: spin }] }]}>
        <LinearGradient colors={["rgba(255,255,255,0.05)", "transparent"]} style={styles.elementGradient} />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: logoScale }, { scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient colors={["#ff6b6b", "#ee5a24"]} style={styles.logoGradient}>
                <Icon name="psychology" size={60} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.logoGlow} />
            </Animated.View>

            <Animated.View style={[styles.titleContainer, { transform: [{ translateY: titleSlide }] }]}>
              <Text style={styles.title}>QuizBattle</Text>
              <Text style={styles.tagline}>Challenge Your Mind</Text>
            </Animated.View>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <Animatable.View animation="fadeInLeft" delay={1000} style={styles.featureCard}>
              <LinearGradient
                colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                style={styles.featureGradient}
              >
                <Icon name="flash-on" size={30} color="#FFD700" />
                <Text style={styles.featureTitle}>Real-Time</Text>
                <Text style={styles.featureDesc}>Live battles</Text>
              </LinearGradient>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={1200} style={styles.featureCard}>
              <LinearGradient
                colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                style={styles.featureGradient}
              >
                <Icon name="emoji-events" size={30} color="#FF6B6B" />
                <Text style={styles.featureTitle}>Compete</Text>
                <Text style={styles.featureDesc}>Global ranks</Text>
              </LinearGradient>
            </Animatable.View>

            <Animatable.View animation="fadeInRight" delay={1400} style={styles.featureCard}>
              <LinearGradient
                colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                style={styles.featureGradient}
              >
                <Icon name="groups" size={30} color="#4ECDC4" />
                <Text style={styles.featureTitle}>Social</Text>
                <Text style={styles.featureDesc}>Play together</Text>
              </LinearGradient>
            </Animatable.View>
          </View>

          {/* Stats Section */}
          <Animatable.View animation="fadeInUp" delay={1600} style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1M+</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </Animatable.View>

          {/* Action Buttons */}
          <Animated.View style={[styles.buttonContainer, { transform: [{ translateY: buttonSlide }] }]}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={styles.primaryButtonGradient}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Icon name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleQuickPlay}>
              <LinearGradient
                colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                style={styles.secondaryButtonGradient}
              >
                <Icon name="play-arrow" size={20} color="#FFFFFF" />
                <Text style={styles.secondaryButtonText}>Quick Play</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Bottom Info */}
          <Animatable.View animation="fadeIn" delay={2000} style={styles.bottomInfo}>
            <Text style={styles.bottomText}>Join millions of quiz enthusiasts worldwide</Text>
          </Animatable.View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  particle: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 2,
    left: width / 2,
    top: height / 2,
  },
  backgroundElement: {
    position: "absolute",
    borderRadius: 200,
  },
  element1: {
    width: 300,
    height: 300,
    top: -150,
    right: -150,
  },
  element2: {
    width: 250,
    height: 250,
    bottom: -125,
    left: -125,
  },
  elementGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 200,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 60,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 30,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
  },
  logoGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,107,107,0.3)",
    top: -10,
    left: -10,
    zIndex: -1,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 40,
  },
  featureCard: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  featureGradient: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  primaryButton: {
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  secondaryButton: {
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  secondaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  bottomText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontStyle: "italic",
  },
})
