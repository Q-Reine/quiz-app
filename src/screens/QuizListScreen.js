import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function QuizListScreen({ route }) {
    const navigation = useNavigation();
    const { categoryId, categoryName } = route.params;
    const { user } = useAuth(); // We still need the user to check for creator status
    const { showToast } = useToast();

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizzes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/quizzes?categoryId=${categoryId}`);
            setQuizzes(response.data);
        } catch (error) {
            showToast('Error', "Couldn't fetch quizzes for this category.", 'error');
        } finally {
            setLoading(false);
        }
    }, [categoryId]);

    useFocusEffect(fetchQuizzes);

    // --- THIS IS THE NAVIGATION LOGIC ---
    // This function will be called when a user taps on a quiz card.
    const handleQuizPress = (quizId) => {
        // We navigate to the 'QuizDetail' screen (as defined in your navigator)
        // and pass the `quizId` as a route parameter.
        navigation.navigate('QuizDetail', { quizId: quizId });
    };

    const renderQuizItem = ({ item }) => (
        // Make the entire card a TouchableOpacity
        <TouchableOpacity onPress={() => handleQuizPress(item.id)}>
            <View style={styles.quizCard}>
                <View style={styles.quizInfo}>
                    <Text style={styles.quizTitle}>{item.title}</Text>
                    <Text style={styles.quizCreator}>by {item.creator?.name || 'Unknown'}</Text>
                </View>
                {/* A simple arrow icon indicates it's tappable */}
                <Icon name="arrow-forward-ios" size={18} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={["#111827", "#1F2937"]} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName}</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#8B5CF6" style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={quizzes}
                    renderItem={renderQuizItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="search-off" size={64} color="#4B5563" />
                            <Text style={styles.emptyText}>No quizzes found in this category yet.</Text>
                            <Text style={styles.emptySubText}>Why not be the first to create one?</Text>
                        </View>
                    }
                />
            )}
            <TouchableOpacity style={styles.createFab} onPress={() => navigation.navigate('CreateQuiz')}>
                <Icon name="add" size={28} color="#FFF" />
                <Text style={styles.createFabText}>Create Quiz</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    backButton: { padding: 8, marginRight: 16 },
    headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
    quizCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#374151', padding: 16, borderRadius: 8, marginBottom: 10 },
    quizInfo: { flex: 1, marginRight: 10 },
    quizTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    quizCreator: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80, opacity: 0.8 },
    emptyText: { color: '#9CA3AF', fontSize: 18, marginTop: 16, textAlign: 'center' },
    emptySubText: { color: '#6B7280', fontSize: 14, marginTop: 8 },
    createFab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#10B981', borderRadius: 28, height: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
    createFabText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});