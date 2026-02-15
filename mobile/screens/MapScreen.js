import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    const dummyPlants = [
        { id: 1, lat: 37.78825, lng: -122.4324, title: 'My Basil', desc: 'Planted 2 days ago' },
        { id: 2, lat: 37.78925, lng: -122.4344, title: 'Community Garden', desc: 'Maintained by GreenLoop' }
    ];

    return (
        <View style={styles.container}>
            {location ? (
                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    showsUserLocation={true}
                >
                    {dummyPlants.map(plant => (
                        <Marker
                            key={plant.id}
                            coordinate={{ latitude: plant.lat, longitude: plant.lng }}
                            title={plant.title}
                            description={plant.desc}
                            pinColor="green"
                        />
                    ))}
                </MapView>
            ) : (
                <View style={styles.loading}>
                    <Text>{errorMsg || 'Locating...'}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
