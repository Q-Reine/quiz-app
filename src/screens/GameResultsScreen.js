import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useGame } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";

export default function GameResultsScreen() {
    const navigation = useNavigation();
    const { leaderboard, leaveGame } = useGame();
    const { user } = useAuth();

    if (!leaderboard || leaderboard.length === 0) {
        // Fallback in case the user gets here without leaderboard data
        return (
            <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
                <Text style={styles.resultTitle}>Game Over</Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Dashboard')}>
                    <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    const sortedPlayers = [...leaderboard].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    const userResult = sortedPlayers.find(p => p.nickname === user.name);
    const isWinner = userResult && userResult.id === winner.id;

    const handlePlayAgain = () => {
        leaveGame();
        navigation.navigate('Dashboard');
    };

    const handleBackToDashboard = () => {
        leaveGame();
        navigation.navigate('Dashboard');
    };

    return (
        <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.resultHeader}>
                    <Text style={styles.resultEmoji}>{isWinner ? '🏆' : '👍'}</Text>
                    <Text style={styles.resultTitle}>{isWinner ? "Victory!" : "Good Game!"}</Text>
                </View>

                <View style={styles.scoresCard}>
                    <Text style={styles.scoresTitle}>Final Leaderboard</Text>
                    {sortedPlayers.map((player, index) => (
                        <View key={player.id} style={[styles.playerRow, index === 0 && styles.winnerRow]}>
                            <Text style={styles.playerRank}>{index + 1}</Text>
                            <Text style={styles.playerName}>{player.nickname} {player.id === userResult?.id ? '(You)' : ''}</Text>
                            <Text style={styles.playerScore}>{player.score} pts</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handlePlayAgain}>
                        <Text style={styles.primaryButtonText}>Play Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToDashboard}>
                        <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    scrollContent: { paddingTop: 60, paddingHorizontal: 20 },
    resultHeader: { alignItems: 'center', marginBottom: 30 },
    resultEmoji: { fontSize: 80 },
    resultTitle: { fontSize: 40, fontWeight: 'bold', color: 'white', marginTop: 10 },
    scoresCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, marginBottom: 40 },
    scoresTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20 },
    playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    winnerRow: { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: 8 },
    playerRank: { color: 'white', fontSize: 18, fontWeight: 'bold', width: 40, textAlign: 'center' },
    playerName: { color: 'white', fontSize: 18, flex: 1 },
    playerScore: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    buttonsContainer: { gap: 16, paddingBottom: 40 },
    primaryButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 12, alignItems: 'center' },
    primaryButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    secondaryButton: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', padding: 18, borderRadius: 12, alignItems: 'center' },
    secondaryButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});


// import React from "react";
// import { View, Text, FlatList, StyleSheet } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useGame } from "../contexts/GameContext";

// export default function GameResultsScreen() {
//   const { leaderboard } = useGame();

//   const renderItem = ({ item, index }) => (
//     <View style={styles.playerRow}>
//       <Text style={styles.rank}>{index + 1}.</Text>
//       <Text style={styles.name}>{item.nickname}</Text>
//       <Text style={styles.score}>{item.score}</Text>
//     </View>
//   );

//   return (
//     <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
//       <Text style={styles.title}>Game Over</Text>
//       <Text style={styles.subtitle}>Final Leaderboard</Text>
//       <FlatList
//         data={leaderboard}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
//       />
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 60 },
//   title: { fontSize: 36, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 8 },
//   subtitle: { fontSize: 18, color: "#DDD", textAlign: "center", marginBottom: 20 },
//   playerRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomColor: "#444", borderBottomWidth: 1 },
//   rank: { fontSize: 20, color: "#fff", width: 30 },
//   name: { fontSize: 20, color: "#fff", flex: 1 },
//   score: { fontSize: 20, color: "#10B981", width: 60, textAlign: "right" },
// });
