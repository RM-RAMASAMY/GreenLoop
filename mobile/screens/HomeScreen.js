import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
    const [user, setUser] = useState({
        name: 'Loading...',
        level: '...',
        xp: 0,
        nextLevelXp: 5000
    });

    // REPLACE WITH YOUR COMPUTER'S IP IF ON PHYSICAL DEVICE
    // ANDROID EMULATOR USES 10.0.2.2
    const API_URL = 'http://10.0.2.2:3001';

    const fetchUserData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/user/user1`);
            const data = await response.json();
            setUser({
                name: data.name,
                level: data.level,
                xp: data.totalXP,
                nextLevelXp: 5000 // Simplified logic
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        fetchUserData();
        const interval = setInterval(fetchUserData, 5000); // Poll every 5s for updates
        return () => clearInterval(interval);
    }, []);

    const progress = Math.min((user.xp / user.nextLevelXp) * 100, 100);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.header}
            >
                <Text style={styles.greeting}>Welcome back, {user.name}!</Text>
                <Text style={styles.level}>Level: {user.level} 🌿</Text>

                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.xpText}>{user.xp} / {user.nextLevelXp} EcoXP</Text>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Today's Missions</Text>

                {/* Mission Cards */}
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Camera')}>
                    <Text style={styles.cardTitle}>📸 Plant a Seed</Text>
                    <Text style={styles.cardDesc}>+50 XP • Log a new plant</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card}>
                    <Text style={styles.cardTitle}>🚶 Walk 1km</Text>
                    <Text style={styles.cardDesc}>+30 XP • Save carbon</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card}>
                    <Text style={styles.cardTitle}>♻️ Recycle</Text>
                    <Text style={styles.cardDesc}>+10 XP • Keep it clean</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 20, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    level: { fontSize: 18, color: '#e0e0e0', marginTop: 5 },
    progressBarContainer: { height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 5, marginTop: 15 },
    progressBar: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 5 },
    xpText: { color: 'white', marginTop: 5, fontSize: 12, textAlign: 'right' },
    content: { padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
    cardDesc: { fontSize: 14, color: '#666', marginTop: 2 }
});
