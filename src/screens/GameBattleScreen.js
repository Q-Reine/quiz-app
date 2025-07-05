import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useSocket } from "../contexts/SocketContext";
import { useGame } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function GameBattleScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { socket } = useSocket();
  const { showToast } = useToast();
  const {
    gamePin,
    players,
    setPlayers,
    currentQuestion,
    setCurrentQuestion,
    setLeaderboard,
    gamePhase,
    setGamePhase,
    answerResult,
    setAnswerResult,
    submitAnswer,
    leaveGame
  } = useGame();
  const { user } = useAuth();

  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [localScoreUpdate, setLocalScoreUpdate] = useState(null);
  const [correctOptionId, setCorrectOptionId] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (!socket || !isFocused || !gamePin) return;

    setConnectionError(false);
    


    const handleNewQuestion = (question) => {
      console.log("[BATTLE] Received new question:", question);
      setCurrentQuestion(question);
      setAnswerResult(null);
      setSelectedOptionId(null);
      setLocalScoreUpdate(null);
      setCorrectOptionId(null);
      setShowCorrectAnswer(false);
      setGamePhase("question");
      setTimeLeft(question.duration || 15); 
      setConnectionError(false);
    };

    const handleQuestionTimer = ({ duration }) => {
      setTimeLeft(duration);
    };

    const handleShowLeaderboard = (leaderboardPlayers) => {
      console.log("[BATTLE] Showing leaderboard");
      setShowCorrectAnswer(true);
      setTimeout(() => {
        setLeaderboard(leaderboardPlayers);
        setPlayers(leaderboardPlayers);
        setGamePhase("results");
        setShowCorrectAnswer(false);
      }, 3000);
    };

    const handleAnswerResult = (result) => {
      console.log("[BATTLE] Received answer result:", result);
      setAnswerResult(result);
      setCorrectOptionId(result.correctOptionId);
      if (result.isCorrect && result.scoreAwarded > 0) {
        setLocalScoreUpdate({
          playerName: user?.name,
          scoreAdded: result.scoreAwarded
        });
      }
    };

    const handleGameOver = (finalResults) => {
      console.log("[BATTLE] Game over!");
      setLeaderboard(finalResults.players);
      setPlayers(finalResults.players);
      setGamePhase("finished");
      navigation.navigate("GameResults");
    };

    const handleGameError = ({ message }) => {
      setConnectionError(true);
      showToast("Game Error", message, "error");
      setTimeout(() => {
        if (message.includes("not found") || message.includes("cannot continue")) {
          leaveGame();
          navigation.navigate("Dashboard");
        }
      }, 3000);
    };

    const handleUpdatePlayers = (updatedPlayers) => {
      setPlayers(updatedPlayers);
      setLocalScoreUpdate(null);
    };

    const handleDisconnect = () => {
      setConnectionError(true);
      showToast("Connection Lost", "Trying to reconnect...", "warning");
    };

    const handleConnect = () => {
      setConnectionError(false);
      showToast("Reconnected", "Connection restored!", "success");
   
    };

    const handlePlayerDisconnected = ({ playerId }) => {
      if (playerId === socket.data?.playerId) {
        showToast("Disconnected", "You have been disconnected from the game", "error");
        setTimeout(() => {
          leaveGame();
          navigation.navigate("Dashboard");
        }, 2000);
      }
    };

    socket.on("new_question", handleNewQuestion);
    socket.on("question_timer", handleQuestionTimer);
    socket.on("show_leaderboard", handleShowLeaderboard);
    socket.on("answer_result", handleAnswerResult);
    socket.on("game_over", handleGameOver);
    socket.on("game_error", handleGameError);
    socket.on("update_player_list", handleUpdatePlayers);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);
    socket.on("player_disconnected", handlePlayerDisconnected);

    return () => {
      socket.off("new_question", handleNewQuestion);
      socket.off("question_timer", handleQuestionTimer);
      socket.off("show_leaderboard", handleShowLeaderboard);
      socket.off("answer_result", handleAnswerResult);
      socket.off("game_over", handleGameOver);
      socket.off("game_error", handleGameError);
      socket.off("update_player_list", handleUpdatePlayers);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
      socket.off("player_disconnected", handlePlayerDisconnected);
    };
  }, [socket, isFocused, gamePin, user?.name]);

  
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gamePhase === "question" && isFocused && typeof timeLeft === "number" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gamePhase, isFocused, timeLeft]);

  const handleAnswerSelect = (optionId) => {
    if (selectedOptionId || answerResult || timeLeft === 0 || connectionError) return;
    setSelectedOptionId(optionId);
    submitAnswer(optionId);
  };

  const getAnswerStyle = (optionId) => {
    const isThisOptionSelected = selectedOptionId === optionId;
    const isThisOptionCorrect = correctOptionId === optionId;

    if (timeLeft === 0 || showCorrectAnswer) {
      if (isThisOptionCorrect) return styles.correctAnswer;
      if (isThisOptionSelected && !answerResult?.isCorrect) return styles.wrongAnswer;
      return styles.disabledAnswer;
    }

    if (isThisOptionSelected) return styles.selectedAnswer;

    return styles.answerButton;
  };

  if (connectionError) {
    return (
      <LinearGradient colors={["#1F2937", "#111827"]} style={styles.loadingContainer}>
        <Text style={styles.errorText}>Connection Error</Text>
        <TouchableOpacity style={styles.leaveButton} onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.leaveButtonText}>Leave Game</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }
  
 
  if (gamePhase !== "question" || !currentQuestion) {
    return (
      <LinearGradient colors={["#1F2937", "#111827"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>
          {gamePhase === "finished" ? "Loading Results..." : "Loading Next Question..."}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1F2937", "#8B5CF6", "#1F2937"]} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 50 }}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={styles.questionCounter}>
              Question {currentQuestion.questionNumber}/{currentQuestion.totalQuestions}
            </Text>
            <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={[styles.timerText, timeLeft <= 10 && styles.timerWarning, timeLeft <= 5 && styles.timerCritical]}>
                {timeLeft}
              </Text>
            </Animated.View>
          </View>

          <View style={styles.playersScrollContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playersContainer}>
              {players.map((player) => (
                <View
                  
                  key={player.id}
                  style={[styles.playerCard, localScoreUpdate?.playerName === player.nickname && styles.scoreHighlight]}
                >
                  <Text style={styles.playerName} numberOfLines={1}>{player.nickname}</Text>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.playerScore}>{player.score}</Text>
                    {localScoreUpdate?.playerName === player.nickname && (
                      <Text style={styles.scoreAnimation}>+{localScoreUpdate.scoreAdded}</Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
          </View>

          <View style={styles.answersContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.answerButton, getAnswerStyle(option.id)]}
                onPress={() => handleAnswerSelect(option.id)}
                disabled={!!selectedOptionId || timeLeft === 0 || showCorrectAnswer || connectionError}
              >
                <Text style={styles.answerText}>
                  {String.fromCharCode(65 + index)}. {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {answerResult && (
            <View style={styles.feedbackContainer}>
              <Text style={[
                styles.feedbackText,
                answerResult.isCorrect ? styles.correctText : styles.incorrectText
              ]}>
                {answerResult.isCorrect ? `Correct! +${answerResult.scoreAwarded} points` : 'Incorrect!'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  loadingText: { color: "#FFF", marginTop: 20, fontSize: 16, fontWeight: '600' },
  errorText: { color: "#EF4444", fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  leaveButton: { backgroundColor: "#EF4444", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  leaveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 15 },
  questionCounter: { color: "#D1D5DB", fontSize: 16 },
  timerContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  timerText: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  timerWarning: { color: "#FBBF24" },
  timerCritical: { color: "#EF4444", textShadowColor: '#EF4444', textShadowRadius: 10 },
  playersScrollContainer: { paddingHorizontal: 10, marginBottom: 20 },
  playersContainer: { flexDirection: "row", alignItems: "center", paddingRight: 20 },
  playerCard: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 12, marginHorizontal: 5, minWidth: 100 },
  scoreHighlight: { backgroundColor: "rgba(16,185,129,0.3)", borderWidth: 2, borderColor: "#10B981" },
  playerName: { color: "#FFF", fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  scoreContainer: { flexDirection: "row", alignItems: "flex-end" },
  playerScore: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  scoreAnimation: { color: "#10B981", fontSize: 16, fontWeight: "bold", marginLeft: 8, position: 'absolute', right: -20, top: -10 },
  questionContainer: { backgroundColor: "rgba(0,0,0,0.2)", padding: 20, marginHorizontal: 20, borderRadius: 12, minHeight: 120, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  questionText: { color: "#FFF", fontSize: 22, fontWeight: "bold", textAlign: "center", lineHeight: 30 },
  answersContainer: { marginTop: 20, paddingHorizontal: 20 },
  answerButton: { backgroundColor: "rgba(255,255,255,0.1)", padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 2, borderColor: "transparent" },
  answerText: { color: "#FFF", fontSize: 18 },
  selectedAnswer: { borderColor: "#3B82F6", backgroundColor: "rgba(59,130,246,0.3)" },
  correctAnswer: { borderColor: "#10B981", backgroundColor: "rgba(16,185,129,0.4)" },
  wrongAnswer: { borderColor: "#EF4444", backgroundColor: "rgba(239,68,68,0.4)" },
  disabledAnswer: { opacity: 0.6, backgroundColor: "rgba(107,114,128,0.2)", borderColor: "transparent" },
  feedbackContainer: { marginTop: 20, paddingHorizontal: 20, alignItems: "center" },
  feedbackText: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  correctText: { color: "#34D399" },
  incorrectText: { color: "#F87171" }
});