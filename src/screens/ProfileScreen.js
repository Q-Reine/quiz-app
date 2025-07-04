// screens/ProfileScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { logout } = useAuth();
    const { showToast } = useToast();

    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfileData = useCallback(async () => {
        try {
            const response = await api.get('/users/me');
            setProfileData(response.data);
        } catch (error) {
            showToast('Error', 'Could not load your profile.', 'error');
            
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchProfileData();
        }, [fetchProfileData])
    );

    const handleLogout = () => {
        logout();
        navigation.navigate("Welcome");
    };

    if (isLoading || !profileData) {
        return (
            <LinearGradient colors={["#1F2937", "#111827"]} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFF" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={["#1F2937", "#111827"]} style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Icon name="logout" size={24} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{profileData.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.profileName}>{profileData.name}</Text>
                    <Text style={styles.profileEmail}>{profileData.email}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statEmoji}>💰</Text>
                        <Text style={styles.statValue}>{profileData.coins}</Text>
                        <Text style={styles.statLabel}>Coins Earned</Text>
                    </View>
                   
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
                        <Icon name="edit" size={24} color="#3B82F6" />
                        <Text style={styles.menuItemText}>Edit Profile</Text>
                        <Icon name="chevron-right" size={24} color="#6B7280" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyQuizzes')}>
                        <Icon name="list-alt" size={24} color="#10B981" />
                        <Text style={styles.menuItemText}>My Quizzes</Text>
                        <Icon name="chevron-right" size={24} color="#6B7280" />
                    </TouchableOpacity>

                     <TouchableOpacity style={styles.menuItem}>
                        <Icon name="settings" size={24} color="#6B7280" />
                        <Text style={styles.menuItemText}>Settings</Text>
                        <Icon name="chevron-right" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollView: { paddingTop: 60 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
    profileCard: {
        alignItems: 'center',
        marginHorizontal: 20,
        padding: 20,
        backgroundColor: '#374151',
        borderRadius: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
    profileName: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    profileEmail: { color: '#9CA3AF', fontSize: 16, marginTop: 4 },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#374151',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statEmoji: { fontSize: 24, marginBottom: 8 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
    menuContainer: {
        marginHorizontal: 20,
        marginTop: 30,
        backgroundColor: '#374151',
        borderRadius: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#4B5563',
    },
    menuItemText: {
        color: '#FFF',
        fontSize: 16,
        marginLeft: 16,
        flex: 1,
    },
});