import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../contexts/AuthContext"

export default function AuthScreen() {
  const navigation = useNavigation()
  const { login, register, loading } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loginData, setLoginData] = useState({ email: "test@example.com", password: "password" })
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "", confirmPassword: "" })

  const handleLogin = async () => {
    const success = await login(loginData.email, loginData.password)
    if (success) {
      navigation.navigate('MainTabs')
    }
  }

 const handleRegister = async () => {
    if (registerData.password !== registerData.confirmPassword) {
     
      return;
    }
   
    const success = await register(registerData.username, registerData.email, registerData.password);
    if (success) {
     
      setIsLogin(true);
    }
  };

  return (
    <LinearGradient colors={["#8B5CF6", "#3B82F6", "#EC4899"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         
          <View style={styles.backgroundElements}>
            <View style={[styles.floatingElement, styles.element1]} />
            <View style={[styles.floatingElement, styles.element2]} />
          </View>

         
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🧠</Text>
            </View>
            <Text style={styles.title}>Welcome to QuizBattle</Text>
            <Text style={styles.subtitle}>Sign in to start your quiz journey</Text>
          </View>

          
          <View style={styles.formContainer}>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tab, isLogin && styles.activeTab]} onPress={() => setIsLogin(true)}>
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, !isLogin && styles.activeTab]} onPress={() => setIsLogin(false)}>
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            
            {isLogin ? (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={loginData.email}
                    onChangeText={(text) => setLoginData((prev) => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={loginData.password}
                    onChangeText={(text) => setLoginData((prev) => ({ ...prev, password: text }))}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleLogin} disabled={loading}>
                  <LinearGradient colors={["#10B981", "#3B82F6"]} style={styles.buttonGradient}>
                    <Text style={styles.submitButtonText}>{loading ? "Signing In..." : "Sign In"}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.demoText}>Demo: test@example.com / password</Text>
              </View>
            ) : (
              
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Choose a username"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={registerData.username}
                    onChangeText={(text) => setRegisterData((prev) => ({ ...prev, username: text }))}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={registerData.email}
                    onChangeText={(text) => setRegisterData((prev) => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={registerData.password}
                    onChangeText={(text) => setRegisterData((prev) => ({ ...prev, password: text }))}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={registerData.confirmPassword}
                    onChangeText={(text) => setRegisterData((prev) => ({ ...prev, confirmPassword: text }))}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleRegister} disabled={loading}>
                  <LinearGradient colors={["#8B5CF6", "#EC4899"]} style={styles.buttonGradient}>
                    <Text style={styles.submitButtonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>

          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Welcome")}>
            <Text style={styles.backButtonText}>← Back to Welcome</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backgroundElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingElement: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 50,
  },
  element1: {
    width: 80,
    height: 80,
    top: 100,
    left: 50,
  },
  element2: {
    width: 100,
    height: 100,
    bottom: 200,
    right: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 32,
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
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "white",
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
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
  submitButton: {
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  demoText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  backButtonText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
})
