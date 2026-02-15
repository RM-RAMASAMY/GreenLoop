import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const LeaderboardTab = ({ title, active, onPress }) => (
    <TouchableOpacity
        style={[styles.tab, active && styles.activeTab]}
        onPress={onPress}
    >
        <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
);

export default function LeaderboardScreen() {
    const [scope, setScope] = useState('Neighborhood'); // Neighborhood, Campus, Company

    const data = [
        { id: '1', rank: 1, name: 'NeighborNed', xp: 1500 },
        { id: '2', rank: 2, name: 'EcoWarrior (You)', xp: 1250 },
        { id: '3', rank: 3, name: 'SallySustainable', xp: 900 },
        { id: '4', rank: 4, name: 'GreenGary', xp: 850 },
    ];

    const renderItem = ({ item }) => (
        <View style={[styles.row, item.name.includes('(You)') && styles.highlightRow]}>
            <Text style={styles.rank}>#{item.rank}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.xp}>{item.xp} XP</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Leaderboards 🏆</Text>

            <View style={styles.tabs}>
                <LeaderboardTab title="Neighborhood" active={scope === 'Neighborhood'} onPress={() => setScope('Neighborhood')} />
                <LeaderboardTab title="Campus" active={scope === 'Campus'} onPress={() => setScope('Campus')} />
                <LeaderboardTab title="Company" active={scope === 'Company'} onPress={() => setScope('Company')} />
            </View>

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', paddingTop: 50 },
    header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2E7D32' },
    tabs: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginHorizontal: 5, backgroundColor: '#e0e0e0' },
    activeTab: { backgroundColor: '#4CAF50' },
    tabText: { color: '#666' },
    activeTabText: { color: 'white', fontWeight: 'bold' },
    list: { paddingHorizontal: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 8, alignItems: 'center' },
    highlightRow: { backgroundColor: '#e8f5e9', borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
    rank: { fontSize: 18, fontWeight: 'bold', width: 40, color: '#333' },
    name: { flex: 1, fontSize: 16, color: '#333' },
    xp: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' }
});
