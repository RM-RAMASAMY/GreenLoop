import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapPage() {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
            (err) => console.error(err)
        );
    }, []);

    const plants = [
        { id: 1, lat: 37.78825, lng: -122.4324, title: 'My Basil', desc: 'Planted 2 days ago' },
        { id: 2, lat: 37.78925, lng: -122.4344, title: 'Community Garden', desc: 'Maintained by GreenLoop' }
    ];

    if (!position) return <div style={{ padding: '2rem' }}>Locating...</div>;

    return (
        <div>
            <div className="header">
                <h1>Conservation Map</h1>
                <p>Explore green initiatives in your community.</p>
            </div>

            <div className="card" style={{ padding: 0, height: 'calc(100vh - 12rem)', overflow: 'hidden', position: 'relative' }}>
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}>
                        <Popup>You are here!</Popup>
                    </Marker>
                    {plants.map(p => (
                        <Marker key={p.id} position={[p.lat, p.lng]}>
                            <Popup>
                                <strong>{p.title}</strong><br />{p.desc}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Floating Controls Overlay */}
                <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, background: 'white', padding: '10px', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Filters</div>
                    <div style={{ fontSize: '0.875rem', marginTop: 5 }}>✅ My Plants</div>
                    <div style={{ fontSize: '0.875rem', marginTop: 5 }}>✅ Community</div>
                </div>
            </div>
        </div>
    );
}
