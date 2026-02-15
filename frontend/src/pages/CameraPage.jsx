import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, MapPin, Clock, Flame, TreePine, Bike, Recycle, Droplets, ShoppingBag, Sun, ChevronDown, X, Plus, Award, LocateFixed, Loader2, RefreshCw, Trash2 } from 'lucide-react';
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


const colorMap = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', ring: 'ring-emerald-400' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', ring: 'ring-blue-400' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', ring: 'ring-amber-400' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', ring: 'ring-cyan-400' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', ring: 'ring-purple-400' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', ring: 'ring-yellow-400' },
};

const API_URL = 'http://localhost:3001';

export default function CameraPage({ token }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [location, setLocation] = useState({ lat: '', lng: '' });
    const [locating, setLocating] = useState(false);
    const [history, setHistory] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ streak: 0, todayXP: 0, totalLogs: 0 });

    // Plant-specific states
    const [plantName, setPlantName] = useState('');
    const [plantType, setPlantType] = useState('tree');
    const [plantTitle, setPlantTitle] = useState('');

    // Fetch real activity history and stats
    const refreshHistory = () => {
        if (!token) return;
        setRefreshing(true);

        // 1. Fetch history
        fetch(`${API_URL}/api/actions?limit=5`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setHistory(data);
                setRefreshing(false);
            })
            .catch(() => setRefreshing(false));

        // 2. Fetch stats for top cards
        fetch(`${API_URL}/api/user/me/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setStats(data);
            })
            .catch(err => console.error('Stats fetch error:', err));
    };

    useEffect(() => { refreshHistory(); }, [token]);

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
            // Post to real backend with auth
            const actionMap = { plant: 'PLANT', commute: 'WALK', recycle: 'COMPOST', water: 'REFILL', reusable: 'SWAP', energy: 'OTHER' };
            if (token) {
                try {
                    await fetch(`${API_URL}/api/action`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            actionType: actionMap[selectedType.id] || 'OTHER',
                            details: {
                                plantName: selectedType.id === 'plant' ? plantName : selectedType.label,
                                plantType: selectedType.id === 'plant' ? plantType : null,
                                title: selectedType.id === 'plant' ? plantTitle : null,
                                description,
                                location: location.lat && location.lng
                                    ? { lat: parseFloat(location.lat), lng: parseFloat(location.lng) }
                                    : null
                            }
                        })
                    });
                } catch (apiErr) {
                    console.error('API Error:', apiErr);
                }
            }

            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFile(null);
                setPreview(null);
                setSelectedType(null);
                setDescription('');
                setPlantName('');
                setPlantType('tree');
                setPlantTitle('');
                setLocation({ lat: '', lng: '' });
                setLoading(false);
                refreshHistory(); // Auto-refresh after submit
            }, 2500);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDeleteAction = async (id) => {
        console.log(`[DELETE_FRONTEND] Requesting delete for action: ${id}`);
        if (!window.confirm('Are you sure you want to remove this activity?')) return;
        try {
            const res = await fetch(`${API_URL}/api/actions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`[DELETE_FRONTEND] Response status: ${res.status}`);
            if (res.ok) {
                console.log('[DELETE_FRONTEND] Success, refreshing history');
                refreshHistory();
            } else {
                const errorBody = await res.json().catch(() => ({}));
                console.error('[DELETE_FRONTEND] Failed to delete:', errorBody);
                alert(`Failed to delete action: ${errorBody.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('[DELETE_FRONTEND] Network error:', err);
        }
    };

    const todayXP = stats.todayXP;
    const streak = stats.streak;
    const totalLogs = stats.totalLogs;

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
                        <div className="space-y-1">
                            <p className="text-emerald-600 font-semibold text-lg">+{selectedType?.xp || 50} XP</p>
                            <p className="text-sm font-medium text-emerald-700">
                                {plantName || selectedType?.label} was registered successfully.
                            </p>
                            {location.lat && (
                                <p className="text-xs text-emerald-600/80 italic">
                                    Coordinates tracked: {location.lat}, {location.lng}
                                </p>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            onClick={() => setSubmitted(false)}
                        >
                            Log Another
                        </Button>
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
                                            onClick={() => {
                                                setSelectedType(type);
                                                // Proactively fetch location if planting
                                                if (type.id === 'plant' && !location.lat) {
                                                    fetchCurrentLocation();
                                                }
                                            }}
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
                                        className="w-full border border-input bg-background rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none transition-all"
                                    />
                                </div>

                                {selectedType.id === 'plant' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                                Plant Name / Species
                                            </label>
                                            <input
                                                type="text"
                                                value={plantName}
                                                onChange={(e) => setPlantName(e.target.value)}
                                                placeholder="e.g. Coast Live Oak"
                                                className="w-full border border-input bg-background rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                                Plant Category
                                            </label>
                                            <select
                                                value={plantType}
                                                onChange={(e) => setPlantType(e.target.value)}
                                                className="w-full border border-input bg-background rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            >
                                                <option value="tree">Tree</option>
                                                <option value="flower">Flower</option>
                                                <option value="bush">Bush</option>
                                                <option value="fern">Fern</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                                Location Title (e.g. Park Name)
                                            </label>
                                            <input
                                                type="text"
                                                value={plantTitle}
                                                onChange={(e) => setPlantTitle(e.target.value)}
                                                placeholder="e.g. Golden Gate Park"
                                                className="w-full border border-input bg-background rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

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
                                    {location.lat && location.lng ? (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600">
                                            <MapPin size={12} />
                                            <span>Location set: {location.lat}, {location.lng}</span>
                                        </div>
                                    ) : selectedType.id === 'plant' ? (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 animate-pulse font-medium">
                                            <MapPin size={12} />
                                            <span>Note: Without location, this won't show on the global map!</span>
                                        </div>
                                    ) : null}
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
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Clock size={20} /> Recent Activity
                        </CardTitle>
                        <button
                            onClick={refreshHistory}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No activities logged yet. Start above!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {history.map(item => {
                                const actionMap = { PLANT: 'plant', WALK: 'commute', COMPOST: 'recycle', REFILL: 'water', SWAP: 'reusable', OTHER: 'energy' };
                                const typeId = actionMap[item.actionType] || 'plant';
                                const actType = ACTIVITY_TYPES.find(t => t.id === typeId);
                                const colors = actType ? colorMap[actType.color] : colorMap.emerald;
                                const timeAgo = (date) => {
                                    const diff = Date.now() - new Date(date).getTime();
                                    const mins = Math.floor(diff / 60000);
                                    if (mins < 60) return `${mins}m ago`;
                                    const hours = Math.floor(mins / 60);
                                    if (hours < 24) return `${hours}h ago`;
                                    return `${Math.floor(hours / 24)}d ago`;
                                };
                                return (
                                    <div key={item._id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                                        <div className={`p-2 rounded-full ${colors.bg}`}>
                                            <span className="text-lg">{actType?.emoji || '🌿'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate">{actType?.label || item.actionType}</div>
                                            <div className="text-xs text-muted-foreground truncate">{item.details?.description || item.details?.plantName || 'Eco activity'}</div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="font-bold text-emerald-600 text-sm">+{item.xpGained} XP</div>
                                            <div className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</div>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">✓ Verified</Badge>
                                            <button
                                                onClick={() => handleDeleteAction(item._id)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                title="Remove activity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
