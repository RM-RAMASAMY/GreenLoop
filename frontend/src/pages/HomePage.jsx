import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Trophy, Leaf, Zap, TrendingUp } from 'lucide-react';

export default function HomePage() {
    const [user, setUser] = useState({
        name: 'Loading...', level: '...', xp: 0, nextLevelXp: 5000,
        history: []
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/user/user1');
                setUser({
                    ...res.data,
                    xp: res.data.totalXP,
                    nextLevelXp: 5000,
                    history: res.data.history || []
                });
            } catch (err) { console.error(err); }
        };
        fetchUser();
    }, []);

    // Mock Data for Charts
    const xpData = [
        { name: 'Mon', xp: 400 },
        { name: 'Tue', xp: 300 },
        { name: 'Wed', xp: 600 }, // Spike
        { name: 'Thu', xp: 200 },
        { name: 'Fri', xp: 500 },
        { name: 'Sat', xp: 800 },
        { name: 'Sun', xp: user.xp % 1000 + 400 }, // Dynamic tip
    ];

    const impactData = [
        { name: 'Trees', value: 30, color: '#10B981' },
        { name: 'CO2 Saved', value: 45, color: '#3B82F6' },
        { name: 'Plastic', value: 25, color: '#F59E0B' },
    ];

    return (
        <div>
            <div className="header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Dashboard</h1>
                <p>Welcome back, {user.name}. Here's your environmental impact overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Total XP Earned</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#10B981' }}>{user.xp.toLocaleString()}</h2>
                        </div>
                        <div style={{ padding: '0.5rem', background: '#D1FAE5', borderRadius: '8px' }}>
                            <Zap size={24} color="#059669" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <TrendingUp size={16} color="#10B981" />
                        <span style={{ color: '#10B981', fontWeight: 600 }}>+12%</span>
                        <span style={{ color: '#6B7280' }}>from last week</span>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Impact Score</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{(user.xp * 0.15).toFixed(0)}</h2>
                        </div>
                        <div style={{ padding: '0.5rem', background: '#DBEAFE', borderRadius: '8px' }}>
                            <Leaf size={24} color="#2563EB" />
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Equivalent to plotting 14 trees 🌳</p>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Current Level</p>
                            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', textTransform: 'capitalize' }}>{user.level}</h2>
                        </div>
                        <div style={{ padding: '0.5rem', background: '#FEF3C7', borderRadius: '8px' }}>
                            <Trophy size={24} color="#D97706" />
                        </div>
                    </div>
                    <div style={{ width: '100%', background: '#E5E7EB', height: 6, borderRadius: 3, marginTop: 8 }}>
                        <div style={{ width: '60%', background: '#F59E0B', height: '100%', borderRadius: 3 }} />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid-2" style={{ marginBottom: '2rem', gridTemplateColumns: '2fr 1fr' }}>
                <div className="card">
                    <h3>Weekly Activity</h3>
                    <div style={{ height: 300, width: '100%' }}>
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
                </div>

                <div className="card">
                    <h3>Impact Breakdown</h3>
                    <div style={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB' }}>
                    <h3 style={{ margin: 0 }}>Recent Transactions</h3>
                </div>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                            <th style={{ paddingLeft: '2rem' }}>Action</th>
                            <th>Details</th>
                            <th>Date</th>
                            <th>XP</th>
                            <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {user.history.map((item, idx) => (
                            <tr key={idx}>
                                <td style={{ paddingLeft: '2rem', fontWeight: 500 }}>{item.action}</td>
                                <td style={{ color: '#6B7280' }}>{item.details?.plantName || item.details?.productName || 'General Action'}</td>
                                <td style={{ color: '#6B7280' }}>{new Date(item.date).toLocaleDateString()}</td>
                                <td style={{ fontWeight: 600, color: '#10B981' }}>+{item.xp}</td>
                                <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                                    <span className="badge badge-green">Completed</span>
                                </td>
                            </tr>
                        ))}
                        {user.history.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>No activity yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
