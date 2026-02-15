import React, { useState, useEffect } from 'react';
import { Medal, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../components/ui/Button';

const API_URL = 'http://localhost:3001';

export default function LeaderboardPage({ token }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/leaderboard`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUsers(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getLevelLabel = (xp) => {
        if (xp >= 5000) return 'Forest';
        if (xp >= 2000) return 'Tree';
        if (xp >= 500) return 'Sapling';
        if (xp >= 100) return 'Seedling';
        return 'Seed';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Leaderboards</h1>
                    <p className="text-muted-foreground">See who is making the biggest impact.</p>
                </div>
            </div>

            <Card className="overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center p-12 text-muted-foreground">
                        <Medal className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No data yet</p>
                        <p className="text-sm">Be the first to log activities and appear on the leaderboard!</p>
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center w-20">Rank</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Impact Level</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right w-32">Total XP</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {users.map((user, index) => (
                                    <tr key={user._id} className="border-b transition-colors hover:bg-muted/50">
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
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-foreground">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="secondary" className={cn(
                                                index < 3 ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                            )}>
                                                {getLevelLabel(user.totalXP)}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right font-bold text-emerald-600">
                                            {user.totalXP?.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
