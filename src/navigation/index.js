"use client"
import { createStackNavigator } from "@react-navigation/stack"
import { useAuth } from "../contexts/AuthContext"

import WelcomeScreen from "../screens/WelcomeScreen"
import OnboardingScreen from "../screens/OnboardingScreen"
import AuthNavigator from "./AuthNavigator"
import AppNavigator from "./AppNavigator"

const Stack = createStackNavigator()

export default function MainNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return null // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="AuthFlow" component={AuthNavigator} />
        </>
      )}
    </Stack.Navigator>
  )
}
