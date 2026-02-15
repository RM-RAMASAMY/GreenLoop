import React, { useState, useEffect } from 'react';
import { User, MapPin, Calendar, Award, TrendingUp, Clock, Leaf, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const API_URL = 'http://localhost:3001';

const ProfilePage = ({ token, user: appUser }) => {
    const [profile, setProfile] = useState(null);
    const [recentActions, setRecentActions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        Promise.all([
            fetch(`${API_URL}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch(`${API_URL}/api/actions?limit=10`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ])
            .then(([userData, actions]) => {
                setProfile(userData);
                if (Array.isArray(actions)) setRecentActions(actions);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const displayUser = profile || appUser || { name: 'EcoWarrior', email: 'demo@greenloop.app' };
    const displayName = displayUser.name || 'EcoWarrior';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const joinDate = displayUser.createdAt
        ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Jan 2026';

    // Derive achievements from actions
    const achievements = [];
    if (recentActions.length >= 1) achievements.push({ id: 1, name: 'First Step', icon: <Leaf size={20} />, description: 'Logged your first eco activity' });
    if (recentActions.length >= 5) achievements.push({ id: 2, name: 'Getting Started', icon: <TrendingUp size={20} />, description: 'Logged 5 activities' });
    if (recentActions.some(a => a.actionType === 'PLANT')) achievements.push({ id: 3, name: 'Tree Hugger', icon: <Leaf size={20} />, description: 'Planted a tree' });
    if (recentActions.some(a => a.actionType === 'CLEANUP')) achievements.push({ id: 4, name: 'Clean Sweep', icon: <Clock size={20} />, description: 'Participated in a cleanup' });
    if ((displayUser.totalXP || 0) >= 500) achievements.push({ id: 5, name: 'Rising Star', icon: <Award size={20} />, description: 'Earned 500+ XP' });

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const actionLabels = {
        PLANT: 'Tree Planting', SWAP: 'Eco Swap', WALK: 'Green Commute',
        REFILL: 'Water Refill', COMPOST: 'Composting', CLEANUP: 'Cleanup',
        OBSERVE: 'Observation', OTHER: 'Activity'
    };

    const actionXP = {
        PLANT: 50, SWAP: 100, WALK: 30, REFILL: 10, COMPOST: 20, CLEANUP: 40, OBSERVE: 15
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <Card className="border-none shadow-md">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                    {displayUser.avatar ? (
                        <img src={displayUser.avatar} alt={displayName} className="w-24 h-24 rounded-full object-cover shadow-lg" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {initials}
                        </div>
                    )}
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-foreground mb-2">{displayName}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin size={16} /> San Francisco, CA</span>
                            <span className="flex items-center gap-1"><Calendar size={16} /> Joined {joinDate}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total XP" value={(displayUser.totalXP || 0).toLocaleString()} icon={<Leaf size={24} className="text-emerald-500" />} />
                <StatCard title="Activities" value={recentActions.length} icon={<TrendingUp size={24} className="text-blue-500" />} />
                <StatCard title="Streak" value={`${displayUser.streak || 0} days`} icon={<Award size={24} className="text-amber-500" />} />
                <StatCard title="Current Level" value={displayUser.level || 'Seed'} icon={<User size={24} className="text-purple-500" />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentActions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Leaf className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p>No activities yet. Start logging!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActions.map(action => (
                                    <div key={action._id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
                                        <div>
                                            <div className="font-semibold text-foreground">{actionLabels[action.actionType] || action.actionType}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {action.details?.description || action.details?.plantName || 'Eco activity'} • {timeAgo(action.createdAt)}
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                            +{action.xpGained || actionXP[action.actionType] || 5} pts
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {achievements.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Award className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Log activities to earn achievements!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {achievements.map(achievement => (
                                    <div key={achievement.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="p-2 bg-amber-100 rounded-lg shrink-0 text-amber-600">
                                            {achievement.icon}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-foreground">{achievement.name}</div>
                                            <div className="text-xs text-muted-foreground">{achievement.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <Card>
        <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
                <div className="text-2xl font-bold text-foreground">{value}</div>
            </div>
        </CardContent>
    </Card>
);

export default ProfilePage;
