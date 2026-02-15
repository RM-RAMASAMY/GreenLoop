import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Trophy, Leaf, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const API_URL = 'http://localhost:3001';

export default function HomePage({ token }) {
    const [stats, setStats] = useState({
        name: 'EcoWarrior', level: 'Seed', xp: 0, nextLevelXp: 100,
        streak: 0, totalActions: 0, totalSwaps: 0,
        xpData: [
            { name: 'Mon', xp: 0 }, { name: 'Tue', xp: 0 }, { name: 'Wed', xp: 0 },
            { name: 'Thu', xp: 0 }, { name: 'Fri', xp: 0 }, { name: 'Sat', xp: 0 }, { name: 'Sun', xp: 0 },
        ],
        impactData: [
            { name: 'Activities', value: 0, color: '#10B981' },
            { name: 'CO₂ Saved', value: 0, color: '#3B82F6' },
            { name: 'Plastic', value: 0, color: '#F59E0B' },
        ],
    });

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/api/user/me/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setStats(data);
            })
            .catch(err => console.error('Dashboard fetch error:', err));
    }, [token]);

    const xpProgress = stats?.nextLevelXp > 0 ? Math.round((stats.xp / stats.nextLevelXp) * 100) : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {stats.name}. Here's your environmental impact overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium">Total XP Earned</p>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                                <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            </div>
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <div className="text-2xl font-bold text-emerald-600">{(stats?.xp || 0).toLocaleString()}</div>
                            <span className="text-xs text-muted-foreground">XP</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">{stats?.totalActions || 0}</span>
                            <span className="ml-1">activities logged</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium">Current Level</p>
                            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                                <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold">{stats.level}</div>
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{stats.xp} XP</span>
                                <span>{stats.nextLevelXp} XP</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full">
                                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(xpProgress, 100)}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium">Eco Swaps</p>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Leaf className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{stats.totalSwaps}</div>
                        <p className="text-xs text-muted-foreground mt-1">Sustainable product swaps made</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Weekly XP Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={stats.xpData}>
                                <defs>
                                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Area type="monotone" dataKey="xp" stroke="#10B981" fillOpacity={1} fill="url(#colorXp)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Impact Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={stats.impactData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {stats.impactData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
