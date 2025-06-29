import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGame } from '../contexts/GameContext';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../contexts/ToastContext';

export default function GameLobbyScreen({ route }) {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const { players, setPlayers, startGame, leaveGame, setGamePhase, setGameSession } = useGame();
    
    const pin = route.params?.pin;
    const isHost = route.params?.isHost || false;

    useEffect(() => {
        if (isFocused) {
            if (!pin) {
                showToast("Error", "No Game PIN found.", "error");
                navigation.navigate('Dashboard');
                return;
            }

            if (socket) {
                // When the screen is focused, join the socket room and set the game session
                socket.emit('player_join_room', { pin });
                setGameSession({ pin });

                const handlePlayerListUpdate = (updatedPlayers) => setPlayers(updatedPlayers);
                const handleGameStarted = () => {
                    setGamePhase('question');
                    navigation.navigate('GameBattle');
                };

                socket.on('update_player_list', handlePlayerListUpdate);
                socket.on('game_started', handleGameStarted);

                return () => {
                    if (socket) {
                        socket.off('update_player_list', handlePlayerListUpdate);
                        socket.off('game_started', handleGameStarted);
                    }
                };
            }
        }
    }, [isFocused, socket, pin]);

    const handleLeaveRoom = () => {
        leaveGame();
        navigation.navigate('Dashboard');
    };

    const handleCopyPin = async () => {
        if (pin) {
            await Clipboard.setStringAsync(pin);
            showToast('Copied!', 'Game PIN copied to clipboard.', 'success');
        }
    };
    
    const handleStartGamePress = () => {
        startGame();
    };

    if (!pin) {
        return (
            <LinearGradient colors={["#1F2937", "#111827"]} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFF" />
            </LinearGradient>
        );
    }
    
    const canStartGame = players.length >= 1;

    return (
        <LinearGradient colors={["#1F2937", "#111827"]} style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleLeaveRoom}>
                        <Text style={styles.leaveButtonText}>Leave</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Game Lobby</Text>
                    <View style={{width: 50}} /> 
                </View>

                <View style={styles.pinContainer}>
                    <Text style={styles.pinLabel}>Game PIN</Text>
                    <Text style={styles.pinText}>{pin}</Text>
                    <TouchableOpacity style={styles.copyButton} onPress={handleCopyPin}>
                        <Icon name="content-copy" size={20} color="#FFF" />
                        <Text style={styles.copyButtonText}>Copy PIN</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.playersHeader}>Players ({players.length})</Text>
                {players.map((player, index) => (
                    <View key={player.id} style={styles.playerCard}>
                        <Text style={styles.playerNickname}>{player.nickname}</Text>
                        {index === 0 && <Text style={styles.hostBadge}>Host 👑</Text>}
                    </View>
                ))}
                
                {!canStartGame && isHost && (
                    <View style={styles.waitingContainer}>
                        <ActivityIndicator color="#9CA3AF" />
                        <Text style={styles.waitingText}>Waiting for players to join...</Text>
                    </View>
                )}
                
                {isHost && (
                    <TouchableOpacity
                        style={[styles.startGameButton, !canStartGame && styles.disabledButton]}
                        disabled={!canStartGame}
                        onPress={handleStartGamePress}
                    >
                        <Text style={styles.startGameButtonText}>
                            {!canStartGame ? 'Waiting for players...' : 'Start Game'}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    leaveButtonText: { color: '#F87171', fontSize: 16, fontWeight: 'bold' },
    headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    pinContainer: { backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 20, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 30 },
    pinLabel: { color: '#9CA3AF', fontSize: 16, marginBottom: 8 },
    pinText: { color: '#FFF', fontSize: 48, fontWeight: 'bold', letterSpacing: 8, fontFamily: 'monospace' },
    copyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 16 },
    copyButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
    playersHeader: { color: '#FFF', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 10 },
    playerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#374151', marginHorizontal: 20, padding: 16, borderRadius: 8, marginBottom: 10 },
    playerNickname: { color: '#FFF', fontSize: 18 },
    hostBadge: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold' },
    waitingContainer: { padding: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    waitingText: { color: '#9CA3AF', fontSize: 16, fontStyle: 'italic', marginLeft: 10 },
    startGameButton: { margin: 20, marginTop: 40, backgroundColor: '#10B981', borderRadius: 12, padding: 18, alignItems: 'center' },
    disabledButton: { backgroundColor: '#4B5563' },
    startGameButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});