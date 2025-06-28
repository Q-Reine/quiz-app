import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

import WelcomeScreen from "../screens/WelcomeScreen"
import OnboardingScreen from "../screens/OnboardingScreen"
import QuickPlayScreen from "../screens/QuickPlayScreen"
import CategorySelectionScreen from "../screens/CategorySelectionScreen"
import AuthScreen from "../screens/AuthScreen"
import DashboardScreen from "../screens/DashboardScreen"
import GameLobbyScreen from "../screens/GameLobbyScreen"
import GameBattleScreen from "../screens/GameBattleScreen"
import GameResultsScreen from "../screens/GameResultsScreen"
import ProfileScreen from "../screens/ProfileScreen"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Categories") {
            iconName = focused ? "library" : "library-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Categories" component={CategorySelectionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }
        },
      }}
    >
      
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="QuickPlay" component={QuickPlayScreen} />

      <Stack.Screen name="Auth" component={AuthScreen} />

      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="CategorySelection" component={CategorySelectionScreen} />

      <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
      <Stack.Screen name="GameBattle" component={GameBattleScreen} />
      <Stack.Screen name="GameResults" component={GameResultsScreen} />
    </Stack.Navigator>
  )
}

export default AppNavigator
