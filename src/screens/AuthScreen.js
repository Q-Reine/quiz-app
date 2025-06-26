import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialIcons"
import * as Animatable from "react-native-animatable"
import { useAuth } from "../contexts/AuthContext"

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password")
  const [username, setUsername] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, register, googleSignIn } = useAuth()

  const handleAuth = async () => {
    if (isLogin) {
      if (!email || !password) {
        Alert.alert("Error", "Please enter both email and password")
        return
      }

      setLoading(true)
      const success = await login(email, password)
      setLoading(false)

      if (!success) {
        Alert.alert("Login Failed", "Please check your credentials and try again")
      }
    } else {
        if (!username || !email || !password || !confirmPassword) {
        Alert.alert("Error", "Please fill in all fields")
        return
      }

      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match")
        return
      }

      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters")
        return
      }

      setLoading(true)
      const success = await register(username, email, password)
      setLoading(false)

      if (!success) {
        Alert.alert("Registration Failed", "Please try again")
      }
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await googleSignIn()
    setLoading(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    if (isLogin) {
      setEmail("")
      setPassword("")
    } else {
      setEmail("test@example.com")
      setPassword("password")
      setUsername("")
      setConfirmPassword("")
    }
  }

  return (
    <LinearGradient colors={["#f8fafc", "#e2e8f0", "#cbd5e1"]} style={styles.container}>
      <View style={styles.backgroundShapes}>
        <LinearGradient colors={["#8b5cf6", "#a78bfa"]} style={[styles.shape, styles.shape1]} />
        <LinearGradient colors={["#ec4899", "#f472b6"]} style={[styles.shape, styles.shape2]} />
        <LinearGradient colors={["#06b6d4", "#67e8f9"]} style={[styles.shape, styles.shape3]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animatable.View animation="fadeInDown" delay={200} style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={isLogin ? ["#8b5cf6", "#a78bfa"] : ["#ec4899", "#f472b6"]}
                style={styles.logoGradient}
              >
                <Icon name={isLogin ? "psychology" : "person-add"} size={28} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>{isLogin ? "Welcome back" : "Create account"}</Text>
            <Text style={styles.subtitle}>{isLogin ? "Sign in to your account" : "Join QuizBattle today"}</Text>
          </Animatable.View>

          
          <Animatable.View animation="fadeInUp" delay={400} style={styles.authCard}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, isLogin && styles.activeToggle]}
                onPress={() => !isLogin && toggleMode()}
              >
                <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !isLogin && styles.activeToggle]}
                onPress={() => isLogin && toggleMode()}
              >
                <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            
            {/* Login button*/}
            <TouchableOpacity
              style={[styles.socialButton, { opacity: 0.6 }]}
              onPress={handleGoogleSignIn}
              disabled={true}
            >
              <Icon name="account-circle" size={20} color="#4285F4" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
              <Text style={styles.comingSoon}>(Coming Soon)</Text>
            </TouchableOpacity>

            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

           
            <Animatable.View key={isLogin ? "login" : "register"} animation="fadeIn" duration={300}>
              {/* Username for register */}
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="person" size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Choose a username"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>
                </View>
              )}

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <Icon name="email" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Confirm Password */}
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                      editable={!loading}
                    />
                  </View>
                </View>
              )}
            </Animatable.View>

            {/* Forgot Password */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Terms */}
            {!isLogin && (
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            )}

            {/* Auth Button */}
            <TouchableOpacity
              style={[styles.authButton, loading && styles.disabledButton]}
              onPress={handleAuth}
              disabled={loading}
            >
              <LinearGradient
                colors={isLogin ? ["#8b5cf6", "#a78bfa"] : ["#ec4899", "#f472b6"]}
                style={styles.authButtonGradient}
              >
                <Text style={styles.authButtonText}>
                  {loading
                    ? isLogin
                      ? "Signing in..."
                      : "Creating account..."
                    : isLogin
                      ? "Sign in"
                      : "Create account"}
                </Text>
                {!loading && <Icon name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />}
              </LinearGradient>
            </TouchableOpacity>

            {/* Alternative Action */}
            <View style={styles.alternativeContainer}>
              <Text style={styles.alternativeText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.alternativeLink}>{isLogin ? "Sign up" : "Sign in"}</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    bottom: "15%",
    right: "10%",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeToggle: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  activeToggleText: {
    color: "#1e293b",
  },
  demoInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: "#8b5cf6",
  },
  demoText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },
  socialButtonText: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
    textAlign: "center",
  },
  comingSoon: {
    fontSize: 12,
    color: "#94a3b8",
    fontStyle: "italic",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1e293b",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#8b5cf6",
    fontWeight: "600",
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#ec4899",
    fontWeight: "600",
  },
  authButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  authButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  alternativeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  alternativeText: {
    fontSize: 14,
    color: "#64748b",
  },
  alternativeLink: {
    fontSize: 14,
    color: "#8b5cf6",
    fontWeight: "600",
  },
})
