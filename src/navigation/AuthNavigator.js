import { createStackNavigator } from "@react-navigation/stack"

import AuthScreen from "../screens/AuthScreen"
import QuickPlayScreen from "../screens/QuickPlayScreen"

const Stack = createStackNavigator()

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#f8fafc" },
      }}
      initialRouteName="QuickPlay"
    >
      <Stack.Screen name="QuickPlay" component={QuickPlayScreen} />
      <Stack.Screen name="AuthLogin" component={AuthScreen} />
    </Stack.Navigator>
  )
}
