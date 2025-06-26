import { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-toast-message"

import { authService } from "../services/authService"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      if (token) {
        const userData = await authService.getProfile(token)
        if (userData) {
          setUser(userData)
        } else {
          await AsyncStorage.removeItem("authToken")
        }
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
      const response = await authService.login(email, password)
      if (response.success) {
        await AsyncStorage.setItem("authToken", response.token)
        setUser(response.user)
        Toast.show({
          type: "success",
          text1: "Welcome back!",
          text2: `Hello ${response.user.username}`,
        })
        return true
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: response.message || "Invalid credentials",
        })
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Please try again.",
      })
      return false
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await authService.register(username, email, password)
      if (response.success) {
        await AsyncStorage.setItem("authToken", response.token)
        setUser(response.user)
        Toast.show({
          type: "success",
          text1: "Account Created!",
          text2: `Welcome to Quiz Battle, ${response.user.username}!`,
        })
        return true
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: response.message || "Please try again",
        })
        return false
      }
    } catch (error) {
      console.error("Registration error:", error)
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: "Please try again.",
      })
      return false
    }
  }

  const googleSignIn = async () => {
    Toast.show({
      type: "info",
      text1: "Google Sign-In Coming Soon",
      text2: "Please use email/password for now",
    })
    return false
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken")
      setUser(null)
      Toast.show({
        type: "info",
        text1: "Logged Out",
        text2: "See you next time!",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData)
      if (response.success) {
        setUser(response.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Update profile error:", error)
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
        googleSignIn,
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
