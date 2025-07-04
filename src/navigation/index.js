// src/navigation/index.js
import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";


import WelcomeScreen from "../screens/WelcomeScreen";
import AuthScreen from "../screens/AuthScreen";
import DashboardScreen from "../screens/DashboardScreen";
import QuizListScreen from '../screens/QuizListScreen';
import QuizDetailScreen from '../screens/QuizDetailScreen';
import CreateQuizScreen from '../screens/CreateQuizScreen';
import EditQuizScreen from '../screens/EditQuizScreen';
import MatchmakingScreen from "../screens/MatchmakingScreen";
import GameLobbyScreen from "../screens/GameLobbyScreen";
import GameBattleScreen from "../screens/GameBattleScreen";
import GameResultsScreen from "../screens/GameResultsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import QuickPlayScreen from '../screens/QuickPlayScreen';
import OnboardingScreen from "../screens/OnboardingScreen";
import CategoriesScreen from '../screens/CategoriesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyQuizzesScreen from '../screens/MyQuizzesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else {
             iconName = focused ? "library" : "library-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};


export default function MainNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
     
      initialRouteName={user ? "MainTabs" : "Welcome"} 
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
     
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />

     
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="QuizList" component={QuizListScreen} />
      <Stack.Screen name="QuizDetail" component={QuizDetailScreen} />
      <Stack.Screen name="CreateQuiz" component={CreateQuizScreen} />
      <Stack.Screen name="EditQuiz" component={EditQuizScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Matchmaking" component={MatchmakingScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
<Stack.Screen name="MyQuizzes" component={MyQuizzesScreen} />
      
      
      <Stack.Screen name="QuickPlay" component={QuickPlayScreen} />
      <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
      <Stack.Screen name="GameBattle" component={GameBattleScreen} />
      <Stack.Screen name="GameResults" component={GameResultsScreen} />

    </Stack.Navigator>
  );
}