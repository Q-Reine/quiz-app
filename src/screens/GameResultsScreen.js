import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useGame } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function GameResultsScreen() {
  const navigation = useNavigation();
  const { leaderboard, leaveGame } = useGame();
  const { user } = useAuth();

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
        <Text style={styles.resultTitle}>Game Over</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);
  const others = sorted.slice(3);
  const userRank = sorted.findIndex(p => p.id === user.id) + 1;
  const isWinner = userRank === 1;
  const isAlone = leaderboard.length === 1;

  const handleLeave = () => {
    leaveGame();
    navigation.navigate("Dashboard");
  };

  const getInitials = (name = "") => name.slice(0, 1).toUpperCase();

  return (
    <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Game Over</Text>

        
        {isAlone ? (
          <View style={styles.soloContainer}>
            <Text style={styles.soloMessage}>You're the only challenger today. Well played!</Text>
            <Text style={styles.playerScore}>{sorted[0].score} pt</Text>
          </View>
        ) : (
          <>
          
            {isWinner && (
              <Text style={styles.confetti}>🎉🎉 Congratulations Champion 🎉🎉</Text>
            )}

            
            <View style={styles.podium}>
              {top3[1] && (
                <View style={[styles.podiumSpot, styles.second]}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(top3[1].nickname)}</Text></View>
                  <Text style={styles.name}>{top3[1].nickname}</Text>
                  <Text style={styles.points}>{top3[1].score} pt</Text>
                  <View style={[styles.tierBox, { height: 90 }]}><Text style={styles.tierNumber}>2</Text></View>
                </View>
              )}
              {top3[0] && (
                <View style={[styles.podiumSpot, styles.first]}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(top3[0].nickname)}</Text></View>
                  <Text style={styles.name}>{top3[0].nickname}</Text>
                  <Text style={styles.points}>{top3[0].score} pt</Text>
                  <View style={[styles.tierBox, { height: 120 }]}><Text style={styles.tierNumber}>1</Text></View>
                </View>
              )}
              {top3[2] && (
                <View style={[styles.podiumSpot, styles.third]}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(top3[2].nickname)}</Text></View>
                  <Text style={styles.name}>{top3[2].nickname}</Text>
                  <Text style={styles.points}>{top3[2].score} pt</Text>
                  <View style={[styles.tierBox, { height: 70 }]}><Text style={styles.tierNumber}>3</Text></View>
                </View>
              )}
            </View>

         
            <View style={styles.list}>
              {others.map((player, index) => {
                const isUser = player.id === user.id;
                return (
                  <View key={player.id} style={[styles.row, isUser && styles.youHighlight]}>
                    <Text style={styles.rank}>{index + 4}</Text>
                    <View style={styles.avatarSmall}><Text style={styles.avatarText}>{getInitials(player.nickname)}</Text></View>
                    <Text style={styles.playerName}>{isUser ? "YOU" : player.nickname}</Text>
                    <Text style={styles.playerScore}>{player.score} pt</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

       
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.playBtn} onPress={handleLeave}>
            <Text style={styles.playBtnText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleLeave}>
            <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const AVATAR_SIZE = 50;
const AVATAR_SMALL = 36;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  confetti: {
    fontSize: 18,
    color: "#FACC15",
    textAlign: "center",
    marginBottom: 10,
  },
  soloContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  soloMessage: {
    color: "#D1D5DB",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  podium: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    marginBottom: 30,
  },
  podiumSpot: {
    alignItems: "center",
    width: width / 3.5,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  points: {
    color: "#D1D5DB",
    fontSize: 13,
    marginBottom: 6,
  },
  tierBox: {
    backgroundColor: "#8B5CF6",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tierNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  first: { zIndex: 3 },
  second: { zIndex: 2 },
  third: { zIndex: 1 },
  list: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "rgba(255,255,255,0.1)",
    borderBottomWidth: 1,
  },
  rank: {
    color: "#fff",
    width: 30,
    fontSize: 16,
    fontWeight: "bold",
  },
  avatarSmall: {
    width: AVATAR_SMALL,
    height: AVATAR_SMALL,
    borderRadius: AVATAR_SMALL / 2,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  playerName: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  playerScore: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "bold",
  },
  youHighlight: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
    borderRadius: 4,
  },
  buttons: {
    marginTop: 30,
    paddingHorizontal: 20,
    gap: 16,
  },
  playBtn: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  playBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
