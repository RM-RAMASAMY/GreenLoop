import React, { useState, useEffect, useRef } from 'react';
import Map, { NavigationControl, Marker, Popup } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function MapPage() {
    const [viewState, setViewState] = useState({
        longitude: -122.4324,
        latitude: 37.78825,
        zoom: 14,
        pitch: 60, // Isometric view
        bearing: -20
    });
    const [popupInfo, setPopupInfo] = useState(null);

    // Mock data
    const pins = [
        { id: 1, lat: 37.78825, lng: -122.4324, title: 'My Basil', desc: 'Planted 2 days ago' },
        { id: 2, lat: 37.78925, lng: -122.4344, title: 'Community Garden', desc: 'Maintained by GreenLoop' }
    ];

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setViewState(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }));
            },
            (err) => console.error(err)
        );
    }, []);

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Conservation Map</h1>
                    <p className="text-muted-foreground">Explore green initiatives in your community in 3D.</p>
                </div>
                <div className="space-x-2">
                    <Button variant="outline" onClick={() => setViewState(v => ({ ...v, bearing: v.bearing + 90 }))}>
                        Rotate
                    </Button>
                    <Button onClick={() => setViewState(v => ({ ...v, pitch: v.pitch === 60 ? 0 : 60 }))}>
                        Toggle 3D
                    </Button>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden relative min-h-[500px] border-none shadow-md">
                <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="https://demotiles.maplibre.org/style.json" // Free sample style
                    mapLib={maplibregl}
                >
                    <NavigationControl position="top-right" />

                    {pins.map(pin => (
                        <Marker
                            key={pin.id}
                            longitude={pin.lng}
                            latitude={pin.lat}
                            anchor="bottom"
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                setPopupInfo(pin);
                            }}
                        >
                            <div className="cursor-pointer text-4xl hover:scale-110 transition-transform">
                                🌱
                            </div>
                        </Marker>
                    ))}

                    {popupInfo && (
                        <Popup
                            anchor="top"
                            longitude={popupInfo.lng}
                            latitude={popupInfo.lat}
                            onClose={() => setPopupInfo(null)}
                        >
                            <div className="p-2">
                                <strong className="block text-lg">{popupInfo.title}</strong>
                                <p className="text-sm text-gray-600">{popupInfo.desc}</p>
                            </div>
                        </Popup>
                    )}
                </Map>

                {/* Floating Controls Overlay */}
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg border border-border">
                    <h3 className="font-semibold mb-2">Filters</h3>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center space-x-2 text-sm cursor-pointer">
                            <input type="checkbox" defaultChecked className="accent-primary" />
                            <span>My Plants</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm cursor-pointer">
                            <input type="checkbox" defaultChecked className="accent-primary" />
                            <span>Community</span>
                        </label>
                    </div>
                </div>
            </Card>
        </div>
    );
}
