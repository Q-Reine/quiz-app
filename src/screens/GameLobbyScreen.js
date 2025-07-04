import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';

export default function GameLobbyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { socket } = useSocket();
  const { players, setPlayers, leaveGame } = useGame();
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  const { pin, isHost, nickname } = route.params || {};

 
  useEffect(() => {
    if (!pin || !nickname) {
      Alert.alert("Error", "Missing game information");
      navigation.goBack();
      return;
    }

    if (!socket) {
      Alert.alert("Error", "Not connected to server");
      navigation.goBack();
      return;
    }

    let connectionTimeout;
    const handleJoinResponse = (response) => {
      clearTimeout(connectionTimeout);
      setLoading(false);
      
      if (!response?.success) {
        Alert.alert(
          "Join Failed", 
          response?.message || "Couldn't join the game"
        );
        navigation.goBack();
      }
    };

    const joinGame = () => {
      console.log(`Joining game ${pin} as ${nickname} (${isHost ? 'host' : 'player'})`);
      socket.emit(
        isHost ? 'player_join_room' : 'player_join',
        { pin, nickname },
        handleJoinResponse
      );
    };

    
    connectionTimeout = setTimeout(() => {
      if (loading) {
        setConnectionError(true);
        Alert.alert(
          "Connection Timeout", 
          "Taking too long to connect. Please check your network."
        );
      }
    }, 8000);

    
    if (socket.connected) {
      joinGame();
    } else {
      socket.once('connect', joinGame);
    }

    // Setup event listeners
    const updatePlayers = (updatedPlayers) => {
      console.log("Received player list update:", updatedPlayers);
      setPlayers(updatedPlayers);
    };

    const handleGameStart = () => {
      navigation.navigate('GameBattle');
    };

    const handleConnectionError = (err) => {
      console.log("Connection error:", err);
      setConnectionError(true);
    };

    socket.on('update_player_list', updatePlayers);
    socket.on('game_started', handleGameStart);
    socket.on('connect_error', handleConnectionError);

    // Cleanup
    return () => {
      clearTimeout(connectionTimeout);
      socket.off('update_player_list', updatePlayers);
      socket.off('game_started', handleGameStart);
      socket.off('connect_error', handleConnectionError);
    };
  }, [socket, pin, nickname, isHost]);

  const handleStartGame = () => {
    if (!isHost) return;
    socket.emit('start_game', { pin });
  };

  const handleLeaveGame = () => {
    leaveGame();
    navigation.navigate(isHost ? 'Dashboard' : 'QuickPlay');
  };

  if (connectionError) {
    return (
      <LinearGradient colors={["#1F2937", "#111827"]} style={styles.fullContainer}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={50} color="#F87171" />
          <Text style={styles.errorText}>Connection Failed</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => setConnectionError(false)}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.leaveButton}
            onPress={handleLeaveGame}
          >
            <Text style={styles.leaveButtonText}>Leave Game</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (loading || !players) {
    return (
      <LinearGradient colors={["#1F2937", "#111827"]} style={styles.fullContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Joining game...</Text>
          <Text style={styles.pinText}>PIN: {pin}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1F2937", "#111827"]} style={styles.fullContainer}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
       
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLeaveGame}>
            <Text style={styles.leaveButtonText}>Leave</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Game Lobby</Text>
          <View style={{ width: 60 }} />
        </View>

       
        <View style={styles.infoContainer}>
          <View style={styles.pinContainer}>
            <Text style={styles.pinLabel}>Game PIN</Text>
            <Text style={styles.pinDisplay}>{pin}</Text>
          </View>
          <Text style={styles.nicknameText}>Playing as: {nickname}</Text>
        </View>

        {/* Players List */}
        <Text style={styles.sectionTitle}>Players ({players.length})</Text>
        <View style={styles.playersContainer}>
          {players.map((player, index) => (
            <View key={player.id} style={[
              styles.playerCard,
              index === 0 && styles.hostCard
            ]}>
              <Text style={styles.playerName}>{player.nickname}</Text>
              {index === 0 && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>HOST</Text>
                </View>
              )}
            </View>
          ))}
        </View>

       
        {isHost && (
          <TouchableOpacity
            style={[
              styles.startButton,
              players.length < 1 && styles.disabledButton
            ]}
            onPress={handleStartGame}
            disabled={players.length < 1}
          >
            <Text style={styles.startButtonText}>
              {players.length < 1 
                ? 'Waiting for players...' 
                : 'Start Game'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    paddingTop: 50,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 20,
  },
  pinText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F87171',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  retryText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaveButton: {
    borderWidth: 1,
    borderColor: '#F87171',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 15,
  },
  leaveButtonText: {
    color: '#F87171',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  leaveButtonText: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  pinContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
  },
  pinLabel: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 5,
  },
  pinDisplay: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 5,
  },
  nicknameText: {
    color: '#D1D5DB',
    fontSize: 16,
    marginTop: 15,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  playersContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  playerCard: {
    backgroundColor: '#374151',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostCard: {
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  playerName: {
    color: '#FFF',
    fontSize: 18,
  },
  hostBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  hostBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#4B5563',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});