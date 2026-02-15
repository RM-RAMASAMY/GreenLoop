import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, MapPin, Clock, Flame, TreePine, Bike, Recycle, Droplets, ShoppingBag, Sun, ChevronDown, X, Plus, Award, LocateFixed, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const ACTIVITY_TYPES = [
    { id: 'plant', label: 'Plant a Tree', emoji: '🌱', xp: 50, color: 'emerald', icon: TreePine, desc: 'Plant or care for greenery' },
    { id: 'commute', label: 'Green Commute', emoji: '🚲', xp: 30, color: 'blue', icon: Bike, desc: 'Walk, bike, or use public transit' },
    { id: 'recycle', label: 'Recycle', emoji: '♻️', xp: 10, color: 'amber', icon: Recycle, desc: 'Sort and recycle waste properly' },
    { id: 'water', label: 'Save Water', emoji: '💧', xp: 15, color: 'cyan', icon: Droplets, desc: 'Reduce water waste or harvest rain' },
    { id: 'reusable', label: 'Use Reusable', emoji: '🛍️', xp: 10, color: 'purple', icon: ShoppingBag, desc: 'Use reusable bags, cups, utensils' },
    { id: 'energy', label: 'Save Energy', emoji: '☀️', xp: 20, color: 'yellow', icon: Sun, desc: 'Reduce energy consumption' },
];

const MOCK_HISTORY = [
    { id: 1, type: 'plant', label: 'Plant a Tree', desc: 'Planted an oak sapling at Civic Center', xp: 50, time: '2 hours ago', status: 'verified' },
    { id: 2, type: 'commute', label: 'Green Commute', desc: 'Biked to work — 4.2 km', xp: 30, time: '5 hours ago', status: 'verified' },
    { id: 3, type: 'recycle', label: 'Recycle', desc: 'Sorted 3 bags of recyclables', xp: 10, time: 'Yesterday', status: 'verified' },
    { id: 4, type: 'water', label: 'Save Water', desc: 'Installed low-flow shower head', xp: 15, time: 'Yesterday', status: 'pending' },
    { id: 5, type: 'reusable', label: 'Use Reusable', desc: 'Brought my own cup to coffee shop', xp: 10, time: '2 days ago', status: 'verified' },
];

const colorMap = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', ring: 'ring-emerald-400' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', ring: 'ring-blue-400' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', ring: 'ring-amber-400' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', ring: 'ring-cyan-400' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', ring: 'ring-purple-400' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', ring: 'ring-yellow-400' },
};

