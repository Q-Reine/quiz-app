import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

// Pre-defined colors and icons for categories for a better look
const categoryStyles = {
    'General Knowledge': { icon: 'psychology', colors: ['#8B5CF6', '#EC4899'] },
    'Technology': { icon: 'computer', colors: ['#3B82F6', '#22D3EE'] },
    'Science': { icon: 'science', colors: ['#10B981', '#6EE7B7'] },
    'History': { icon: 'account-balance', colors: ['#F59E0B', '#FBBF24'] },
    'Geography': { icon: 'public', colors: ['#22C55E', '#4ADE80'] },
    'Movies': { icon: 'theaters', colors: ['#EF4444', '#F87171'] },
    'Music': { icon: 'music-note', colors: ['#D946EF', '#E879F9'] },
    'Art': { icon: 'palette', colors: ['#6366F1', '#818CF8'] },
    'Default': { icon: 'category', colors: ['#6B7280', '#9CA3AF'] },
};

const CategoryCard = ({ item, onPress }) => {
    const style = categoryStyles[item.name] || categoryStyles['Default'];
    return (
        <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
            <LinearGradient colors={style.colors} style={styles.card}>
                <Icon name={style.icon} size={32} color="#FFF" />
                <Text style={styles.cardText}>{item.name}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default function CategoriesScreen({ navigation }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            showToast('Error', "Couldn't fetch categories.", 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryPress = (category) => {
        navigation.navigate('QuizList', { categoryId: category.id, categoryName: category.name });
    };

    if (loading) {
        return <LinearGradient colors={["#111827", "#1F2937"]} style={styles.loadingContainer}><ActivityIndicator size="large" color="#8B5CF6" /></LinearGradient>;
    }

    return (
        <LinearGradient colors={["#111827", "#1F2937"]} style={styles.container}>
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Categories</Text>
            </View>
            <FlatList
                data={categories}
                renderItem={({ item }) => <CategoryCard item={item} onPress={() => handleCategoryPress(item)} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCategories} tintColor="#FFF" />}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    backButton: { padding: 8, marginRight: 16 },
    headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    listContainer: { paddingHorizontal: 10, paddingBottom: 20 },
    cardContainer: { flex: 1, margin: 10 },
    card: { height: 150, borderRadius: 16, justifyContent: 'center', alignItems: 'center', padding: 16 },
    cardText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
});