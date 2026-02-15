import React, { useState, useMemo } from 'react';
import {
    ArrowRightLeft, TrendingUp, Leaf, Package, ShoppingBag,
    Droplets, ChefHat, Sparkles, Trophy, Target,
    ArrowRight, Chrome, ExternalLink, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// ---- Mock swap history (simulates data from Chrome extension) ----
const SWAP_HISTORY = [
    { id: 1, original: 'Plastic Water Bottle', swap: 'Stainless Steel Bottle', category: 'Hydration', ecoScoreBefore: 10, ecoScoreAfter: 95, xp: 100, date: '2026-02-14', co2Saved: 0.8, plasticSaved: 42 },
    { id: 2, original: 'Head & Shoulders Shampoo', swap: 'Ethique Shampoo Bar', category: 'Personal Care', ecoScoreBefore: 30, ecoScoreAfter: 98, xp: 100, date: '2026-02-13', co2Saved: 1.2, plasticSaved: 85 },
    { id: 3, original: 'Plastic Toothbrush', swap: 'Bamboo Toothbrush', category: 'Personal Care', ecoScoreBefore: 20, ecoScoreAfter: 99, xp: 100, date: '2026-02-12', co2Saved: 0.3, plasticSaved: 14 },
    { id: 4, original: 'Plastic Straws', swap: 'Stainless Steel Straws', category: 'Kitchen', ecoScoreBefore: 5, ecoScoreAfter: 95, xp: 100, date: '2026-02-11', co2Saved: 0.5, plasticSaved: 30 },
    { id: 5, original: 'Plastic Grocery Bag', swap: 'Organic Cotton Tote', category: 'Shopping', ecoScoreBefore: 10, ecoScoreAfter: 92, xp: 100, date: '2026-02-10', co2Saved: 3.5, plasticSaved: 120 },
    { id: 6, original: 'Plastic Cutlery', swap: 'Bamboo Travel Cutlery', category: 'Kitchen', ecoScoreBefore: 15, ecoScoreAfter: 97, xp: 100, date: '2026-02-09', co2Saved: 0.4, plasticSaved: 25 },
    { id: 7, original: 'Disposable Coffee Cup', swap: 'Reusable Bamboo Cup', category: 'Hydration', ecoScoreBefore: 12, ecoScoreAfter: 94, xp: 100, date: '2026-02-08', co2Saved: 1.1, plasticSaved: 35 },
    { id: 8, original: 'Cling Wrap', swap: 'Beeswax Wraps', category: 'Kitchen', ecoScoreBefore: 8, ecoScoreAfter: 90, xp: 100, date: '2026-02-07', co2Saved: 0.6, plasticSaved: 50 },
    { id: 9, original: 'Plastic Water Bottle', swap: 'Stainless Steel Bottle', category: 'Hydration', ecoScoreBefore: 10, ecoScoreAfter: 95, xp: 100, date: '2026-02-06', co2Saved: 0.8, plasticSaved: 42 },
    { id: 10, original: 'Body Wash (Plastic)', swap: 'Bar Soap (Package-Free)', category: 'Personal Care', ecoScoreBefore: 25, ecoScoreAfter: 96, xp: 100, date: '2026-02-05', co2Saved: 0.9, plasticSaved: 65 },
];

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

export default function EcoSwapPage() {
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredSwaps = useMemo(() =>
        activeFilter === 'All'
            ? SWAP_HISTORY
            : SWAP_HISTORY.filter(s => s.category === activeFilter),
        [activeFilter]
    );

    // Computed stats
    const totalSwaps = SWAP_HISTORY.length;
    const totalXP = SWAP_HISTORY.reduce((sum, s) => sum + s.xp, 0);
    const totalCO2 = SWAP_HISTORY.reduce((sum, s) => sum + s.co2Saved, 0).toFixed(1);
    const totalPlastic = SWAP_HISTORY.reduce((sum, s) => sum + s.plasticSaved, 0);
    const avgEcoImprovement = Math.round(
        SWAP_HISTORY.reduce((sum, s) => sum + (s.ecoScoreAfter - s.ecoScoreBefore), 0) / totalSwaps
    );

    // Category breakdown
    const categoryStats = useMemo(() => {
        const stats = {};
        SWAP_HISTORY.forEach(s => {
            if (!stats[s.category]) stats[s.category] = { count: 0, co2: 0, plastic: 0 };
            stats[s.category].count++;
            stats[s.category].co2 += s.co2Saved;
            stats[s.category].plastic += s.plasticSaved;
        });
        return stats;
    }, []);

    const maxCategoryCount = Math.max(...Object.values(categoryStats).map(s => s.count));

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
                        {Object.entries(categoryStats).map(([cat, stats]) => {
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
                        })}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Leaf size={18} /> Environmental Impact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
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
                    <div className="divide-y divide-border">
                        {filteredSwaps.map(swap => {
                            const colors = CATEGORY_COLORS[swap.category] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                            const Icon = CATEGORY_ICONS[swap.category] || Package;
                            const improvement = swap.ecoScoreAfter - swap.ecoScoreBefore;

                            return (
                                <div key={swap.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                                    {/* Icon */}
                                    <div className={`p-2.5 rounded-xl ${colors.bg} flex-shrink-0`}>
                                        <Icon size={20} className={colors.text} />
                                    </div>

                                    {/* Swap Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm text-muted-foreground line-through truncate">{swap.original}</span>
                                            <ArrowRight size={12} className="text-emerald-500 flex-shrink-0" />
                                            <span className="font-semibold text-sm truncate">{swap.swap}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{new Date(swap.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            <span>•</span>
                                            <Badge className={`text-xs ${colors.bg} ${colors.text}`}>{swap.category}</Badge>
                                        </div>
                                    </div>

                                    {/* Eco Score Progress */}
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
                                            +{swap.xp} XP
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
