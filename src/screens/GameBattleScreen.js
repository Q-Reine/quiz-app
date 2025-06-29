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

export default function GameBattleScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { socket } = useSocket();
  const {
    gameSession,
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
    updatePlayerScore
  } = useGame();
  const { user } = useAuth();

  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [localScoreUpdate, setLocalScoreUpdate] = useState(null);
  const [correctOptionId, setCorrectOptionId] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for critical timer
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (!socket || !isFocused || !gameSession?.pin) return;

    // Announce player is ready for questions
    socket.emit('player_ready_for_question', { pin: gameSession.pin });

    const handleNewQuestion = (question) => {
      console.log("Received new question:", question);
      setCurrentQuestion(question);
      setAnswerResult(null);
      setSelectedOptionId(null);
      setLocalScoreUpdate(null);
      setCorrectOptionId(null);
      setShowCorrectAnswer(false);
      setGamePhase('question');
      setTimeLeft(null); // Reset timer, will be set by 'question_timer'
    };

    const handleQuestionTimer = ({ duration }) => {
      console.log(`Timer started with duration: ${duration}`);
      setTimeLeft(duration);
    };

    const handleShowLeaderboard = (leaderboardPlayers) => {
      console.log("Showing leaderboard:", leaderboardPlayers);
      setShowCorrectAnswer(true); // Reveal the correct answer for a few seconds
      
      setTimeout(() => {
        setLeaderboard(leaderboardPlayers);
        setPlayers(leaderboardPlayers); // Update players list with latest scores
        setGamePhase('results');
        setShowCorrectAnswer(false); // Clean up for next round
      }, 3000); // 3-second delay to show the result on the question screen
    };

    const handleAnswerResult = (result) => {
      console.log('[FRONTEND-RECEIVE] Received answer_result from backend:', result);
  setAnswerResult(result);
  setCorrectOptionId(result.correctOptionId);

      // This logic is now in the GameContext, but you can keep a local animation state if desired
      if (result.isCorrect && result.scoreAwarded > 0) {
        setLocalScoreUpdate({
          playerName: user?.name,
          scoreAdded: result.scoreAwarded
        });
        // The global player list will be updated via 'update_player_list'
      }
    };

    const handleGameOver = (finalResults) => {
      console.log("Game over. Final results:", finalResults);
      setLeaderboard(finalResults.players);
      setPlayers(finalResults.players);
      setGamePhase('finished');
      navigation.navigate('GameResults');
    };

    const handleGameError = ({ message }) => {
      alert(`Game Error: ${message}`);
      navigation.navigate('Dashboard');
    };

    const handleUpdatePlayers = (updatedPlayers) => {
      console.log("Updating player list:", updatedPlayers);
      setPlayers(updatedPlayers);
      setLocalScoreUpdate(null); // Clear local animation state once global state is synced
    };

    socket.on('new_question', handleNewQuestion);
    socket.on('question_timer', handleQuestionTimer);
    socket.on('show_leaderboard', handleShowLeaderboard);
    socket.on('answer_result', handleAnswerResult);
    socket.on('game_over', handleGameOver);
    socket.on('game_error', handleGameError);
    socket.on('update_player_list', handleUpdatePlayers);

    return () => {
      socket.off('new_question', handleNewQuestion);
      socket.off('question_timer', handleQuestionTimer);
      socket.off('show_leaderboard', handleShowLeaderboard);
      socket.off('answer_result', handleAnswerResult);
      socket.off('game_over', handleGameOver);
      socket.off('game_error', handleGameError);
      socket.off('update_player_list', handleUpdatePlayers);
    };
  }, [socket, isFocused, gameSession?.pin, user?.name]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gamePhase === 'question' && isFocused && typeof timeLeft === 'number' && timeLeft > 0) {
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
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
    if (answerResult || selectedOptionId || timeLeft === 0) return;
    setSelectedOptionId(optionId);
    submitAnswer(optionId);
  };

  /**
   * REFINED: Determines the style for an answer option based on the game state.
   */
  const getAnswerStyle = (optionId) => {
    const isThisOptionSelected = selectedOptionId === optionId;
    const isThisOptionCorrect = correctOptionId === optionId;

    // State 1: After an answer result is received from the backend
    if (answerResult) {
      if (isThisOptionCorrect) {
        return styles.correctAnswer; // Always highlight the correct answer in green
      }
      if (isThisOptionSelected && !answerResult.isCorrect) {
        return styles.wrongAnswer; // If this was the selected *and* wrong answer, highlight in red
      }
      return styles.disabledAnswer; // All other unselected/incorrect options are grayed out
    }
    
    // State 2: When the round ends and the correct answer is revealed to everyone
    if (showCorrectAnswer) {
       if (isThisOptionCorrect) {
        return styles.correctAnswer;
      }
      return styles.disabledAnswer;
    }

    // State 3: While waiting for the result, after the user has clicked an option
    if (isThisOptionSelected) {
      return styles.selectedAnswer;
    }
    
    // Default state
    return styles.answerButton;
  };

  const getCurrentPlayerData = () => {
    return players.find(p => p.nickname === user?.name) || { nickname: user?.name || 'You', score: 0 };
  };

  const me = getCurrentPlayerData();
  const opponent = players.find(p => p.nickname !== user?.name) || { nickname: 'Opponent', score: 0 };

  if (gamePhase === 'results') {
    return (
      <LinearGradient colors={["#1F2937", "#111827"]} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Next Question...</Text>
        <ActivityIndicator size="large" color="#FFF" />
      </LinearGradient>
    );
  }

  if (gamePhase === 'finished') {
    return (
      <LinearGradient colors={["#1F2937", "#111827"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading Results...</Text>
      </LinearGradient>
    );
  }

  if (!currentQuestion) {
    return (
      <LinearGradient colors={["#1F2937", "#111827"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Waiting for game to start...</Text>
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
              <Text style={[
                styles.timerText, 
                timeLeft <= 10 && styles.timerWarning,
                timeLeft <= 5 && styles.timerCritical
              ]}>
                {timeLeft}
              </Text>
            </Animated.View>
          </View>

          <View style={styles.playersContainer}>
            <View style={[styles.playerCard, localScoreUpdate?.playerName === me.nickname && styles.scoreHighlight]}>
              <Text style={styles.playerName} numberOfLines={1}>{me.nickname}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.playerScore}>{me.score}</Text>
                {localScoreUpdate?.playerName === me.nickname && (
                  <Text style={styles.scoreAnimation}>+{localScoreUpdate.scoreAdded}</Text>
                )}
              </View>
            </View>
            <View style={styles.playerCard}>
              <Text style={styles.playerName} numberOfLines={1}>{opponent.nickname}</Text>
              <Text style={styles.playerScore}>{opponent.score}</Text>
            </View>
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
                disabled={!!selectedOptionId || !!answerResult || timeLeft === 0 || showCorrectAnswer}
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
                {answerResult.isCorrect ? 
                  `Correct! +${answerResult.scoreAwarded} points` : 
                  'Incorrect!'}
              </Text>
            </View>
          )}

        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  contentWrapper: {
    flex: 1
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    color: '#FFF', 
    marginTop: 10, 
    fontSize: 16 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 15 
  },
  questionCounter: { 
    color: '#D1D5DB', 
    fontSize: 16 
  },
  timerContainer: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  timerText: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  timerWarning: { 
    color: '#FBBF24' 
  },
  timerCritical: { 
    color: '#EF4444' 
  },
  playersContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  playerCard: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 8, 
    padding: 12, 
    marginHorizontal: 5 
  },
  scoreHighlight: { 
    backgroundColor: 'rgba(16, 185, 129, 0.3)', 
    borderWidth: 2, 
    borderColor: '#10B981' 
  },
  playerName: { 
    color: '#FFF', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  scoreContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  playerScore: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginTop: 4 
  },
  scoreAnimation: { 
    color: '#10B981', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 4 
  },
  questionContainer: { 
    backgroundColor: 'rgba(0,0,0,0.2)', 
    padding: 20, 
    marginHorizontal: 20, 
    borderRadius: 12, 
    minHeight: 120, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  questionText: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    lineHeight: 30 
  },
  answersContainer: { 
    marginTop: 20, 
    paddingHorizontal: 20 
  },
  answerButton: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 10, 
    borderWidth: 2, 
    borderColor: 'transparent' 
  },
  answerText: { 
    color: '#FFF', 
    fontSize: 18 
  },
  selectedAnswer: { 
    borderColor: '#3B82F6', 
    backgroundColor: 'rgba(59, 130, 246, 0.3)' 
  },
  correctAnswer: { 
    borderColor: '#10B981', 
    backgroundColor: 'rgba(16, 185, 129, 0.4)' 
  },
  wrongAnswer: { 
    borderColor: '#EF4444', 
    backgroundColor: 'rgba(239, 68, 68, 0.4)' 
  },
  disabledAnswer: { 
    opacity: 0.6,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: 'transparent'
  },
  feedbackContainer: { 
    marginTop: 20, 
    paddingHorizontal: 20, 
    alignItems: 'center' 
  },
  feedbackText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  correctText: { 
    color: '#34D399' // Brighter green
  },
  incorrectText: { 
    color: '#F87171' // Brighter red
  }
});