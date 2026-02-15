import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowRightLeft, TrendingUp, Leaf, Package, ShoppingBag,
    Droplets, ChefHat, Sparkles, Trophy, Target,
    ArrowRight, Chrome, ExternalLink, Filter, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const API_URL = 'http://localhost:3001';

const CATEGORIES = ['All', 'Hydration', 'Personal Care', 'Kitchen', 'Shopping'];

const CATEGORY_ICONS = {
    Hydration: Droplets,
    'Personal Care': Sparkles,
    Kitchen: ChefHat,
    Shopping: ShoppingBag,
};

const CATEGORY_COLORS = {
    Hydration: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
    'Personal Care': { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500' },
    Kitchen: { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' },
    Shopping: { bg: 'bg-pink-100', text: 'text-pink-700', bar: 'bg-pink-500' },
};

export default function EcoSwapPage({ token }) {
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        if (!token) { setLoading(false); return; }
        fetch(`${API_URL}/api/swaps`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setSwaps(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const filteredSwaps = useMemo(() =>
        activeFilter === 'All'
            ? swaps
            : swaps.filter(s => s.category === activeFilter),
        [activeFilter, swaps]
    );

    // Computed stats
    const totalSwaps = swaps.length;
    const totalXP = swaps.reduce((sum, s) => sum + (s.xp || 0), 0);
    const totalCO2 = swaps.reduce((sum, s) => sum + (s.co2Saved || 0), 0).toFixed(1);
    const totalPlastic = swaps.reduce((sum, s) => sum + (s.plasticSaved || 0), 0);
    const avgEcoImprovement = totalSwaps > 0 ? Math.round(
        swaps.reduce((sum, s) => sum + ((s.ecoScoreAfter || 0) - (s.ecoScoreBefore || 0)), 0) / totalSwaps
    ) : 0;

    // Category breakdown
    const categoryStats = useMemo(() => {
        const stats = {};
        swaps.forEach(s => {
            if (!stats[s.category]) stats[s.category] = { count: 0, co2: 0, plastic: 0 };
            stats[s.category].count++;
            stats[s.category].co2 += s.co2Saved || 0;
            stats[s.category].plastic += s.plasticSaved || 0;
        });
        return stats;
    }, [swaps]);

    const maxCategoryCount = Object.keys(categoryStats).length > 0
        ? Math.max(...Object.values(categoryStats).map(s => s.count))
        : 1;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <ArrowRightLeft className="text-emerald-600" /> Eco Swap Stats
                    </h1>
                    <p className="text-muted-foreground">
                        Track your sustainable product swaps made via the GreenLoop Chrome Extension.
                    </p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}>
                    <Chrome size={16} /> Get Extension
                </Button>
            </div>

            {/* Impact Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                    <CardContent className="p-4 text-center">
                        <div className="p-2 bg-emerald-100 rounded-full w-fit mx-auto mb-2">
                            <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-700">{totalSwaps}</div>
                        <div className="text-xs text-muted-foreground">Total Swaps</div>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardContent className="p-4 text-center">
                        <div className="p-2 bg-blue-100 rounded-full w-fit mx-auto mb-2">
                            <Trophy className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-700">{totalXP}</div>
                        <div className="text-xs text-muted-foreground">XP Earned</div>
                    </CardContent>
                </Card>
                <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50">
                    <CardContent className="p-4 text-center">
                        <div className="p-2 bg-teal-100 rounded-full w-fit mx-auto mb-2">
                            <Leaf className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="text-2xl font-bold text-teal-700">{totalCO2} kg</div>
                        <div className="text-xs text-muted-foreground">CO₂ Saved</div>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardContent className="p-4 text-center">
                        <div className="p-2 bg-purple-100 rounded-full w-fit mx-auto mb-2">
                            <Package className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-purple-700">{totalPlastic}g</div>
                        <div className="text-xs text-muted-foreground">Plastic Avoided</div>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                    <CardContent className="p-4 text-center">
                        <div className="p-2 bg-amber-100 rounded-full w-fit mx-auto mb-2">
                            <TrendingUp className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="text-2xl font-bold text-amber-700">+{avgEcoImprovement}</div>
                        <div className="text-xs text-muted-foreground">Avg Eco Score ↑</div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Target size={18} /> Swaps by Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.keys(categoryStats).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No swaps yet. Install the Chrome Extension to get started!</p>
                        ) : (
                            Object.entries(categoryStats).map(([cat, stats]) => {
                                const colors = CATEGORY_COLORS[cat] || { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-500' };
                                const Icon = CATEGORY_ICONS[cat] || Package;
                                return (
                                    <div key={cat} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1 rounded ${colors.bg}`}>
                                                    <Icon size={14} className={colors.text} />
                                                </div>
                                                <span className="font-medium">{cat}</span>
                                            </div>
                                            <span className="text-muted-foreground">{stats.count} swaps</span>
                                        </div>
                                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
                                                style={{ width: `${(stats.count / maxCategoryCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Leaf size={18} /> Environmental Impact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {Object.keys(categoryStats).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Start swapping to see your impact!</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(categoryStats).map(([cat, stats]) => {
                                    const colors = CATEGORY_COLORS[cat] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                                    return (
                                        <div key={cat} className={`${colors.bg} rounded-xl p-4`}>
                                            <div className={`text-xs font-semibold ${colors.text} mb-1`}>{cat}</div>
                                            <div className="text-lg font-bold">{stats.co2.toFixed(1)} kg</div>
                                            <div className="text-xs text-muted-foreground">CO₂ saved</div>
                                            <div className="text-sm font-semibold mt-1">{stats.plastic}g</div>
                                            <div className="text-xs text-muted-foreground">plastic avoided</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Swap History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ArrowRightLeft size={18} /> Swap History
                        </CardTitle>
                        <div className="flex gap-1.5">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveFilter(cat)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${activeFilter === cat
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredSwaps.length === 0 ? (
                        <div className="text-center p-12 text-muted-foreground">
                            <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p>No swaps recorded yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredSwaps.map(swap => {
                                const colors = CATEGORY_COLORS[swap.category] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                                const Icon = CATEGORY_ICONS[swap.category] || Package;
                                return (
                                    <div key={swap._id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                                        <div className={`p-2.5 rounded-xl ${colors.bg} flex-shrink-0`}>
                                            <Icon size={20} className={colors.text} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm text-muted-foreground line-through truncate">{swap.original}</span>
                                                <ArrowRight size={12} className="text-emerald-500 flex-shrink-0" />
                                                <span className="font-semibold text-sm truncate">{swap.swap}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{new Date(swap.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                <span>•</span>
                                                <Badge className={`text-xs ${colors.bg} ${colors.text}`}>{swap.category}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-red-400 font-mono">{swap.ecoScoreBefore}</span>
                                                    <ArrowRight size={10} className="text-muted-foreground" />
                                                    <span className="text-sm font-bold text-emerald-600 font-mono">{swap.ecoScoreAfter}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">eco score</div>
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-700 text-xs font-bold">
                                                +{swap.xp || 100} XP
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Chrome Extension CTA */}
            <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 overflow-hidden relative">
                <CardContent className="p-8 flex items-center gap-8">
                    <div className="p-4 bg-white/80 rounded-2xl shadow-sm flex-shrink-0">
                        <Chrome size={48} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">GreenLoop Chrome Extension</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Shop sustainably everywhere. Our extension detects products on Amazon, Walmart, and 50+ retailers,
                            then suggests eco-friendly swaps instantly. Every swap earns you 100 XP!
                        </p>
                        <div className="flex gap-3">
                            <Button className="gap-2" onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}>
                                <Chrome size={16} /> Install Extension
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <ExternalLink size={16} /> Learn More
                            </Button>
                        </div>
                    </div>
                    <div className="absolute -right-8 -bottom-8 opacity-5">
                        <Leaf size={200} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
