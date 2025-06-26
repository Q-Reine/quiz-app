import { createStackNavigator } from "@react-navigation/stack"

import DashboardScreen from "../screens/DashboardScreen"
import GameLobbyScreen from "../screens/GameLobbyScreen"
// import GameBattleScreen from "../screens/GameBattleScreen"
// import GameResultsScreen from "../screens/GameResultsScreen"
// import LeaderboardScreen from "../screens/LeaderboardScreen"
import ProfileScreen from "../screens/ProfileScreen"

const Stack = createStackNavigator()

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#FFF5F0" },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
      {/* <Stack.Screen name="GameBattle" component={GameBattleScreen} />
      <Stack.Screen name="GameResults" component={GameResultsScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} /> */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  )
}