export default function CameraPage() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [location, setLocation] = useState({ lat: '', lng: '' });
    const [locating, setLocating] = useState(false);
    const navigate = useNavigate();

    // Fetch current GPS location on demand
    const fetchCurrentLocation = () => {
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) });
                setLocating(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                alert('Could not get your location. Please enter it manually or allow location access.');
                setLocating(false);
            }
        );
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async () => {
        if (!selectedType) return;
        setLoading(true);

        try {
            if (location.lat && location.lng) {
                try {
                    await axios.post('http://localhost:3001/api/action', {
                        userId: 'user1',
                        actionType: selectedType.id.toUpperCase(),
                        details: {
                            plantName: selectedType.label,
                            description,
                            location: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) }
                        }
                    });
                } catch (apiErr) {
                    console.error("API Error, proceeding with mock", apiErr);
                }
            }

            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFile(null);
                setPreview(null);
                setSelectedType(null);
                setDescription('');
                setLocation({ lat: '', lng: '' });
                setLoading(false);
            }, 2500);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // Stats
    const todayXP = 90;
    const streak = 7;
    const totalLogs = 42;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Log Activity</h1>
                <p className="text-muted-foreground">Capture your green actions to earn XP and track your impact.</p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <Flame className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-emerald-600">{streak}</div>
                            <div className="text-xs text-muted-foreground">Day Streak 🔥</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Award className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold">{todayXP}</div>
                            <div className="text-xs text-muted-foreground">XP Today</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold">{totalLogs}</div>
                            <div className="text-xs text-muted-foreground">Total Logs</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Success State */}
            {submitted && (
                <Card className="border-emerald-300 bg-emerald-50">
                    <CardContent className="p-6 text-center space-y-3">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-800">Activity Logged! 🎉</h3>
                        <p className="text-emerald-600 font-semibold text-lg">+{selectedType?.xp} XP</p>
                        <p className="text-sm text-emerald-700">Keep up the great work, EcoWarrior!</p>
                    </CardContent>
                </Card>
            )}

            {/* Main Log Form */}
            {!submitted && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus size={20} /> New Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Step 1: Choose Activity Type */}
                        <div>
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
                                1. Choose Activity Type
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {ACTIVITY_TYPES.map(type => {
                                    const colors = colorMap[type.color];
                                    const isSelected = selectedType?.id === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${isSelected
                                                ? `${colors.bg} ${colors.border} ${colors.text} ring-2 ${colors.ring} shadow-md`
                                                : 'border-border bg-card hover:bg-muted/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl">{type.emoji}</span>
                                                <span className="font-semibold text-sm">{type.label}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{type.desc}</div>
                                            <div className="mt-2">
                                                <Badge variant="secondary" className={`text-xs ${isSelected ? `${colors.bg} ${colors.text}` : ''}`}>
                                                    +{type.xp} XP
                                                </Badge>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Add Details */}
                        {selectedType && (
                            <>
                                <div>
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
                                        2. Add Details
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={`Describe your ${selectedType.label.toLowerCase()} activity...`}
                                        className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none transition-all"
                                    />
                                </div>

                                {/* Location Input */}
                                <div>
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
                                        Location <span className="text-xs font-normal normal-case">(optional)</span>
                                    </label>
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
                                            <input
                                                type="text"
                                                value={location.lat}
                                                onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))}
                                                placeholder="e.g. 37.7749"
                                                className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
                                            <input
                                                type="text"
                                                value={location.lng}
                                                onChange={(e) => setLocation(prev => ({ ...prev, lng: e.target.value }))}
                                                placeholder="e.g. -122.4194"
                                                className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="gap-1.5 h-9 flex-shrink-0"
                                            onClick={fetchCurrentLocation}
                                            disabled={locating}
                                        >
                                            {locating ? (
                                                <><Loader2 size={14} className="animate-spin" /> Locating...</>
                                            ) : (
                                                <><LocateFixed size={14} /> Use My Location</>
                                            )}
                                        </Button>
                                    </div>
                                    {location.lat && location.lng && (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600">
                                            <MapPin size={12} />
                                            <span>Location set: {location.lat}, {location.lng}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Step 3: Attach Photo (Optional) */}
                                <div>
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
                                        3. Attach Photo <span className="text-xs font-normal normal-case">(optional)</span>
                                    </label>
                                    {!preview ? (
                                        <div
                                            className="border-2 border-dashed border-input rounded-xl p-8 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center gap-3"
                                            onClick={() => document.getElementById('fileInput').click()}
                                        >
                                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                                <Camera size={24} />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-sm font-semibold">Take a Photo or Upload</h3>
                                                <p className="text-xs text-muted-foreground">Proof earns bonus verification XP</p>
                                            </div>
                                            <input
                                                type="file"
                                                id="fileInput"
                                                accept="image/*"
                                                capture="environment"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden border border-border">
                                            <img src={preview} alt="Preview" className="w-full block max-h-[200px] object-cover" />
                                            <button
                                                onClick={() => { setFile(null); setPreview(null); }}
                                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || !selectedType}
                                    className="w-full h-12 text-base gap-2 shadow-lg hover:shadow-xl transition-all"
                                >
                                    {loading ? (
                                        'Submitting...'
                                    ) : (
                                        <>
                                            <Upload className="h-5 w-5" />
                                            Log Activity & Earn +{selectedType.xp} XP
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Recent Activity Log */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock size={20} /> Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {MOCK_HISTORY.map(item => {
                            const actType = ACTIVITY_TYPES.find(t => t.id === item.type);
                            const colors = actType ? colorMap[actType.color] : colorMap.emerald;
                            return (
                                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                                    <div className={`p-2 rounded-full ${colors.bg}`}>
                                        <span className="text-lg">{actType?.emoji || '🌿'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm truncate">{item.label}</div>
                                        <div className="text-xs text-muted-foreground truncate">{item.desc}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="font-bold text-emerald-600 text-sm">+{item.xp} XP</div>
                                        <div className="text-xs text-muted-foreground">{item.time}</div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {item.status === 'verified' ? (
                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">✓ Verified</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">⏳ Pending</Badge>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
