// src/screens/EditQuizScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function EditQuizScreen({ route, navigation }) {
    const { quiz } = route.params; // Get the full quiz object to edit

    const [title, setTitle] = useState(quiz.title);
    const [questions, setQuestions] = useState(quiz.questions);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(quiz.categoryId);
    const [loadingSave, setLoadingSave] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (error) {
                showToast('Error', 'Could not fetch categories.', 'error');
            }
        };
        fetchCategories();
    }, []);

    const handleSaveChanges = async () => {
        if (!title.trim() || questions.length === 0 || !selectedCategory) {
            Alert.alert('Incomplete Quiz', 'Please ensure you have a title, at least one question, and a category selected.');
            return;
        }
        setLoadingSave(true);
        try {
            const category = categories.find(cat => cat.id === selectedCategory);
            const payload = {
                title,
                categoryName: category.name,
                questions,
            };
            await api.put(`/quizzes/${quiz.id}`, payload);
            showToast('Quiz Updated!', 'Your changes have been saved.', 'success');
            navigation.goBack();
        } catch (error) {
            showToast('Save Error', 'Could not update the quiz.', 'error');
        } finally {
            setLoadingSave(false);
        }
    };
    
    // The UI is nearly identical to CreateQuizScreen, just with pre-filled state
    return (
        <LinearGradient colors={["#1F2937", "#111827"]} style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 50 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Quiz</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Quiz Title</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                    />
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedCategory}
                            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                            style={styles.picker}
                            itemStyle={styles.pickerItem}
                        >
                            {categories.map(cat => (
                                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                            ))}
                        </Picker>
                    </View>
                    <View style={styles.questionsList}>
                        <Text style={styles.label}>Questions ({questions.length})</Text>
                        {/* Note: In a real app, you'd have a UI to add/edit/remove individual questions here */}
                        <Text style={styles.editInfo}>Editing individual questions is not yet implemented. Save changes to title and category.</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={loadingSave}>
                    {loadingSave ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { paddingTop: 50 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    backButton: { padding: 8, marginRight: 16 },
    headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    formContainer: { paddingHorizontal: 20 },
    label: { color: '#D1D5DB', fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#374151', color: '#FFF', borderRadius: 8, padding: 12, fontSize: 16 },
    pickerContainer: { backgroundColor: '#374151', borderRadius: 8, },
    picker: { color: '#FFF' },
    pickerItem: { color: '#FFF', backgroundColor: '#374151' },
    questionsList: { marginTop: 20 },
    editInfo: { color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', margin: 20 },
    saveButton: { margin: 20, backgroundColor: '#8B5CF6', borderRadius: 8, padding: 16, alignItems: 'center' },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});