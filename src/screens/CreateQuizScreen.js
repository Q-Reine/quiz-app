import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function CreateQuizScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
                if (response.data.length > 0) {
                    setSelectedCategory(response.data[0].id);
                }
            } catch (error) {
                showToast('Error', 'Could not fetch categories.', 'error');
            }
        };
        fetchCategories();
    }, []);

    const handleGenerateAI = async () => {
        if (!topic.trim()) {
            Alert.alert('Topic Required', 'Please enter a topic for the AI to generate a quiz.');
            return;
        }
        setLoadingAI(true);
        try {
            const response = await api.post('/ai/generate-quiz', { topic, numQuestions: 5 });
            const { questions: aiQuestions, suggestedCategory: aiCategoryName } = response.data;
            setQuestions(aiQuestions);
            
            const suggestedCat = categories.find(cat => cat.name.toLowerCase() === aiCategoryName.toLowerCase());
            if (suggestedCat) {
                setSelectedCategory(suggestedCat.id);
            }
            
            setTitle(topic);
            showToast('Success', 'AI generated 5 questions for you!', 'success');
        } catch (error) {
            showToast('AI Error', 'Failed to generate quiz with AI.', 'error');
        } finally {
            setLoadingAI(false);
        }
    };

    const handleSaveQuiz = async () => {
        if (!title.trim() || questions.length === 0 || !selectedCategory) {
            Alert.alert('Incomplete Quiz', 'Please ensure you have a title, at least one question, and a category selected.');
            return;
        }
        setLoadingSave(true);
        try {
            const category = categories.find(cat => cat.id === selectedCategory);

            // ========================= THE FIX IS HERE =========================
            // Sanitize the questions array to ensure each question has one correct answer.
            // This protects against bad data from the AI.
            const sanitizedQuestions = questions.map(q => {
                // Check if the AI already provided a correct answer for this question
                const hasCorrectAnswer = q.options.some(opt => opt.isCorrect === true);

                // If a correct answer is already set, or there are no options, return the question as is.
                if (hasCorrectAnswer || !q.options || q.options.length === 0) {
                    return q;
                }

                // **IF NOT**: Default to making the FIRST option the correct one.
                return {
                    ...q, // Keep the question text and other properties
                    options: q.options.map((opt, index) => ({
                        text: opt.text, // Keep the option text
                        isCorrect: index === 0 // Set isCorrect: true for the first option, false for all others
                    }))
                };
            });
            // ======================= END OF THE FIX =======================


            const payload = {
                title,
                categoryName: category.name,
                questions: sanitizedQuestions, // <-- Use the newly sanitized questions array
            };

            await api.post('/quizzes', payload);
            showToast('Quiz Saved!', 'Your new quiz has been created.', 'success');
            navigation.goBack();
        } catch (error) {
            showToast('Save Error', 'Could not save the quiz.', 'error');
        } finally {
            setLoadingSave(false);
        }
    };

    return (
        <LinearGradient colors={["#1F2937", "#111827"]} style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 50 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create New Quiz</Text>
                </View>

                <Animatable.View animation="fadeInUp" style={styles.formContainer}>
                    <Text style={styles.label}>Quiz Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., The Solar System"
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <View style={styles.aiSection}>
                        <Text style={styles.label}>Generate with AI</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter a topic..."
                            placeholderTextColor="#9CA3AF"
                            value={topic}
                            onChangeText={setTopic}
                        />
                        <TouchableOpacity style={styles.aiButton} onPress={handleGenerateAI} disabled={loadingAI}>
                            {loadingAI ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.aiButtonText}>✨ Generate Questions & Category</Text>
                            )}
                        </TouchableOpacity>
                    </View>

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
                        {questions.map((q, index) => (
                            <View key={index} style={styles.questionCard}>
                                <Text style={styles.questionText}>{index + 1}. {q.text}</Text>
                                {/* This map function now correctly displays the checkmark based on our sanitized data */}
                                {q.options && q.options.map((opt, optIndex) => (
                                    <Text key={optIndex} style={[styles.optionText, opt.isCorrect && styles.correctOption]}>
                                        {String.fromCharCode(65 + optIndex)}) {opt.text} {opt.isCorrect && '✔'}
                                    </Text>
                                ))}
                            </View>
                        ))}
                    </View>
                </Animatable.View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveQuiz} disabled={loadingSave}>
                    {loadingSave ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Quiz</Text>
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
    backButton: { padding: 8 },
    headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginLeft: 16 },
    formContainer: { paddingHorizontal: 20 },
    label: { color: '#D1D5DB', fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#374151', color: '#FFF', borderRadius: 8, padding: 12, fontSize: 16 },
    aiSection: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginVertical: 20 },
    aiButton: { backgroundColor: '#8B5CF6', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 12 },
    aiButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    pickerContainer: { backgroundColor: '#374151', borderRadius: 8, },
    picker: { color: '#FFF' },
    pickerItem: { color: '#FFF', backgroundColor: '#374151' },
    questionsList: { marginTop: 20 },
    questionCard: { backgroundColor: '#374151', borderRadius: 8, padding: 12, marginBottom: 10 },
    questionText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    optionText: { color: '#D1D5DB', fontSize: 14, marginLeft: 8 },
    correctOption: { color: '#10B981', fontWeight: 'bold' },
    saveButton: { margin: 20, backgroundColor: '#10B981', borderRadius: 8, padding: 16, alignItems: 'center' },
    saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});