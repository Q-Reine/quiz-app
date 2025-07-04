import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function QuizDetailScreen({ route, navigation }) {
    const { quizId } = route.params;
    const { user } = useAuth();
    const { createGameSessionAPI } = useGame();
    const { isConnected } = useSocket();
    const { showToast } = useToast();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHosting, setIsHosting] = useState(false);

    useEffect(() => {
        const fetchQuizDetails = async () => {
            if (!quizId) {
                showToast("Error", "No Quiz ID was provided.", "error");
                navigation.goBack();
                return;
            }
            setLoading(true);
            try {
                const response = await api.get(`/quizzes/${quizId}`);
                setQuiz(response.data);
            } catch (error) {
                console.error("Failed to fetch quiz details:", error.response?.data || error);
                showToast("Error", "Could not load quiz details.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchQuizDetails();
    }, [quizId]);

   const handleStartGame = async () => {
    setIsHosting(true);
    try {
       
        const pin = await createGameSessionAPI(quiz.id);
        if (pin) {
            
            navigation.navigate('GameLobby', { 
                pin, 
                isHost: true, 
                nickname: user.name || user.username || 'Host' 
            });
        }
    } catch (error) {
        Alert.alert("Hosting Error", error.message || "Could not create a game session.");
    } finally {
        setIsHosting(false);
    }
};
    const handleDeleteQuiz = () => {
        Alert.alert(
            "Delete Quiz",
            `Are you sure you want to permanently delete "${quiz.title}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/quizzes/${quiz.id}`);
                            showToast("Success", "Quiz deleted successfully.", "success");
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete the quiz.");
                        }
                    }
                }
            ]
        );
    };

    const handleEditQuiz = () => {
        navigation.navigate('EditQuiz', { quiz });
    };

    const isCreator = user && quiz && user.id === quiz.creatorId;

    if (loading) {
        return (
            <LinearGradient colors={["#111827", "#1F2937"]} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </LinearGradient>
        );
    }

    if (!quiz) {
        return (
            <LinearGradient colors={["#111827", "#1F2937"]} style={styles.container}>
                <View style={styles.header}>
                     <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Quiz not found.</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={["#111827", "#1F2937"]} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{quiz.title}</Text>
                {isCreator && (
                    <View style={styles.creatorActions}>
                        <TouchableOpacity onPress={handleEditQuiz} style={styles.iconButton}>
                            <Icon name="edit" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteQuiz} style={styles.iconButton}>
                            <Icon name="delete" size={24} color="#F87171" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.detailsCard}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{quiz.category?.name || 'N/A'}</Text>
                    <Text style={styles.detailLabel}>Creator</Text>
                    <Text style={styles.detailValue}>{quiz.creator?.name || 'N/A'}</Text>
                    <Text style={styles.detailLabel}>Questions</Text>
                    <Text style={styles.detailValue}>{quiz.questions.length}</Text>
                </View>

                {quiz.questions.map((question, index) => (
                    <View key={question.id} style={styles.questionCard}>
                        <Text style={styles.questionText}>{index + 1}. {question.text}</Text>
                        {question.options.map((option, optIndex) => (
                            <View key={option.id} style={[styles.optionContainer, option.isCorrect && styles.correctOption]}>
                                <Text style={styles.optionText}>{String.fromCharCode(65 + optIndex)}) {option.text}</Text>
                                {option.isCorrect && <Icon name="check-circle" size={18} color="#10B981" />}
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
            
            {isCreator && (
                <TouchableOpacity
                    style={[styles.hostButton, (!isConnected || isHosting) && styles.disabledButton]}
                    onPress={handleStartGame}
                    disabled={!isConnected || isHosting}
                >
                    {isHosting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.hostButtonText}>
                            {isConnected ? 'Host This Game' : 'Connecting...'}
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#FFF', textAlign: 'center', fontSize: 18 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
    backButton: { padding: 8, marginRight: 12 },
    headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', flex: 1 },
    creatorActions: { flexDirection: 'row' },
    iconButton: { padding: 8, marginLeft: 8 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    detailsCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 20 },
    detailLabel: { color: '#9CA3AF', fontSize: 14, marginTop: 10 },
    detailValue: { color: '#FFF', fontSize: 16, fontWeight: '500' },
    questionCard: { backgroundColor: '#374151', padding: 16, borderRadius: 8, marginBottom: 12 },
    questionText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    optionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginVertical: 2 },
    optionText: { color: '#D1D5DB', fontSize: 14, flex: 1 },
    correctOption: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
    hostButton: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#10B981', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    hostButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#4B5563' },
});