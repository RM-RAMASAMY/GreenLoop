import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

const MissionItem = ({ icon, title, reward, onPress }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.info}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.reward}>{reward}</Text>
        </View>
        <Text style={styles.check}>✅</Text>
    </TouchableOpacity>
);

export default function MissionScreen() {
    const handleComplete = (mission) => {
        Alert.alert('Mission Completed!', `You earned ${mission.xp} XP for "${mission.title}"`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Daily Missions</Text>
            <ScrollView style={styles.list}>
                <MissionItem
                    icon="🚶"
                    title="Walk 1km"
                    reward="+30 XP"
                    onPress={() => handleComplete({ title: 'Walk 1km', xp: 30 })}
                />
                <MissionItem
                    icon="💧"
                    title="Refill Bottle"
                    reward="+10 XP"
                    onPress={() => handleComplete({ title: 'Refill Bottle', xp: 10 })}
                />
                <MissionItem
                    icon="🍂"
                    title="Compost Waste"
                    reward="+20 XP"
                    onPress={() => handleComplete({ title: 'Compost Waste', xp: 20 })}
                />
                <MissionItem
                    icon="🥗"
                    title="Meat-free Meal"
                    reward="+40 XP"
                    onPress={() => handleComplete({ title: 'Meat-free Meal', xp: 40 })}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50, paddingHorizontal: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    list: { flex: 1 },
    item: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10 },
    icon: { fontSize: 30, marginRight: 15 },
    info: { flex: 1 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    reward: { fontSize: 14, color: '#4CAF50' },
    check: { fontSize: 20, opacity: 0.3 }
});
