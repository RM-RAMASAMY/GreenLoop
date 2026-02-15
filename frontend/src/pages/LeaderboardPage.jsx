import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Medal, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../components/ui/Button';

export default function LeaderboardPage() {
    const [data, setData] = useState({ neighborhood: [], campus: [], company: [] });
    const [activeTab, setActiveTab] = useState('neighborhood');

    useEffect(() => {
        axios.get('http://localhost:3001/api/leaderboard')
            .then(res => setData(res.data))
            .catch(err => {
                console.error("Using mock leaderboard data");
                setData({
                    neighborhood: [
                        { id: 1, name: 'EcoWarrior', xp: 4250 },
                        { id: 2, name: 'GreenThumb', xp: 3800 },
                        { id: 3, name: 'NatureLover', xp: 3500 },
                        { id: 4, name: 'RecycleKing', xp: 2100 },
                        { id: 5, name: 'SolarPower', xp: 1500 },
                    ],
                    campus: [],
                    company: []
                });
            });
    }, []);

    const getList = () => data[activeTab] || [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Leaderboards</h1>
                    <p className="text-muted-foreground">See who is making the biggest impact.</p>
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="flex border-b border-border bg-muted/30">
                    {['neighborhood', 'campus', 'company'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-4 cursor-pointer font-medium text-sm capitalize transition-all border-b-2",
                                activeTab === tab
                                    ? "border-primary text-primary bg-background"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center w-20">Rank</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Impact Level</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right w-32">Total XP</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {getList().map((user, index) => (
                                <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 text-center">
                                        {index < 3 ? (
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold",
                                                index === 0 ? "bg-amber-100 text-amber-600" :
                                                    index === 1 ? "bg-slate-100 text-slate-600" :
                                                        "bg-orange-100 text-orange-600"
                                            )}>
                                                <Medal size={16} />
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground font-semibold">{index + 1}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-foreground">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">Member since 2024</div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="secondary" className={cn(
                                            index < 3 ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                        )}>
                                            {index < 3 ? 'Elite Eco-Hero' : 'Contributor'}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right font-bold text-emerald-600">
                                        {user.xp.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
