import React from 'react';
import { User, MapPin, Calendar, Award, TrendingUp, Clock, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const ProfilePage = () => {
    // Mock user data
    const user = {
        name: "EcoWarrior",
        email: "eco.warrior@example.com",
        joinDate: "Jan 2024",
        avatar: null,
        location: "San Francisco, CA",
        stats: {
            totalImpact: "1,250 kg CO2",
            activitiesLogged: 42,
            localRank: 5,
            level: "Guardian of the Grove"
        },
        achievements: [
            { id: 1, name: "Early Bird", icon: <Clock size={20} />, description: "Logged an activity before 6 AM" },
            { id: 2, name: "Tree Hugger", icon: <Leaf size={20} />, description: "Visited 10 protected trees" },
            { id: 3, name: "Data Contributor", icon: <TrendingUp size={20} />, description: "Logged 50 data points" }
        ],
        recentActivity: [
            { id: 101, type: "Tree Log", location: "Golden Gate Park", date: "2 days ago", points: +50 },
            { id: 102, type: "Cleanup", location: "Ocean Beach", date: "5 days ago", points: +120 },
            { id: 103, type: "Observation", location: "Twin Peaks", date: "1 week ago", points: +30 }
        ]
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <Card className="border-none shadow-md">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <User size={48} className="text-slate-400" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-foreground mb-2">{user.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin size={16} /> {user.location}</span>
                            <span className="flex items-center gap-1"><Calendar size={16} /> Joined {user.joinDate}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Impact" value={user.stats.totalImpact} icon={<Leaf size={24} className="text-emerald-500" />} />
                <StatCard title="Activities" value={user.stats.activitiesLogged} icon={<TrendingUp size={24} className="text-blue-500" />} />
                <StatCard title="Local Rank" value={`#${user.stats.localRank}`} icon={<Award size={24} className="text-amber-500" />} />
                <StatCard title="Current Level" value={user.stats.level} icon={<User size={24} className="text-purple-500" />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {user.recentActivity.map(activity => (
                                <div key={activity.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
                                    <div>
                                        <div className="font-semibold text-foreground">{activity.type}</div>
                                        <div className="text-sm text-muted-foreground">{activity.location} • {activity.date}</div>
                                    </div>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                        +{activity.points} pts
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {user.achievements.map(achievement => (
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
