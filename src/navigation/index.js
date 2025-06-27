"use client"

import { createStackNavigator } from "@react-navigation/stack"
import { useAuth } from "../contexts/AuthContext"
import { useGame } from "../contexts/GameContext"

// Screens
import LoadingScreen from "../components/LoadingScreen"
import WelcomeScreen from "../screens/WelcomeScreen"
import AuthScreen from "../screens/AuthScreen"
import DashboardScreen from "../screens/DashboardScreen"
import MatchmakingScreen from "../screens/MatchmakingScreen"
import GameLobbyScreen from "../screens/GameLobbyScreen"
import GameBattleScreen from "../screens/GameBattleScreen"
import GameResultsScreen from "../screens/GameResultsScreen"
import ProfileScreen from "../screens/ProfileScreen"

const Stack = createStackNavigator()

export default function MainNavigator() {
  const { user, loading } = useAuth()
  const { gamePhase, currentRoom } = useGame()

  if (loading) {
    return <LoadingScreen />
  }

  // Determine initial route based on game state
  const getInitialRouteName = () => {
    if (!user) return "Welcome"
    if (currentRoom) {
      if (gamePhase === "lobby") return "GameLobby"
      if (gamePhase === "countdown" || gamePhase === "question" || gamePhase === "results") return "GameBattle"
      if (gamePhase === "finished") return "GameResults"
    }
    return "Dashboard"
  }

  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Matchmaking" component={MatchmakingScreen} />
          <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
          <Stack.Screen name="GameBattle" component={GameBattleScreen} />
          <Stack.Screen name="GameResults" component={GameResultsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}
