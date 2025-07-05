import React, { useEffect, useState, useCallback } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  BackHandler
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';

export default function GameLobbyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { socket } = useSocket();

  const { players, setPlayers, leaveGame, startGame, joinGame } = useGame();
  const [loading, setLoading] = useState(true);

  const { pin, isHost, nickname } = route.params || {};

 

  const updatePlayersListener = useCallback((playerList) => {
    console.log('[LOBBY] Received player list update:', playerList);
    setPlayers(playerList);
  }, [setPlayers]);

  const gameStartedListener = useCallback(() => {
    console.log('[LOBBY] Game started, navigating to battle...');
    navigation.navigate('GameBattle');
  }, [navigation]); 

 

  const handleLeaveAction = () => {
    console.log('[LOBBY] Leave Action Triggered.');
    leaveGame();
   
    navigation.navigate(isHost ? 'Dashboard' : 'QuickPlay');
    return true;
  };

 
  useEffect(() => {
    if (!pin || !nickname) {
      Alert.alert("Error", "Missing game information.");
      navigation.goBack();
      return;
    }

    const joinAndSetup = async () => {
      try {
        console.log('[LOBBY] Attempting to join game...');
        await joinGame(pin, nickname, isHost);
      } catch (error) {
        console.error('[LOBBY] Join failed:', error);
        Alert.alert("Join Failed", error.message);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    joinAndSetup();

  }, [pin, nickname, isHost, joinGame, navigation]); 



  useEffect(() => {
    if (socket) {
      console.log('[LOBBY] Attaching socket listeners...');
      socket.on('update_player_list', updatePlayersListener);
      socket.on('game_started', gameStartedListener);

      
      return () => {
        console.log('[LOBBY] Cleaning up socket listeners...');
        socket.off('update_player_list', updatePlayersListener);
        socket.off('game_started', gameStartedListener);
      };
    }
  }, [socket, updatePlayersListener, gameStartedListener]); 
 


 
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to leave the lobby?", [
        { text: "Cancel", onPress: () => null, style: "cancel" },
        { text: "YES, LEAVE", onPress: () => handleLeaveAction() }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const handleStartGame = () => {
    console.log('[LOBBY] Host is starting game...');
    startGame();
  };
  
  const isButtonDisabled = !isHost || players.length < 1;

  if (loading) {
    return (
      <LinearGradient colors={["#1F2937", "#111827"]} style={styles.fullContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Joining lobby...</Text>
        </View>
      </LinearGradient>
    );
  }
  
  return (
    <LinearGradient colors={["#1F2937", "#111827"]} style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
              Alert.alert("Leave Lobby", "Are you sure you want to leave?", [
                { text: "Cancel", style: "cancel" },
                { text: "Leave", style: "destructive", onPress: handleLeaveAction }
              ]);
            }}>
            <Text style={styles.headerLeaveButtonText}>Leave</Text>
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

        <Text style={styles.sectionTitle}>Players ({players.length})</Text>
        
        <View style={styles.playersContainer}>
          {players.length === 0 ? (
             <View style={styles.noPlayersContainer}>
                <Text style={styles.noPlayersText}>Waiting for players to join...</Text>
            </View>
          ) : (
            players.map((player, index) => (
              <View key={player.id || index} style={[
                styles.playerCard,
                
                index === 0 && isHost && styles.hostCard 
              ]}>
                <Text style={styles.playerName}>{player.nickname}</Text>
                {index === 0 && isHost && (
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>HOST</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {isHost && (
          <TouchableOpacity
            style={[styles.startButton, isButtonDisabled && styles.disabledButton]}
            onPress={handleStartGame}
            disabled={isButtonDisabled}
          >
            <Text style={styles.startButtonText}>
             
              {players.length < 2 ? `Waiting for players...` : 'Start Game'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, paddingTop: 50 },
  scrollContainer: { paddingBottom: 40, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 18, marginTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerLeaveButtonText: { color: '#F87171', fontSize: 16, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  infoContainer: { alignItems: 'center', marginBottom: 30 },
  pinContainer: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 15, alignItems: 'center' },
  pinLabel: { color: '#9CA3AF', fontSize: 16, marginBottom: 5 },
  pinDisplay: { color: '#FFF', fontSize: 36, fontWeight: 'bold', letterSpacing: 8 },
  nicknameText: { color: '#D1D5DB', fontSize: 16, marginTop: 15 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  playersContainer: { marginBottom: 40 },
  noPlayersContainer: { alignItems: 'center', paddingVertical: 40 },
  noPlayersText: { color: '#9CA3AF', fontSize: 16 },
  playerCard: { backgroundColor: '#374151', padding: 20, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hostCard: { borderWidth: 2, borderColor: '#F59E0B' },
  playerName: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  hostBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  hostBadgeText: { color: '#1F2937', fontSize: 12, fontWeight: 'bold' },
  startButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 12, alignItems: 'center' },
  disabledButton: { backgroundColor: '#4B5563' },
  startButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});