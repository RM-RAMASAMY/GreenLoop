import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Camera, Trophy, Leaf, User } from 'lucide-react';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import CameraPage from './pages/CameraPage';
import LeaderboardPage from './pages/LeaderboardPage';

function Sidebar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="sidebar">
            <div className="brand">
                <Leaf color="#10B981" size={24} fill="#10B981" />
                <span>GreenLoop</span>
            </div>

            <div className="nav-links">
                <Link to="/" className={`nav-item ${isActive('/')}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link to="/map" className={`nav-item ${isActive('/map')}`}>
                    <MapIcon size={20} />
                    <span>Conservation Map</span>
                </Link>
                <Link to="/camera" className={`nav-item ${isActive('/camera')}`}>
                    <Camera size={20} />
                    <span>Log Activity</span>
                </Link>
                <Link to="/leaderboard" className={`nav-item ${isActive('/leaderboard')}`}>
                    <Trophy size={20} />
                    <span>Leaderboard</span>
                </Link>
            </div>

            <div className="user-profile">
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>EcoWarrior</div>
                    <div style={{ fontSize: '0.75rem' }}>View Profile</div>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <div className="dashboard-container">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/camera" element={<CameraPage />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
