import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Medal, Filter } from 'lucide-react';

export default function LeaderboardPage() {
    const [data, setData] = useState({ neighborhood: [], campus: [], company: [] });
    const [activeTab, setActiveTab] = useState('neighborhood');

    useEffect(() => {
        axios.get('http://localhost:3001/api/leaderboard')
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    const getList = () => data[activeTab] || [];

    return (
        <div>
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Leaderboards</h1>
                    <p>See who is making the biggest impact.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', color: '#374151', border: '1px solid #E5E7EB' }}>
                    <Filter size={18} /> Filter
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', padding: '0 1rem' }}>
                    {['neighborhood', 'campus', 'company'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '1.25rem 1.5rem',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab ? 600 : 500,
                                color: activeTab === tab ? '#10B981' : '#6B7280',
                                borderBottom: activeTab === tab ? '2px solid #10B981' : '2px solid transparent',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <table style={{ width: '100%' }}>
                    <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                            <th style={{ width: 80, paddingLeft: '2rem', textAlign: 'center' }}>Rank</th>
                            <th>Name</th>
                            <th>Impact Level</th>
                            <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Total XP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getList().map((user, index) => (
                            <tr key={user.id}>
                                <td style={{ paddingLeft: '2rem', textAlign: 'center' }}>
                                    {index < 3 ? (
                                        <div style={{
                                            width: 32, height: 32, margin: '0 auto',
                                            background: index === 0 ? '#FEF3C7' : index === 1 ? '#F3F4F6' : '#FFEDD5',
                                            color: index === 0 ? '#D97706' : index === 1 ? '#4B5563' : '#C2410C',
                                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                        }}>
                                            <Medal size={16} />
                                        </div>
                                    ) : (
                                        <span style={{ color: '#6B7280', fontWeight: 600 }}>{index + 1}</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, color: '#111827' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Member since 2024</div>
                                </td>
                                <td>
                                    <span className={`badge ${index < 3 ? 'badge-green' : 'badge-blue'}`}>
                                        {index < 3 ? 'Elite Eco-Hero' : 'Contributor'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: '2rem', fontWeight: 700, color: '#10B981' }}>
                                    {user.xp.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
