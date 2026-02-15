import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Trophy, Leaf, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function HomePage() {
    const [user, setUser] = useState({
        name: 'EcoWarrior', level: 'Guardian', xp: 4250, nextLevelXp: 5000,
        history: [] // Mock data if API fails
    });

    useEffect(() => {
        // Keeping the fetch logic, but providing defaults if it fails since backend might not be running
        const fetchUser = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/user/user1');
                if (res.data) {
                    setUser({
                        ...res.data,
                        xp: res.data.totalXP || 4250,
                        nextLevelXp: 5000,
                        history: res.data.history || []
                    });
                }
            } catch (err) { console.error("Backend not reachable, using mock data"); }
        };
        fetchUser();
    }, []);

    // Mock Data for Charts
    const xpData = [
        { name: 'Mon', xp: 400 },
        { name: 'Tue', xp: 300 },
        { name: 'Wed', xp: 600 },
        { name: 'Thu', xp: 200 },
        { name: 'Fri', xp: 500 },
        { name: 'Sat', xp: 800 },
        { name: 'Sun', xp: 950 },
    ];

    const impactData = [
        { name: 'Trees', value: 30, color: '#10B981' }, // emerald-500
        { name: 'CO2 Saved', value: 45, color: '#3B82F6' }, // blue-500
        { name: 'Plastic', value: 25, color: '#F59E0B' }, // amber-500
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user.name}. Here's your environmental impact overview.</p>
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
                            <div className="text-2xl font-bold text-emerald-600">{user.xp.toLocaleString()}</div>
                            <span className="text-xs text-muted-foreground">XP</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">+12%</span>
                            <span className="ml-1">from last week</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium">Impact Score</p>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Leaf className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                            </div>
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <div className="text-2xl font-bold">{(user.xp * 0.15).toFixed(0)}</div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Equivalent to planting 14 trees 🌳</p>
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
                        <div className="text-2xl font-bold capitalize">{user.level}</div>
                        <div className="w-full bg-secondary h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">350 XP to next level</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Weekly Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={xpData}>
                                    <defs>
                                        <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ color: '#6B7280' }}
                                    />
                                    <Area type="monotone" dataKey="xp" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Impact Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={impactData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {impactData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Table */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Action</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Details</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">XP</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {user.history.map((item, idx) => (
                                    <tr key={idx} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 font-medium">{item.action}</td>
                                        <td className="p-4 text-muted-foreground">{item.details?.plantName || item.details?.productName || 'General Action'}</td>
                                        <td className="p-4 text-muted-foreground">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold text-emerald-600">+{item.xp}</td>
                                        <td className="p-4 text-right">
                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Completed</Badge>
                                        </td>
                                    </tr>
                                ))}
                                {user.history.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                            No recent activity. Start logging to earn XP!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
