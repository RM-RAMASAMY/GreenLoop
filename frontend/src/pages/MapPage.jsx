import React, { useState, useEffect, useRef } from 'react';
import Map, { NavigationControl, Marker, Popup, Source, Layer, GeolocateControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Red Pin Icon SVG Component
const RedPin = () => (
    <svg
        viewBox="0 0 24 24"
        width="40"
        height="40"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-red-600 drop-shadow-lg filter"
        style={{ fill: '#ef4444', stroke: '#7f1d1d' }} // Tailwind red-500 fill, red-900 stroke
    >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="#fff" stroke="none"></circle>
    </svg>
);

export default function MapPage() {
    const [viewState, setViewState] = useState({
        longitude: -122.4194, // San Francisco
        latitude: 37.7749,
        zoom: 16,
        pitch: 60, // Isometric view
        bearing: -20
    });
    const [popupInfo, setPopupInfo] = useState(null);

    // Mock data with User Name and Plant Number
    const pins = [
        { id: 1, lat: 37.7749, lng: -122.4194, userName: 'EcoWarrior', plantNumber: 'Tree #142', title: 'City Hall Garden', desc: 'Maintained by GreenLoop' },
        { id: 2, lat: 37.7760, lng: -122.4220, userName: 'EcoWarrior', plantNumber: 'Bush #089', title: 'Community Patch', desc: 'Pruned yesterday' },
        { id: 3, lat: 37.7730, lng: -122.4210, userName: 'NatureLover', plantNumber: 'Flower #303', title: 'Urban Oases', desc: 'Guerrilla Gardening' },
        { id: 4, lat: 37.7755, lng: -122.4200, userName: 'EcoWarrior', plantNumber: 'Fern #021', title: 'My Balcony', desc: 'Watered today' }
    ];

    const USER_NAME = 'EcoWarrior';
    const myPins = pins.filter(pin => pin.userName === USER_NAME);

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

    const buildingLayer = {
        id: '3d-buildings',
        source: 'openmaptiles',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
            'fill-extrusion-color': '#e5e7eb', // lighter gray
            'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'render_height']
            ],
            'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'render_min_height']
            ],
            'fill-extrusion-opacity': 0.8
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Conservation Map</h1>
                    <p className="text-muted-foreground">Explore local impact in augmented 3D.</p>
                </div>
                <div className="space-x-2">
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
                    mapStyle="https://tiles.openfreemap.org/styles/liberty"
                    mapLib={maplibregl}
                >
                    <GeolocateControl position="top-right" />
                    <NavigationControl position="top-right" />

                    <Layer {...buildingLayer} />

                    {myPins.map(pin => (
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
                            <div className="group relative flex flex-col items-center cursor-pointer hover:z-50">
                                {/* Persistent Callout for Augmented Feel */}
                                <div className="mb-1 bg-white/95 text-xs font-semibold px-2 py-1 rounded shadow-md border border-border whitespace-nowrap transform transition-all group-hover:scale-110">
                                    <span className="text-primary block">{pin.userName}</span>
                                    <span className="text-muted-foreground">{pin.plantNumber}</span>
                                </div>

                                {/* Red Pin Icon */}
                                <RedPin />
                            </div>
                        </Marker>
                    ))}

                    {popupInfo && (
                        <Popup
                            anchor="top"
                            longitude={popupInfo.lng}
                            latitude={popupInfo.lat}
                            onClose={() => setPopupInfo(null)}
                            offset={40}
                        >
                            <div className="p-2 min-w-[150px]">
                                <strong className="block text-lg font-bold">{popupInfo.title}</strong>
                                <div className="text-sm font-medium text-emerald-600 mb-1">{popupInfo.plantNumber}</div>
                                <p className="text-sm text-gray-600">{popupInfo.desc}</p>
                                <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
                                    Planted by {popupInfo.userName}
                                </div>
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
                        {/* 
                        <label className="flex items-center space-x-2 text-sm cursor-pointer opacity-50">
                            <input type="checkbox" disabled className="accent-primary" />
                            <span>Community (Hidden)</span>
                        </label> 
                        */}
                    </div>
                </div>
            </Card>
        </div>
    );
}
