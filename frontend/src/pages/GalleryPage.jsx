import React, { useState, useEffect } from 'react';
import { Image, MapPin, Clock, Loader2, RefreshCw, TreePine, Bike, Recycle, Droplets, ShoppingBag, Sun, Maximize2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const ACTIVITY_META = {
    PLANT: { label: 'Plant a Tree', emoji: '🌱', color: 'emerald' },
    WALK: { label: 'Green Commute', emoji: '🚲', color: 'blue' },
    COMPOST: { label: 'Recycle', emoji: '♻️', color: 'amber' },
    REFILL: { label: 'Save Water', emoji: '💧', color: 'cyan' },
    SWAP: { label: 'Use Reusable', emoji: '🛍️', color: 'purple' },
    OTHER: { label: 'Save Energy', emoji: '☀️', color: 'yellow' },
    CLEANUP: { label: 'Cleanup', emoji: '🧹', color: 'emerald' },
    OBSERVE: { label: 'Observe', emoji: '👀', color: 'blue' },
};

const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    purple: 'bg-purple-100 text-purple-700',
    yellow: 'bg-yellow-100 text-yellow-700',
};

const API_URL = 'http://localhost:3001';

function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

export default function GalleryPage({ token }) {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null);

    const fetchGallery = () => {
        if (!token) return;
        setLoading(true);
        fetch(`${API_URL}/api/gallery`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPhotos(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchGallery(); }, [token]);

    const getMeta = (actionType) => ACTIVITY_META[actionType] || ACTIVITY_META.OTHER;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Image className="h-7 w-7 text-primary" />
                        </div>
                        Activity Gallery
                    </h1>
                    <p className="text-muted-foreground mt-1">Photos from your logged eco activities</p>
                </div>
                <button
                    onClick={fetchGallery}
                    className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Refresh"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-6 px-5 py-3 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2">
                    <Image size={16} className="text-primary" />
                    <span className="text-sm font-semibold">{photos.length}</span>
                    <span className="text-sm text-muted-foreground">photos</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {[...new Set(photos.map(p => p.actionType))].length} activity types
                    </span>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-3" />
                    <p className="text-sm">Loading gallery...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && photos.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <Image className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No photos yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Attach a photo when logging an activity to see it here. Your eco moments will appear in a beautiful gallery grid.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Photo Grid */}
            {!loading && photos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {photos.map(item => {
                        const meta = getMeta(item.actionType);
                        const colors = colorClasses[meta.color] || colorClasses.emerald;
                        const imageUrl = item.details?.imageUrl?.startsWith('/')
                            ? `${API_URL}${item.details.imageUrl}`
                            : item.details?.imageUrl;

                        return (
                            <div
                                key={item._id}
                                className="group relative bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Photo */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                    <img
                                        src={imageUrl}
                                        alt={item.details?.description || 'Activity photo'}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop';
                                        }}
                                    />
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                        <button
                                            onClick={() => setLightbox(imageUrl)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2.5 bg-white/90 rounded-full shadow-lg hover:bg-white"
                                        >
                                            <Maximize2 size={18} className="text-gray-800" />
                                        </button>
                                    </div>

                                    {/* Activity badge */}
                                    <div className="absolute top-3 left-3">
                                        <Badge className={`${colors} text-xs font-semibold shadow-sm`}>
                                            {meta.emoji} {meta.label}
                                        </Badge>
                                    </div>

                                    {/* XP badge */}
                                    <div className="absolute top-3 right-3">
                                        <Badge className="bg-emerald-500 text-white text-xs font-bold shadow-sm">
                                            +{item.xpGained} XP
                                        </Badge>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4 space-y-2">
                                    <p className="text-sm font-medium line-clamp-2 leading-snug">
                                        {item.details?.description || item.details?.plantName || 'Eco activity'}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {timeAgo(item.createdAt)}
                                        </span>
                                        {item.location?.lat && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {Number(item.location.lat).toFixed(2)}, {Number(item.location.lng).toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {item.details?.plantName && item.actionType === 'PLANT' && (
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                            <TreePine size={12} />
                                            {item.details.plantName}
                                            {item.details.title && <span className="text-muted-foreground">• {item.details.title}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Lightbox Modal */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 animate-in fade-in duration-200"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={() => setLightbox(null)}
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={lightbox}
                        alt="Full view"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
