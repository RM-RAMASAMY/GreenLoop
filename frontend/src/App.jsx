import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Camera, Trophy, Leaf, User, Sprout, Newspaper } from 'lucide-react';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import CameraPage from './pages/CameraPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import NurseriesPage from './pages/NurseriesPage';
import NewsPage from './pages/NewsPage';
import { cn } from './components/ui/Button'; // reusing cn utility

function Sidebar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

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
            </div>

            <Link to="/profile" className="p-4 border-t border-border flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-sm text-foreground">EcoWarrior</div>
                    <div className="text-xs text-muted-foreground">View Profile</div>
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
    return (
        <Router>
            <div className="flex min-h-screen bg-background text-foreground">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/camera" element={<CameraPage />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/nurseries" element={<NurseriesPage />} />
                        <Route path="/news" element={<NewsPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
