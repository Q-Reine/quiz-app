import { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useToast } from "./ToastContext"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      if (token) {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockUser = {
          id: "user_1",
          username: "TestUser",
          email: "test@example.com",
          avatar: "🎮",
          eloRating: 1250,
          totalGames: 15,
          wins: 9,
          losses: 6,
          isOnline: true,
          lastSeen: new Date(),
        }
        setUser(mockUser)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      await AsyncStorage.removeItem("authToken")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (email === "test@example.com" && password === "password") {
        const mockUser = {
          id: "user_1",
          username: "TestUser",
          email: email,
          avatar: "🎮",
          eloRating: 1250,
          totalGames: 15,
          wins: 9,
          losses: 6,
          isOnline: true,
          lastSeen: new Date(),
        }

        await AsyncStorage.setItem("authToken", "mock_token_123")
        setUser(mockUser)

        showToast("Welcome back!", `Hello ${mockUser.username}`, "success")
        return true
      } else {
        showToast("Login Failed", "Invalid credentials", "error")
        return false
      }
    } catch (error) {
      showToast("Login Failed", "Please try again", "error")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (username, email, password) => {
    try {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockUser = {
        id: `user_${Date.now()}`,
        username,
        email,
        avatar: "🎮",
        eloRating: 1200,
        totalGames: 0,
        wins: 0,
        losses: 0,
        isOnline: true,
        lastSeen: new Date(),
      }

      await AsyncStorage.setItem("authToken", "mock_token_123")
      setUser(mockUser)

      showToast("Account Created!", `Welcome to QuizBattle, ${username}!`, "success")
      return true
    } catch (error) {
      showToast("Registration Failed", "Please try again", "error")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await AsyncStorage.removeItem("authToken")
    setUser(null)
    showToast("Logged Out", "See you next time!", "info")
  }

  const updateProfile = async (data) => {
    try {
      if (user) {
        setUser({ ...user, ...data })
        showToast("Profile Updated", "Your changes have been saved", "success")
        return true
      }
      return false
    } catch (error) {
      showToast("Update Failed", "Please try again", "error")
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
