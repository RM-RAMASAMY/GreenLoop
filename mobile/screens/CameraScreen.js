import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';

export default function CameraScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const cameraRef = useRef(null);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.text}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // REPLACE WITH YOUR COMPUTER'S IP
    const API_URL = 'http://10.0.2.2:3001';

    const takePicture = async () => {
        if (cameraRef.current) {
            const photoData = await cameraRef.current.takePictureAsync();
            setPhoto(photoData);
        }
    };

    const uploadPhoto = async () => {
        try {
            // Get location
            let location = await Location.getCurrentPositionAsync({});

            // Log to backend
            await fetch(`${API_URL}/api/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user1',
                    actionType: 'PLANT',
                    details: {
                        plantName: 'My New Plant',
                        location: location.coords
                    }
                })
            });

            alert('Plant logged! +50 EcoXP');
            navigation.navigate('Home');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Check server connection.');
        }
    };

    const retakePicture = () => {
        setPhoto(null);
    };

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo.uri }} style={styles.preview} />
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.button} onPress={retakePicture}>
                        <Text style={styles.text}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.confirm]} onPress={uploadPhoto}>
                        <Text style={styles.text}>Upload & Earn XP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="back" ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                        <View style={styles.innerBtn} />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    camera: { flex: 1 },
    buttonContainer: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent', margin: 64, justifyContent: 'center', alignItems: 'flex-end' },
    button: { flex: 1, alignSelf: 'flex-end', alignItems: 'center', padding: 10, backgroundColor: '#fff', margin: 10, borderRadius: 5 },
    confirm: { backgroundColor: '#4CAF50' },
    text: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    innerBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },
    preview: { flex: 1, width: '100%' },
    controls: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: 'black' }
});
