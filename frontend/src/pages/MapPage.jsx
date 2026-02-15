import React, { useState, useEffect, useRef } from 'react';
import Map, { NavigationControl, Marker, Popup, Source, Layer, GeolocateControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Car, Footprints, Bike, X, Navigation, Loader2 } from 'lucide-react';

// Plant Marker Component with Custom Premium SVGs
const PlantMarker = ({ type }) => {
    switch (type) {
        case 'tree':
            return (
                <div className="transform hover:scale-125 transition-transform duration-300 cursor-pointer drop-shadow-xl">
                    <svg width="48" height="48" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25 45L25 35" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="25" cy="25" r="18" fill="#10B981" stroke="#047857" strokeWidth="2" />
                        <circle cx="20" cy="20" r="5" fill="#34D399" fillOpacity="0.5" />
                        <circle cx="30" cy="28" r="4" fill="#065F46" fillOpacity="0.3" />
                    </svg>
                </div>
            );
        case 'flower':
            return (
                <div className="transform hover:scale-125 transition-transform duration-300 cursor-pointer drop-shadow-xl">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 40V30" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
                        <path d="M20 20L10 10C8 8 5 12 8 15L20 20Z" fill="#EC4899" stroke="#BE185D" strokeWidth="1" />
                        <path d="M20 20L30 10C32 8 35 12 32 15L20 20Z" fill="#EC4899" stroke="#BE185D" strokeWidth="1" />
                        <path d="M20 20L10 30C8 32 5 28 8 25L20 20Z" fill="#EC4899" stroke="#BE185D" strokeWidth="1" />
                        <path d="M20 20L30 30C32 32 35 28 32 25L20 20Z" fill="#EC4899" stroke="#BE185D" strokeWidth="1" />
                        <circle cx="20" cy="20" r="4" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
                    </svg>
                </div>
            );
        case 'bush':
            return (
                <div className="transform hover:scale-125 transition-transform duration-300 cursor-pointer drop-shadow-xl">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 32C0 30 0 15 10 12C12 5 28 5 30 12C40 15 40 30 32 32H8Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2" />
                        <path d="M12 25C12 25 15 20 20 25C25 30 28 25 28 25" stroke="#365314" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
                    </svg>
                </div>
            );
        case 'fern':
        default:
            return (
                <div className="transform hover:scale-125 transition-transform duration-300 cursor-pointer drop-shadow-xl">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 40V10" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
                        <path d="M20 30L5 20" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
                        <path d="M20 30L35 20" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
                        <path d="M20 20L8 10" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
                        <path d="M20 20L32 10" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="20" cy="38" r="2" fill="#14532D" />
                    </svg>
                </div>
            );
    }
};

