import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
  Vibration,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Animatable from "react-native-animatable";
import { useGame } from "../contexts/GameContext";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

const { width, height } = Dimensions.get("window");

export default function QuickPlayScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [gamePin, setGamePin] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  // --- FIX 1: Get correct functions from GameContext ---
  const { joinGame, leaveGame } = useGame();
  const [step, setStep] = useState(1);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // prettier-ignore
  const [particles] = useState(Array.from({ length: 15 }, (_, i) => ({ id: i, x: Math.random() * width, y: Math.random() * height, scale: Math.random() * 0.5 + 0.5, opacity: Math.random() * 0.7 + 0.3, })));
  // prettier-ignore
  const particleRefs = useRef(Array.from({ length: 15 }, (_, i) => ({ translateX: new Animated.Value(Math.random() * width - width / 2), translateY: new Animated.Value(Math.random() * height - height / 2), opacity: new Animated.Value(Math.random() * 0.7 + 0.3), }))).current;

  useEffect(() => {
    if (user && user.name) {
      setPlayerName(user.name);
    }
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    );
    pulseAnimation.start();

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 20000, useNativeDriver: true }),
    );
    rotateAnimation.start();

    particles.forEach((particle, index) => {
      const animateParticle = () => {
        Animated.parallel([
          Animated.timing(particleRefs[index].translateX, { toValue: Math.random() * width - width / 2, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
          Animated.timing(particleRefs[index].translateY, { toValue: Math.random() * height - height / 2, duration: 3000 + Math.random() * 2000, useNativeDriver: true }),
          Animated.loop(Animated.sequence([ Animated.timing(particleRefs[index].opacity, { toValue: 0.2, duration: 2000, useNativeDriver: true }), Animated.timing(particleRefs[index].opacity, { toValue: 0.8, duration: 2000, useNativeDriver: true }), ])),
        ]).start(() => animateParticle());
      };
      setTimeout(() => animateParticle(), index * 200);
    });

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const handlePinSubmit = () => {
    if (gamePin.length !== 6) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();

      Vibration.vibrate(200);
      Alert.alert("Invalid PIN", "Please enter a 6-digit game PIN");
      return;
    }

    Vibration.vibrate(50);
    setStep(2);
  };

  // --- FIX 2: Corrected function to use the GameContext ---
  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      Alert.alert("Error", "Please enter a nickname");
      return;
    }

    if (!isConnected) {
      Alert.alert("Connection Error", "Not connected. Please check your internet and try again.");
      return;
    }

    setLoading(true);

    try {
      // Reset any previous game state. This is good practice.
      leaveGame();

      // Use the context function. It handles setting the gamePin and players list.
      // The second argument `false` indicates this player is not the host.
      await joinGame(gamePin, playerName.trim(), false);
      
      // If joinGame is successful, navigate. The Lobby will get players from the context.
      navigation.navigate("GameLobby", {
        pin: gamePin,
        isHost: false,
        nickname: playerName.trim(),
      });

    } catch (error) {
      // The joinGame promise rejects on failure, so we can catch the error here.
      Alert.alert("Failed to Join", error.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomName = () => {
    const adjectives = ["Swift", "Clever", "Bright", "Quick", "Smart", "Sharp", "Wise", "Bold"];
    const nouns = ["Player", "Gamer", "Ninja", "Master", "Hero", "Champion", "Wizard", "Ace"];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    setPlayerName(`${randomAdj}${randomNoun}${randomNum}`);
  };

  const resetToStep1 = () => {
    setStep(1);
    setGamePin("");
    if (!user) {
      setPlayerName("");
    }
  };

  const handleBackNavigation = () => {
    if (user) {
      navigation.navigate("MainTabs");
    } else {
      navigation.navigate("Welcome");
    }
  };

  const handleSignUp = () => {
    navigation.navigate("Auth", { screen: "SignUp" });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient colors={["#667eea", "#764ba2", "#f093fb"]} style={styles.container}>
      {particles.map((particle, index) => (
        <Animated.View
          key={particle.id}
          style={[ styles.particle, { transform: [ { translateX: particleRefs[index].translateX }, { translateY: particleRefs[index].translateY }, { scale: particle.scale }, ], opacity: particleRefs[index].opacity, }, ]}
        >
          <LinearGradient colors={["#ffffff40", "#ffffff20"]} style={styles.particleGradient} />
        </Animated.View>
      ))}

      <Animated.View style={[styles.rotatingElement, styles.element1, { transform: [{ rotate: spin }] }]}>
        <LinearGradient colors={["#ff9a9e20", "#fecfef20"]} style={styles.elementGradient} />
      </Animated.View>
      <Animated.View style={[styles.rotatingElement, styles.element2, { transform: [{ rotate: spin }] }]}>
        <LinearGradient colors={["#a8edea20", "#fed6e320"]} style={styles.elementGradient} />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[ styles.content, { transform: [ { scale: scaleAnim }, { translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }, { translateX: shakeAnim }, ], }, ]} >
            <Animatable.View animation="bounceIn" delay={500} style={styles.header}>
              <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient colors={["#ff6b6b", "#ee5a24"]} style={styles.logoGradient}>
                  <Icon name="sports-esports" size={40} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.logoGlow} />
              </Animated.View>
              <Text style={styles.title}>Quick Play</Text>
              <Text style={styles.subtitle}>
                {user ? `Welcome back, ${user.name}!` : "Jump into any quiz instantly!"}
              </Text>
            </Animatable.View>

            {step === 1 && (
              <Animatable.View animation="fadeInUp" style={styles.stepContainer}>
                <View style={styles.card}>
                  <LinearGradient colors={["#ffffff", "#f8f9fa"]} style={styles.cardGradient}>
                    <View style={styles.cardHeader}>
                      <Icon name="pin-drop" size={24} color="#667eea" />
                      <Text style={styles.cardTitle}>Enter Quiz PIN</Text>
                    </View>

                    <View style={styles.pinInputContainer}>
                      <TextInput style={styles.pinInput} value={gamePin} onChangeText={setGamePin} placeholder="000000" placeholderTextColor="#bbb" keyboardType="numeric" maxLength={6} textAlign="center" autoFocus />
                    </View>

                    <Text style={styles.helperText}>Ask your host for the 6-digit game PIN</Text>

                    <TouchableOpacity
                      style={[styles.actionButton, gamePin.length === 6 && styles.actionButtonActive]}
                      onPress={handlePinSubmit}
                      disabled={gamePin.length !== 6}
                    >
                      <LinearGradient colors={gamePin.length === 6 ? ["#667eea", "#764ba2"] : ["#ccc", "#999"]} style={styles.buttonGradient} >
                        <Text style={styles.buttonText}>Continue</Text>
                        <Icon name="arrow-forward" size={20} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </Animatable.View>
            )}

            {step === 2 && (
              <Animatable.View animation="slideInRight" style={styles.stepContainer}>
                <View style={styles.card}>
                  <LinearGradient colors={["#ffffff", "#f8f9fa"]} style={styles.cardGradient}>
                    <View style={styles.cardHeader}>
                      <Icon name="person" size={24} color="#667eea" />
                      <Text style={styles.cardTitle}>
                        {user ? "Confirm your name" : "What's your name?"}
                      </Text>
                    </View>

                    <View style={styles.nameInputContainer}>
                      <TextInput style={styles.nameInput} value={playerName} onChangeText={setPlayerName} placeholder="Enter your name" placeholderTextColor="#bbb" autoFocus={!user} />
                    </View>

                    {!user && (
                      <TouchableOpacity style={styles.randomNameButton} onPress={generateRandomName}>
                        <Icon name="shuffle" size={16} color="#667eea" />
                        <Text style={styles.randomNameText}>Generate Random Name</Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.gameInfoCard}>
                      <Text style={styles.gameInfoText}>Joining Game: {gamePin}</Text>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.backButton} onPress={resetToStep1}>
                        <Icon name="arrow-back" size={20} color="#667eea" />
                        <Text style={styles.backButtonText}>Back</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[ styles.joinButton, (!playerName.trim() || !isConnected) && styles.joinButtonDisabled ]}
                        onPress={handleJoinGame}
                        disabled={!playerName.trim() || loading || !isConnected}
                      >
                        <LinearGradient colors={ (playerName.trim() && isConnected) ? ["#4ecdc4", "#44a08d"] : ["#ccc", "#999"] } style={styles.buttonGradient} >
                          {loading ? (
                            <ActivityIndicator color="#FFF" />
                          ) : (
                            <>
                              <Text style={styles.buttonText}>
                                {isConnected ? 'Join Game' : 'Connecting...'}
                              </Text>
                              <Icon name="play-arrow" size={20} color="#FFFFFF" />
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>
              </Animatable.View>
            )}

            {step !== 3 && (
              <Animatable.View animation="fadeInUp" delay={1000} style={styles.funFactsContainer}>
                <Text style={styles.funFactsTitle}>💡 Did you know?</Text>
                <Text style={styles.funFactsText}>You can play with up to 50 players in a single game!</Text>
              </Animatable.View>
            )}
          </Animated.View>
        </ScrollView>

        {step === 1 && (
          <Animatable.View animation="fadeInUp" delay={1200} style={styles.bottomNav}>
            <TouchableOpacity style={styles.bottomNavButton} onPress={handleBackNavigation}>
              <Icon name={user ? "dashboard" : "home"} size={20} color="#FFFFFF" />
              <Text style={styles.bottomNavText}>
                {user ? "Back to Dashboard" : "Back to Home"}
              </Text>
            </TouchableOpacity>

            {!user && (
              <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                <Icon name="person-add" size={20} color="#667eea" />
                <Text style={styles.signUpButtonText}>Create Account</Text>
              </TouchableOpacity>
            )}
          </Animatable.View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, },
  particle: { position: "absolute", width: 8, height: 8, borderRadius: 4, left: width / 2, top: height / 2, },
  particleGradient: { width: "100%", height: "100%", borderRadius: 4, },
  rotatingElement: { position: "absolute", borderRadius: 100, },
  element1: { width: 200, height: 200, top: "10%", right: "-10%", },
  element2: { width: 150, height: 150, bottom: "20%", left: "-10%", },
  elementGradient: { width: "100%", height: "100%", borderRadius: 100, },
  safeArea: { flex: 1, zIndex: 1, },
  scrollView: { flex: 1, },
  scrollViewContent: { flexGrow: 1, minHeight: height, },
  content: { flex: 1, padding: 24, justifyContent: "center", },
  header: { alignItems: "center", marginBottom: 40, },
  logoContainer: { position: "relative", marginBottom: 20, },
  logoGradient: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", shadowColor: "#ff6b6b", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 15, },
  logoGlow: { position: "absolute", width: 100, height: 100, borderRadius: 50, backgroundColor: "#ff6b6b30", top: -10, left: -10, zIndex: -1, },
  title: { fontSize: 36, fontWeight: "800", color: "#FFFFFF", textAlign: "center", marginBottom: 8, textShadowColor: "rgba(0, 0, 0, 0.3)", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 10, },
  subtitle: { fontSize: 16, color: "rgba(255, 255, 255, 0.9)", textAlign: "center", textShadowColor: "rgba(0, 0, 0, 0.2)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5, },
  stepContainer: { marginBottom: 30, },
  card: { borderRadius: 25, shadowColor: "#000", shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 25, elevation: 15, },
  cardGradient: { borderRadius: 25, padding: 30, },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 25, },
  cardTitle: { fontSize: 22, fontWeight: "700", color: "#2c3e50", marginLeft: 10, },
  pinInputContainer: { marginBottom: 20, },
  pinInput: { fontSize: 32, fontWeight: "bold", color: "#2c3e50", backgroundColor: "#f8f9fa", borderRadius: 15, paddingVertical: 20, paddingHorizontal: 20, borderWidth: 2, borderColor: "#e9ecef", letterSpacing: 8, },
  nameInputContainer: { marginBottom: 15, },
  nameInput: { fontSize: 18, color: "#2c3e50", backgroundColor: "#f8f9fa", borderRadius: 15, paddingVertical: 18, paddingHorizontal: 20, borderWidth: 2, borderColor: "#e9ecef", textAlign: "center", },
  randomNameButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, marginBottom: 20, },
  randomNameText: { color: "#667eea", fontSize: 14, fontWeight: "600", marginLeft: 5, },
  gameInfoCard: { backgroundColor: "#667eea20", borderRadius: 12, padding: 15, marginBottom: 25, alignItems: "center", },
  gameInfoText: { color: "#667eea", fontSize: 16, fontWeight: "600", },
  helperText: { textAlign: "center", color: "#6c757d", fontSize: 14, marginBottom: 25, lineHeight: 20, },
  actionButton: { borderRadius: 15, shadowColor: "#667eea", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8, },
  actionButtonActive: { shadowOpacity: 0.4, shadowRadius: 20, },
  buttonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, borderRadius: 15, },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", marginRight: 8, },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", },
  backButton: { flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, backgroundColor: "#f8f9fa", borderWidth: 1, borderColor: "#e9ecef", },
  backButtonText: { color: "#667eea", fontSize: 16, fontWeight: "600", marginLeft: 5, },
  joinButton: { flex: 1, marginLeft: 15, borderRadius: 15, shadowColor: "#4ecdc4", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8, },
  joinButtonDisabled: { shadowOpacity: 0.1, },
  funFactsContainer: { backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: 20, padding: 20, marginTop: 20, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.2)", },
  funFactsTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", marginBottom: 8, textAlign: "center", },
  funFactsText: { fontSize: 14, color: "rgba(255, 255, 255, 0.9)", textAlign: "center", lineHeight: 20, },
  bottomNav: { paddingHorizontal: 24, paddingBottom: 20, },
  bottomNavButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 15, paddingVertical: 15, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.3)", marginBottom: 10, },
  bottomNavText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", marginLeft: 8, },
  signUpButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: 15, paddingVertical: 15, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.3)", },
  signUpButtonText: { color: "#667eea", fontSize: 16, fontWeight: "600", marginLeft: 8, },
});