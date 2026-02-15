import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Star, Sprout, Search, Loader2, ExternalLink, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// Calculate distance between two lat/lng pairs (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

// Build a readable address from OSM tags
function buildAddress(tags) {
    const parts = [];
    if (tags['addr:housenumber'] && tags['addr:street']) {
        parts.push(`${tags['addr:housenumber']} ${tags['addr:street']}`);
    } else if (tags['addr:street']) {
        parts.push(tags['addr:street']);
    }
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    return parts.length > 0 ? parts.join(', ') : null;
}

export default function NurseriesPage() {
    const [nurseries, setNurseries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [radius, setRadius] = useState(5000); // 5km default

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                fetchNurseries(loc.lat, loc.lng);
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Location access is required to find nearby nurseries. Please allow location access and refresh.');
                setLoading(false);
            }
        );
    }, []);

    const fetchNurseries = async (lat, lng) => {
        setLoading(true);
        setError(null);

        // Overpass QL query: find garden centres, nurseries, and florists nearby
        const query = `
            [out:json][timeout:15];
            (
                node["shop"="garden_centre"](around:${radius},${lat},${lng});
                way["shop"="garden_centre"](around:${radius},${lat},${lng});
                node["shop"="nursery"](around:${radius},${lat},${lng});
                way["shop"="nursery"](around:${radius},${lat},${lng});
                node["shop"="garden_furniture"](around:${radius},${lat},${lng});
                node["landuse"="plant_nursery"](around:${radius},${lat},${lng});
                way["landuse"="plant_nursery"](around:${radius},${lat},${lng});
                node["shop"="florist"](around:${radius},${lat},${lng});
                way["shop"="florist"](around:${radius},${lat},${lng});
            );
            out center body;
        `;

        try {
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: `data=${encodeURIComponent(query)}`,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (!response.ok) throw new Error('Overpass API request failed');

            const data = await response.json();

            const results = data.elements
                .map(el => {
                    const elLat = el.lat || el.center?.lat;
                    const elLng = el.lon || el.center?.lon;
                    if (!elLat || !elLng) return null;

                    const tags = el.tags || {};
                    return {
                        id: el.id,
                        name: tags.name || tags['name:en'] || 'Unnamed Plant Shop',
                        address: buildAddress(tags) || `${elLat.toFixed(4)}, ${elLng.toFixed(4)}`,
                        phone: tags.phone || tags['contact:phone'] || null,
                        website: tags.website || tags['contact:website'] || null,
                        hours: tags.opening_hours || null,
                        lat: elLat,
                        lng: elLng,
                        distance: getDistance(lat, lng, elLat, elLng),
                        type: tags.shop || tags.landuse || 'nursery',
                        description: tags.description || null,
                        wheelchair: tags.wheelchair || null,
                    };
                })
                .filter(Boolean)
                .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

            setNurseries(results);

            if (results.length === 0) {
                setError('No nurseries found within the search radius. Try expanding the radius.');
            }
        } catch (err) {
            console.error('Overpass API error:', err);
            setError('Could not fetch nursery data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const expandRadius = () => {
        const newRadius = radius + 5000;
        setRadius(newRadius);
        if (userLocation) {
            fetchNurseries(userLocation.lat, userLocation.lng);
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            garden_centre: 'Garden Center',
            nursery: 'Plant Nursery',
            plant_nursery: 'Plant Nursery',
            florist: 'Florist',
            garden_furniture: 'Garden Supply',
        };
        return labels[type] || 'Plant Shop';
    };

    const getTypeColor = (type) => {
        const colors = {
            garden_centre: 'bg-emerald-100 text-emerald-800',
            nursery: 'bg-green-100 text-green-800',
            plant_nursery: 'bg-green-100 text-green-800',
            florist: 'bg-pink-100 text-pink-800',
            garden_furniture: 'bg-amber-100 text-amber-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    // Map store type to a beautiful plant image
    const getPlantImage = (type, index) => {
        const images = {
            garden_centre: [
                'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=300&fit=crop',
            ],
            nursery: [
                'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1491147334573-44cbb4602074?w=400&h=300&fit=crop',
            ],
            plant_nursery: [
                'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=400&h=300&fit=crop',
            ],
            florist: [
                'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&h=300&fit=crop',
            ],
            garden_furniture: [
                'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
            ],
        };
        const defaults = [
            'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1501004318855-dc52f24e1998?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?w=400&h=300&fit=crop',
        ];
        const pool = images[type] || defaults;
        return pool[index % pool.length];
    };

    const filteredNurseries = nurseries.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTypeLabel(n.type).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Sprout className="h-8 w-8 text-emerald-600" /> Plant Nurseries
                    </h1>
                    <p className="text-muted-foreground">
                        Real nurseries near your location, powered by OpenStreetMap.
                    </p>
                </div>
                {userLocation && (
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        <MapPin size={12} /> {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}
                    </Badge>
                )}
            </div>

            {/* Search & Radius Controls */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search nurseries by name or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-input bg-card rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={expandRadius}
                    className="whitespace-nowrap"
                    disabled={loading}
                >
                    Expand Radius ({(radius / 1000).toFixed(0)} km)
                </Button>
            </div>

            {/* Loading State */}
            {loading && (
                <Card>
                    <CardContent className="p-12 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                        <div className="text-center">
                            <h3 className="font-semibold text-lg">Searching Nearby...</h3>
                            <p className="text-sm text-muted-foreground">Finding plant nurseries within {(radius / 1000).toFixed(0)} km of your location</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {error && !loading && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-6 text-center space-y-3">
                        <p className="text-amber-800 font-medium">{error}</p>
                        <Button onClick={expandRadius} className="gap-2">
                            <Search size={14} /> Search Wider Area (+5 km)
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Results Count */}
            {!loading && nurseries.length > 0 && (
                <div className="text-sm text-muted-foreground">
                    Found <span className="font-bold text-foreground">{filteredNurseries.length}</span> nurseries within {(radius / 1000).toFixed(0)} km
                </div>
            )}

            {/* Nursery Tile Grid - MSN News Style */}
            {!loading && filteredNurseries.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] gap-3">
                    {filteredNurseries.map((nursery, idx) => {
                        // Repeating tile pattern: large, std, std, wide, tall, std, std, wide...
                        const pattern = [
                            'col-span-2 row-span-2',  // large hero
                            '',                        // standard
                            '',                        // standard
                            'col-span-2',              // wide
                            'row-span-2',              // tall
                            '',                        // standard
                            '',                        // standard
                            'col-span-2',              // wide
                        ];
                        const tileClass = pattern[idx % pattern.length];
                        const isLarge = tileClass.includes('col-span-2') && tileClass.includes('row-span-2');
                        const isWide = tileClass === 'col-span-2';
                        const isTall = tileClass === 'row-span-2';

                        return (
                            <div
                                key={nursery.id}
                                className={`${tileClass} relative group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
                                onClick={() => window.open(
                                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nursery.name + ' ' + nursery.address)}`,
                                    '_blank'
                                )}
                            >
                                {/* Background Image */}
                                <img
                                    src={getPlantImage(nursery.type, nursery.id)}
                                    alt={nursery.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    loading="lazy"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                {/* Distance Badge */}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full shadow-lg text-emerald-700">
                                    {nursery.distance} mi
                                </div>

                                {/* Type Badge */}
                                <div className="absolute top-3 left-3">
                                    <Badge className={`text-xs shadow-md ${getTypeColor(nursery.type)}`}>
                                        {getTypeLabel(nursery.type)}
                                    </Badge>
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className={`font-bold text-white drop-shadow-lg ${isLarge ? 'text-xl mb-1' : 'text-sm'}`}>
                                        {nursery.name}
                                    </h3>

                                    {/* Show address on larger tiles */}
                                    {(isLarge || isWide || isTall) && (
                                        <div className="flex items-center gap-1.5 text-white/80 text-xs mt-1">
                                            <MapPin size={11} /> {nursery.address}
                                        </div>
                                    )}

                                    {/* Show hours on large tiles */}
                                    {isLarge && nursery.hours && (
                                        <div className="flex items-center gap-1.5 text-white/70 text-xs mt-1">
                                            <Clock size={11} /> {nursery.hours}
                                        </div>
                                    )}

                                    {/* Action buttons on large tiles */}
                                    {isLarge && (
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                className="gap-1.5 text-xs h-8 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border-white/30"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(
                                                        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nursery.name + ' ' + nursery.address)}&travelmode=driving`,
                                                        '_blank'
                                                    );
                                                }}
                                            >
                                                <Navigation size={12} /> Directions
                                            </Button>
                                            {nursery.phone && (
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 text-xs h-8 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white border-white/30"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`tel:${nursery.phone}`);
                                                    }}
                                                >
                                                    <Phone size={12} /> Call
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Hover detail overlay for non-large tiles */}
                                {!isLarge && (
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
                                            <MapPin size={11} /> {nursery.address}
                                        </div>
                                        {nursery.phone && (
                                            <div className="flex items-center gap-1.5 text-white/80 text-xs mb-2">
                                                <Phone size={11} /> {nursery.phone}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                className="text-xs text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg hover:bg-white/40 transition-colors flex items-center gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(
                                                        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nursery.name + ' ' + nursery.address)}&travelmode=driving`,
                                                        '_blank'
                                                    );
                                                }}
                                            >
                                                <Navigation size={10} /> Directions
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
