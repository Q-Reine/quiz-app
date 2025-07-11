import { useEffect, useState } from "react"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ToastProvider } from "./src/contexts/ToastContext"
import { AuthProvider } from "./src/contexts/AuthContext"
import { GameProvider } from "./src/contexts/GameContext"
import { SocketProvider } from "./src/contexts/SocketContext"
import MainNavigator from "./src/navigation/index"
import LoadingScreen from "./src/components/LoadingScreen"

export default function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              <GameProvider>
                <MainNavigator />
                <StatusBar style="light" />
              </GameProvider>
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}