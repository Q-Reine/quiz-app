// screens/MyQuizzesScreen.js
import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api'; 
import { useToast } from '../contexts/ToastContext'; 
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function MyQuizzesScreen() {
    const navigation = useNavigation();
    const { showToast } = useToast();

    const [myQuizzes, setMyQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    
    const fetchMyQuizzes = useCallback(async () => {
        try {
            
            const [quizzesResponse, profileResponse] = await Promise.all([
                api.get('/quizzes'),
                api.get('/users/me')
            ]);
            
            const allVisibleQuizzes = quizzesResponse.data;
            const myId = profileResponse.data.id;
            
            
            const userCreatedQuizzes = allVisibleQuizzes.filter(quiz => quiz.creatorId === myId);
            setMyQuizzes(userCreatedQuizzes);

        } catch (error) {
            showToast('Error', 'Could not load your created quizzes.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    
    useFocusEffect(useCallback(() => {
        setIsLoading(true); 
        fetchMyQuizzes();
    }, [fetchMyQuizzes]));

   
    const handleRequestPublic = (quizId) => {
        Alert.alert(
            "Submit for Approval",
            "Are you sure you want to submit this quiz for admin approval? It will become visible to other users if approved.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Yes, Submit", 
                    onPress: async () => {
                        try {
                            await api.patch(`/quizzes/${quizId}/request-public`);
                            showToast('Success', 'Request sent to admin for approval.', 'success');
                            fetchMyQuizzes(); 
                        } catch (error) {
                            showToast('Error', 'Could not send request.', 'error');
                        }
                    }
                }
            ]
        );
    };
    
   
    const handleQuizPress = (quizId) => {
        
        navigation.navigate('QuizDetail', { quizId });
    };

 
    const renderQuizItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.quizCard} 
            onPress={() => handleQuizPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.quizInfo}>
                <Text style={styles.quizTitle} numberOfLines={1}>{item.title}</Text>
                
                {/* Displaying the category name */}
                <Text style={styles.quizCategory}>
                    Category: {item.category?.name || 'Uncategorized'}
                </Text>

                {/* Displaying the quiz status with dynamic styling */}
                <Text style={styles.quizStatus(item.status)}>
                    Status: {item.status.replace('_', ' ')}
                </Text>
            </View>
            <View style={styles.quizActions}>
                {/* The "Request Public" button only appears for private quizzes */}
                {item.status === 'PRIVATE' && (
                    <TouchableOpacity 
                        style={styles.requestButton} 
                        
                        onPress={(e) => {
                            e.stopPropagation(); 
                            handleRequestPublic(item.id);
                        }}
                    >
                        <Text style={styles.requestButtonText}>Request Public</Text>
                    </TouchableOpacity>
                )}
                <Icon name="chevron-right" size={24} color="#6B7280" />
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={["#1F2937", "#111827"]} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Created Quizzes</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 50 }}/>
            ) : (
                <FlatList
                    data={myQuizzes}
                    renderItem={renderQuizItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>You haven't created any quizzes yet.</Text>
                            <Text style={styles.emptySubText}>Tap the 'Create' button to get started!</Text>
                        </View>
                    }
                />
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
    },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: 60, 
        paddingBottom: 20,
    },
    backButton: { 
        padding: 8, 
        marginRight: 16,
    },
    headerTitle: { 
        color: '#FFF', 
        fontSize: 22, 
        fontWeight: 'bold',
    },
    listContainer: { 
        paddingHorizontal: 20, 
        paddingBottom: 40,
    },
    quizCard: {
        backgroundColor: '#374151',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quizInfo: { 
        flex: 1, 
        marginRight: 10,
    },
    quizTitle: { 
        color: '#FFF', 
        fontSize: 16, 
        fontWeight: 'bold',
    },
    quizCategory: {
        color: '#A1A1AA', 
        fontSize: 12,
        marginTop: 4,
    },
    quizStatus: (status) => ({
        color: status === 'PUBLIC' ? '#10B981' : (status === 'PENDING_APPROVAL' ? '#F59E0B' : '#9CA3AF'),
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
        textTransform: 'capitalize',
    }),
    quizActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    requestButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    requestButtonText: { 
        color: 'white', 
        fontSize: 12, 
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '40%',
    },
    emptyText: { 
        color: '#9CA3AF', 
        textAlign: 'center', 
        fontSize: 16, 
    },
    emptySubText: {
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 14,
        marginTop: 8,
    },
});