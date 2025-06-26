import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar, Platform } from "react-native"
import * as SplashScreen from "expo-splash-screen"
import Toast from "react-native-toast-message"

import { AuthProvider } from "./src/contexts/AuthContext"
import { GameProvider } from "./src/contexts/GameContext"

import SplashScreenComponent from "./src/screens/SplashScreen"
import MainNavigator from "./src/navigation/index"

const Stack = createStackNavigator()

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync()

        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#667eea", true)
          StatusBar.setBarStyle("light-content", true)
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (e) {
        console.warn(e)
      } finally {
        setIsReady(true)
        await SplashScreen.hideAsync()
      }
    }

    prepare()
  }, [])

  if (!isReady) {
    return null
  }

  if (showSplash) {
    return <SplashScreenComponent onComplete={() => setShowSplash(false)} />
  }

  return (
    <AuthProvider>
      <GameProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#667eea" translucent={false} />
          <MainNavigator />
          <Toast />
        </NavigationContainer>
      </GameProvider>
    </AuthProvider>
  )
}
