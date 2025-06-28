import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, SafeAreaView, StatusBar } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialIcons"
import * as Animatable from "react-native-animatable"

const { width, height } = Dimensions.get("window")

const onboardingData = [
  {
    id: 1,
    title: "Welcome to QuizBattle",
    subtitle: "The ultimate trivia experience",
    description:
      "Challenge friends and players worldwide in real-time quiz battles. Test your knowledge across multiple categories!",
    icon: "psychology",
    gradient: ["#667eea", "#764ba2"],
    accentColor: "#667eea",
    illustration: "🧠",
    features: ["Real-time battles", "Multiple categories", "Global leaderboards"],
  },
  {
    id: 2,
    title: "Battle in Real-Time",
    subtitle: "Fast-paced quiz action",
    description:
      "Answer questions quickly and accurately. Every second counts in your race to victory against opponents!",
    icon: "flash-on",
    gradient: ["#f093fb", "#f5576c"],
    accentColor: "#f093fb",
    illustration: "⚡",
    features: ["15-second rounds", "Live scoring", "Instant results"],
  },
  {
    id: 3,
    title: "Climb the Leaderboard",
    subtitle: "Become the quiz champion",
    description:
      "Win games to increase your ELO rating and climb the global leaderboard. Show everyone who's the smartest!",
    icon: "emoji-events",
    gradient: ["#4ecdc4", "#44a08d"],
    accentColor: "#4ecdc4",
    illustration: "🏆",
    features: ["ELO rating system", "Global rankings", "Achievement badges"],
  },
  {
    id: 4,
    title: "Ready to Play?",
    subtitle: "Your journey begins now",
    description:
      "Join millions of players in the most exciting quiz battle experience. Create your account or jump right in!",
    icon: "rocket-launch",
    gradient: ["#fa709a", "#fee140"],
    accentColor: "#fa709a",
    illustration: "🚀",
    features: ["Quick play mode", "Custom rooms", "Social features"],
  },
]

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollX = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(1)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  const [floatingElements] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      scale: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 3000 + 2000,
    })),
  )

  const floatingRefs = useRef(
    Array.from({ length: 20 }, () => ({
      translateX: new Animated.Value(Math.random() * width - width / 2),
      translateY: new Animated.Value(Math.random() * height - height / 2),
      opacity: new Animated.Value(Math.random() * 0.6 + 0.2),
      scale: new Animated.Value(Math.random() * 0.5 + 0.3),
    })),
  ).current

  useEffect(() => {
    // floating animations
    floatingElements.forEach((element, index) => {
      const animateFloat = () => {
        Animated.parallel([
          Animated.timing(floatingRefs[index].translateX, {
            toValue: Math.random() * width - width / 2,
            duration: element.duration,
            useNativeDriver: true,
          }),
          Animated.timing(floatingRefs[index].translateY, {
            toValue: Math.random() * height - height / 2,
            duration: element.duration,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(floatingRefs[index].opacity, {
                toValue: 0.1,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(floatingRefs[index].opacity, {
                toValue: 0.6,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(floatingRefs[index].scale, {
                toValue: element.scale * 1.5,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(floatingRefs[index].scale, {
                toValue: element.scale,
                duration: 3000,
                useNativeDriver: true,
              }),
            ]),
          ),
        ]).start(() => animateFloat())
      }
      setTimeout(() => animateFloat(), index * 100)
    })

    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      }),
    ).start()
  }, [])

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      animateTransition(() => setCurrentIndex(currentIndex + 1))
    } else {
      navigation.navigate("QuickPlay")
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      animateTransition(() => setCurrentIndex(currentIndex - 1))
    }
  }

  const animateTransition = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback()
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    })
  }

  const skipOnboarding = () => {
    navigation.navigate("QuickPlay")
  }

  const currentSlide = onboardingData[currentIndex]
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <LinearGradient colors={currentSlide.gradient} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={currentSlide.accentColor} />

      
      {floatingElements.map((element, index) => (
        <Animated.View
          key={element.id}
          style={[
            styles.floatingElement,
            {
              transform: [
                { translateX: floatingRefs[index].translateX },
                { translateY: floatingRefs[index].translateY },
                { scale: floatingRefs[index].scale },
              ],
              opacity: floatingRefs[index].opacity,
            },
          ]}
        >
          <View style={[styles.floatingShape, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
        </Animated.View>
      ))}

      
      <Animated.View style={[styles.rotatingCircle, styles.circle1, { transform: [{ rotate: spin }] }]}>
        <LinearGradient colors={["rgba(255,255,255,0.1)", "transparent"]} style={styles.circleGradient} />
      </Animated.View>
      <Animated.View style={[styles.rotatingCircle, styles.circle2, { transform: [{ rotate: spin }] }]}>
        <LinearGradient colors={["rgba(255,255,255,0.05)", "transparent"]} style={styles.circleGradient} />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          
          <Animatable.View animation="bounceIn" duration={1000} style={styles.illustrationContainer}>
            <View style={styles.illustrationBackground}>
              <LinearGradient
                colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                style={styles.illustrationGradient}
              >
                <Text style={styles.illustrationEmoji}>{currentSlide.illustration}</Text>
                <View style={styles.iconContainer}>
                  <Icon name={currentSlide.icon} size={40} color="rgba(255,255,255,0.9)" />
                </View>
              </LinearGradient>
            </View>
            <View style={[styles.illustrationGlow, { backgroundColor: `${currentSlide.accentColor}30` }]} />
          </Animatable.View>

          
          <Animatable.View animation="fadeInUp" delay={300} style={styles.textContainer}>
            <Text style={styles.title}>{currentSlide.title}</Text>
            <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
            <Text style={styles.description}>{currentSlide.description}</Text>
          </Animatable.View>

          
          <Animatable.View animation="fadeInUp" delay={600} style={styles.featuresContainer}>
            {currentSlide.features.map((feature, index) => (
              <Animatable.View key={index} animation="fadeInLeft" delay={800 + index * 200} style={styles.featureItem}>
                <View style={[styles.featureDot, { backgroundColor: "rgba(255,255,255,0.8)" }]} />
                <Text style={styles.featureText}>{feature}</Text>
              </Animatable.View>
            ))}
          </Animatable.View>
        </Animated.View>

        
        <View style={styles.bottomSection}>
          <View style={styles.indicatorContainer}>
            {onboardingData.map((_, index) => (
              <Animatable.View
                key={index}
                animation={index === currentIndex ? "pulse" : undefined}
                iterationCount={index === currentIndex ? "infinite" : 1}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentIndex ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                    width: index === currentIndex ? 30 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.navigationContainer}>
            {currentIndex > 0 && (
              <TouchableOpacity style={styles.prevButton} onPress={prevSlide}>
                <Icon name="arrow-back" size={24} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            )}

            <View style={styles.spacer} />

            <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
              <LinearGradient
                colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                style={styles.nextButtonGradient}
              >
                {currentIndex === onboardingData.length - 1 ? (
                  <>
                    <Text style={styles.nextButtonText}>Get Started</Text>
                    <Icon name="rocket-launch" size={24} color="#FFFFFF" />
                  </>
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>Next</Text>
                    <Icon name="arrow-forward" size={24} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingElement: {
    position: "absolute",
    width: 20,
    height: 20,
    left: width / 2,
    top: height / 2,
  },
  floatingShape: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  rotatingCircle: {
    position: "absolute",
    borderRadius: 200,
  },
  circle1: {
    width: 400,
    height: 400,
    top: -200,
    right: -200,
  },
  circle2: {
    width: 300,
    height: 300,
    bottom: -150,
    left: -150,
  },
  circleGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 200,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationContainer: {
    position: "relative",
    marginBottom: 40,
  },
  illustrationBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  illustrationGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  illustrationEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  iconContainer: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 8,
  },
  illustrationGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  prevButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
})
