// src/navigation/index.js
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
// Import all your screens
import WelcomeScreen from "../screens/WelcomeScreen";
import AuthScreen from "../screens/AuthScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CategoriesScreen from '../screens/CategoriesScreen';
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

const Stack = createStackNavigator();

export default function MainNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          {/* QuickPlay available for guests but will prompt auth when needed */}
          <Stack.Screen name="QuickPlay" component={QuickPlayScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="QuizList" component={QuizListScreen} />
          <Stack.Screen name="QuizDetail" component={QuizDetailScreen} />
          <Stack.Screen name="CreateQuiz" component={CreateQuizScreen} />
          <Stack.Screen name="EditQuiz" component={EditQuizScreen} />
          <Stack.Screen name="Matchmaking" component={MatchmakingScreen} />
          <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
          <Stack.Screen name="GameBattle" component={GameBattleScreen} />
          <Stack.Screen name="GameResults" component={GameResultsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="QuickPlay" component={QuickPlayScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}