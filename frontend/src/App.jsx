import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Camera, Trophy, Leaf, User, Sprout, Newspaper, ArrowRightLeft, Settings, LogOut } from 'lucide-react';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import CameraPage from './pages/CameraPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import NurseriesPage from './pages/NurseriesPage';
import NewsPage from './pages/NewsPage';
import EcoSwapPage from './pages/EcoSwapPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { cn } from './components/ui/Button'; // reusing cn utility

function Sidebar({ user, onLogout }) {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const displayName = user?.name || 'EcoWarrior';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
            <div className="h-16 flex items-center px-6 border-b border-border gap-2 text-primary font-bold text-xl">
                <Leaf className="w-6 h-6 fill-primary" />
                <span>GreenLoop</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1">
                <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive('/')} />
                <NavItem to="/map" icon={<MapIcon size={20} />} label="Conservation Map" active={isActive('/map')} />
                <NavItem to="/camera" icon={<Camera size={20} />} label="Log Activity" active={isActive('/camera')} />
                <NavItem to="/leaderboard" icon={<Trophy size={20} />} label="Leaderboard" active={isActive('/leaderboard')} />
                <NavItem to="/nurseries" icon={<Sprout size={20} />} label="Plant Nurseries" active={isActive('/nurseries')} />
                <NavItem to="/news" icon={<Newspaper size={20} />} label="Eco News" active={isActive('/news')} />
                <NavItem to="/eco-swaps" icon={<ArrowRightLeft size={20} />} label="Eco Swaps" active={isActive('/eco-swaps')} />
            </div>

            <div className="px-4 pb-2 space-y-1">
                <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" active={isActive('/settings')} />
                <button
                    onClick={() => { if (window.confirm('Are you sure you want to log out?')) onLogout(); }}
                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors text-red-500 hover:bg-red-50 hover:text-red-600 w-full"
                >
                    <LogOut size={20} />
                    <span>Log Out</span>
                </button>
            </div>

            <Link to="/profile" className="p-4 border-t border-border flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-sm text-foreground">{displayName}</div>
                    <div className="text-xs text-muted-foreground">{user?.email || 'View Profile'}</div>
                </div>
            </Link>
        </div>
    );
}

function NavItem({ to, icon, label, active }) {
    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            {icon}
            <span>{label}</span>
        </Link>
    )
}

function App() {
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
    };

    // Show login page if not authenticated
    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <Router>
            <div className="flex min-h-screen bg-background text-foreground">
                <Sidebar user={user} onLogout={handleLogout} />
                <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/camera" element={<CameraPage />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/nurseries" element={<NurseriesPage />} />
                        <Route path="/news" element={<NewsPage />} />
                        <Route path="/eco-swaps" element={<EcoSwapPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
