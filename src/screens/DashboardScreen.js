import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useGame } from '../contexts/GameContext';

export default function DashboardScreen() {
    const navigation = useNavigation();
    const { user, logout, loading: authLoading } = useAuth();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const { leaveGame } = useGame();

    const [featuredCategories, setFeaturedCategories] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        leaveGame(); 

        const fetchFeatured = async () => {
            setLoading(true);
            try {
                const response = await api.get('/categories');
                setFeaturedCategories(response.data.slice(0, 4));
            } catch (error) {
                console.error("Fetch featured categories error:", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchFeatured();
    }, [user]);

    
    useEffect(() => {
        if (!socket || !user) {
            return; 
        }

        const handleSearching = () => setIsSearching(true);
        const handleMatchFound = (data) => {
            setIsSearching(false);
            showToast('Match Found!', 'Joining game lobby...', 'success');
            socket.emit('player_join', { pin: data.pin, nickname: user.name }, (response) => {
                if (response.success) {
                    navigation.navigate('GameLobby', { isHost: false });
                } else {
                    showToast('Join Error', response.message || 'Could not join the match.', 'error');
                }
            });
        };
        const handleMatchError = ({ message }) => {
            setIsSearching(false);
            showToast('Matchmaking Error', message, 'error');
        };

        socket.on('searching_for_match', handleSearching);
        socket.on('match_found', handleMatchFound);
        socket.on('match_error', handleMatchError);

        
        return () => {
           
            if (socket) {
                socket.off('searching_for_match', handleSearching);
                socket.off('match_found', handleMatchFound);
                socket.off('match_error', handleMatchError);
            }
        };
    }, [socket, user]); 

    const handleFindMatch = () => {
        if (socket && !isSearching) {
            socket.emit('find_match');
        }
    };
    
    const handleCancelSearch = () => {
        if (socket && isSearching) {
            socket.emit('cancel_matchmaking');
            setIsSearching(false);
        }
    };

    const handleCategoryPress = (category) => navigation.navigate('QuizList', { categoryId: category.id, categoryName: category.name });

    if (authLoading) {
        return <LinearGradient colors={["#1F2937", "#111827"]} style={styles.loadingContainer}><ActivityIndicator size="large" color="#8B5CF6" /></LinearGradient>;
    }
    
    if (!user) return null;

    return (
        <LinearGradient colors={["#1F2937", "#111827"]} style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
                    <Text style={styles.eloText}>🏆 {user.eloRating} ELO</Text>
                </View>
                <TouchableOpacity onPress={logout}>
                    <Icon name="logout" size={24} color="#9CA3AF" />
                </TouchableOpacity>
            </View>

            <View style={styles.mainActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleFindMatch}>
                    <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.actionGradient}>
                        <Icon name="bolt" size={24} color="#FFF" />
                        <Text style={styles.actionText}>Quick Match</Text>
                    </LinearGradient>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('QuickPlay')}>
                    <LinearGradient colors={['#3B82F6', '#22D3EE']} style={styles.actionGradient}>
                        <Icon name="login" size={24} color="#FFF" />
                        <Text style={styles.actionText}>Join with PIN</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.createQuizButton} onPress={() => navigation.navigate('CreateQuiz')}>
                <Icon name="add-circle" size={24} color="#FFF" />
                <Text style={styles.createQuizButtonText}>Create a New Quiz</Text>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explore Categories</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>
            
            {loading ? (
                <ActivityIndicator color="#FFF" style={{ marginTop: 20 }}/>
            ) : (
                <View style={styles.featuredContainer}>
                    {featuredCategories.map(cat => (
                        <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => handleCategoryPress(cat)}>
                            <Text style={styles.categoryText}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {isSearching && (
                 <View style={styles.searchingOverlay}>
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={styles.searchingText}>Searching for an opponent...</Text>
                    <TouchableOpacity onPress={handleCancelSearch}>
                        <Text style={styles.cancelSearchText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    welcomeText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    eloText: { color: '#F59E0B', fontSize: 16, marginTop: 4 },
    mainActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 20, },
    actionButton: { flex: 1, marginHorizontal: 8 },
    actionGradient: { borderRadius: 12, paddingVertical: 16, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', elevation: 5 },
    actionText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    createQuizButton: { marginHorizontal: 20, marginBottom: 30, backgroundColor: '#10B981', borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    createQuizButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15, },
    sectionTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    viewAllText: { color: '#8B5CF6', fontSize: 14, fontWeight: 'bold' },
    featuredContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15 },
    categoryCard: { width: '45%', margin: '2.5%', aspectRatio: 1.5, backgroundColor: '#374151', borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 10, elevation: 3 },
    categoryText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    searchingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    searchingText: { color: '#FFF', marginTop: 20, fontSize: 18 },
    cancelSearchText: { color: '#F87171', marginTop: 20, fontSize: 16, textDecorationLine: 'underline' }
});