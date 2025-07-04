// screens/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useNavigation } from '@react-navigation/native';

export default function EditProfileScreen() {
    const navigation = useNavigation();
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/users/me');
                setFormData({
                    name: response.data.name,
                    email: response.data.email
                });
                setUserId(response.data.id);
            } catch (error) {
                showToast('Error', 'Could not load your profile data.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            Alert.alert("Invalid Input", "Name and email cannot be empty.");
            return;
        }
        setIsSaving(true);
        try {
            await api.patch(`/users/${userId}`, formData);
            showToast('Success', 'Profile updated!', 'success');
            navigation.goBack(); 
        } catch (error) {
            const message = error.response?.data?.message || "Failed to update profile.";
            showToast('Error', message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <LinearGradient colors={["#1F2937", "#111827"]} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFF" />
            </LinearGradient>
        );
    }
    
    return (
        <LinearGradient colors={["#1F2937", "#111827"]} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    placeholder="Enter your email address"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, marginBottom: 30 },
    backButton: { padding: 8, marginRight: 16 },
    headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    form: { paddingHorizontal: 20 },
    label: { color: '#D1D5DB', fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#374151', color: '#FFF', borderRadius: 8, padding: 14, fontSize: 16 },
    saveButton: { margin: 20, backgroundColor: '#10B981', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 'auto' },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});