export default function MapPage() {
    const [viewState, setViewState] = useState({
        longitude: -122.4194, // San Francisco
        latitude: 37.7749,
        zoom: 16,
        pitch: 60, // Isometric view
        bearing: -20
    });
    const [popupInfo, setPopupInfo] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [routeData, setRouteData] = useState(null);

    // Navigation State
    const [navTarget, setNavTarget] = useState(null);
    const [activeMode, setActiveMode] = useState('driving'); // driving, walking, cycling
    const [routeStats, setRouteStats] = useState({ duration: 0, distance: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // Mock data with types
    const pins = [
        { id: 1, lat: 37.7749, lng: -122.4194, userName: 'EcoWarrior', plantNumber: 'Tree #142', type: 'tree', title: 'City Hall Garden', desc: 'Maintained by GreenLoop' },
        { id: 2, lat: 37.7760, lng: -122.4220, userName: 'EcoWarrior', plantNumber: 'Bush #089', type: 'bush', title: 'Community Patch', desc: 'Pruned yesterday' },
        { id: 3, lat: 37.7730, lng: -122.4210, userName: 'NatureLover', plantNumber: 'Flower #303', type: 'flower', title: 'Urban Oases', desc: 'Guerrilla Gardening' },
        { id: 4, lat: 37.7755, lng: -122.4200, userName: 'EcoWarrior', plantNumber: 'Fern #021', type: 'fern', title: 'My Balcony', desc: 'Watered today' },
        { id: 5, lat: 37.7785, lng: -122.4180, userName: 'EcoWarrior', plantNumber: 'Tree #155', type: 'tree', title: 'Plaza Oak', desc: 'Planted 2023' },
        { id: 6, lat: 37.7725, lng: -122.4150, userName: 'EcoWarrior', plantNumber: 'Flower #412', type: 'flower', title: 'Market St. Bloom', desc: 'Needs water soon' },
        { id: 7, lat: 37.7765, lng: -122.4165, userName: 'EcoWarrior', plantNumber: 'Bush #099', type: 'bush', title: 'Library Hedge', desc: 'Trimming required' },
        { id: 8, lat: 37.7790, lng: -122.4215, userName: 'EcoWarrior', plantNumber: 'Tree #167', type: 'tree', title: 'Opera House Pine', desc: 'Magnificent height' },
        { id: 9, lat: 37.7740, lng: -122.4230, userName: 'EcoWarrior', plantNumber: 'Fern #042', type: 'fern', title: 'Hayes Valley Fern', desc: 'Thriving well' },
        { id: 10, lat: 37.7710, lng: -122.4185, userName: 'EcoWarrior', plantNumber: 'Flower #505', type: 'flower', title: 'SOMA Petals', desc: 'Check soil pH' },
        { id: 11, lat: 37.7800, lng: -122.4190, userName: 'EcoWarrior', plantNumber: 'Tree #180', type: 'tree', title: 'Polk St. Maple', desc: 'Autumn colors' },
        { id: 12, lat: 37.7750, lng: -122.4240, userName: 'EcoWarrior', plantNumber: 'Bush #101', type: 'bush', title: 'Gough St. Shrub', desc: 'Native species' },
        { id: 13, lat: 37.7770, lng: -122.4140, userName: 'EcoWarrior', plantNumber: 'Flower #601', type: 'flower', title: 'UN Plaza Tulip', desc: 'Seasonal bloom' }
    ];

    const USER_NAME = 'EcoWarrior';
    const myPins = pins.filter(pin => pin.userName === USER_NAME);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserLocation({ latitude, longitude });
                setViewState(prev => ({
                    ...prev,
                    latitude,
                    longitude
                }));
            },
            (err) => console.error(err)
        );
    }, []);

    // Helper to calculate a Bezier curve simulating a projectile
    const getProjectileArc = (start, end) => {
        const points = [];
        const steps = 50;
        // Control point is interpolated
        const midLat = (start.lat + end.lat) / 2;
        const midLng = (start.lng + end.lng) / 2;

        // Offset perpendicular to the line creates the curve (simple approximation)
        const dx = end.lng - start.lng;
        const dy = end.lat - start.lat;

        // High curvature factor for pronounced arc
        const curvatureFactor = 0.5;
        // Perpendicular vector (-dy, dx)
        const ctrlLng = midLng - dy * curvatureFactor;
        const ctrlLat = midLat + dx * curvatureFactor;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const invT = 1 - t;
            // Quadratic Bezier: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
            const lng = (invT * invT * start.lng) + (2 * invT * t * ctrlLng) + (t * t * end.lng);
            const lat = (invT * invT * start.lat) + (2 * invT * t * ctrlLat) + (t * t * end.lat);
            points.push([lng, lat]);
        }

        return {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: points
            }
        };
    };

    const fetchDirections = async (destination, mode = 'driving') => {
        if (!userLocation) {
            alert("Please allow location access to get directions.");
            return;
        }

        setIsLoading(true);
        const startCoords = { lng: userLocation.longitude, lat: userLocation.latitude };
        const endCoords = { lng: destination.lng, lat: destination.lat };

        // 1. Generate Visual Projectile immediately (ignore OSRM geometry)
        const arc = getProjectileArc(startCoords, endCoords);
        setRouteData(arc);

        const start = `${userLocation.longitude},${userLocation.latitude}`;
        const end = `${destination.lng},${destination.lat}`;

        try {
            // Map modes to OSRM services
            const profileMap = {
                driving: 'driving',
                walking: 'walking',
                cycling: 'bike' // OSRM uses 'bike' not 'cycling'
            };
            const profile = profileMap[mode];

            // 2. Fetch Real Data for Stats Only
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/${profile}/${start};${end}?overview=false` // No geometry needed
            );
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                setRouteStats({
                    duration: Math.round(route.duration / 60), // seconds to minutes
                    distance: (route.distance / 1000).toFixed(1) // meters to km
                });
            } else {
                // Keep the visual arc even if OSRM fails to find a street route
                setRouteStats({ duration: 0, distance: 0 });
            }
        } catch (error) {
            console.error("Error fetching directions:", error);
            // Don't alert, fail silently visually
        } finally {
            setIsLoading(false);
        }
    };

    // Handler when user clicks "Get Directions" in popup (opens panel)
    const openNavigationPanel = (pin) => {
        setNavTarget(pin);
        setPopupInfo(null); // Close popup
        setActiveMode('driving'); // Default mode
        fetchDirections(pin, 'driving'); // Fetch default route
    };

    // Handler to launch external Google Maps integration
    const launchExternalNavigation = () => {
        if (!navTarget) return;

        // Map app mode to Google Maps travelmode
        const modeMap = {
            driving: 'driving',
            walking: 'walking',
            cycling: 'bicycling'
        };
        const travelMode = modeMap[activeMode] || 'driving';

        const url = `https://www.google.com/maps/dir/?api=1&destination=${navTarget.lat},${navTarget.lng}&travelmode=${travelMode}`;
        window.open(url, '_blank');
    };

    // Handler when switching modes tab
    const switchMode = (mode) => {
        setActiveMode(mode);
        if (navTarget) {
            fetchDirections(navTarget, mode);
        }
    };

    // Close navigation
    const endNavigation = () => {
        setNavTarget(null);
        setRouteData(null);
        setRouteStats({ duration: 0, distance: 0 });
    };

    const buildingLayer = {
        id: '3d-buildings',
        source: 'openmaptiles',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
            'fill-extrusion-color': '#e5e7eb',
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

    const routeLayer = {
        id: 'route',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#4285F4', // Google Blue per user request
            'line-width': 6,          // Thicker per user request
            'line-opacity': 0.9,
            'line-dasharray': [1, 2]  // Tighter dash for "tech" feel
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

                    {/* Route Layer */}
                    {routeData && (
                        <Source type="geojson" data={routeData}>
                            <Layer {...routeLayer} />
                        </Source>
                    )}

                    {/* 3D Buildings Layer */}
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
                                {/* Persistent Callout */}
                                <div className="mb-2 bg-white/95 text-xs font-semibold px-2 py-1 rounded shadow-md border border-border whitespace-nowrap transform transition-all group-hover:scale-110 opacity-0 group-hover:opacity-100">
                                    <span className="text-primary block">{pin.userName}</span>
                                    <span className="text-muted-foreground">{pin.plantNumber}</span>
                                </div>
                                <PlantMarker type={pin.type} />
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
                                <div className="text-sm font-medium text-emerald-600 mb-1 capitalize">{popupInfo.type} • {popupInfo.plantNumber}</div>
                                <p className="text-sm text-gray-600">{popupInfo.desc}</p>
                                <Button
                                    className="w-full mt-3 h-8 text-xs"
                                    size="sm"
                                    onClick={() => openNavigationPanel(popupInfo)}
                                >
                                    Get Directions <Navigation size={12} className="ml-1" />
                                </Button>
                            </div>
                        </Popup>
                    )}
                </Map>

                {/* Floating Navigation Controls Overlay */}
                {navTarget ? (
                    <div className="absolute inset-x-4 bottom-8 z-20">
                        <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-border max-w-md mx-auto animate-in slide-in-from-bottom-5">

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{navTarget.title}</h3>
                                    <p className="text-sm text-muted-foreground capitalize">{navTarget.type} • {navTarget.plantNumber}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={endNavigation}>
                                    <X size={18} />
                                </Button>
                            </div>

                            {/* Mode Toggles */}
                            <div className="flex bg-muted/50 p-1 rounded-lg mb-4">
                                <button
                                    onClick={() => switchMode('driving')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeMode === 'driving' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Car size={16} /> Drive
                                </button>
                                <button
                                    onClick={() => switchMode('walking')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeMode === 'walking' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Footprints size={16} /> Walk
                                </button>
                                <button
                                    onClick={() => switchMode('cycling')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeMode === 'cycling' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Bike size={16} /> Bike
                                </button>
                            </div>

                            {/* Stats & Actions */}
                            <div className="flex items-center justify-between">
                                <div>
                                    {isLoading ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                                            <Loader2 size={16} className="animate-spin" /> Calculating...
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-2xl font-bold text-emerald-600">
                                                {routeStats.duration} <span className="text-sm font-normal text-muted-foreground">min</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {routeStats.distance} km
                                            </div>
                                        </>
                                    )}
                                </div>
                                <Button
                                    onClick={launchExternalNavigation}
                                    disabled={isLoading}
                                    className="gap-2 px-6 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Navigation size={16} /> Start
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Default Floating Filters */
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg border border-border">
                        <h3 className="font-semibold mb-2">Filters</h3>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input type="checkbox" defaultChecked className="accent-primary" />
                                <span>My Plants</span>
                            </label>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
