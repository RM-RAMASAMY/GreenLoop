import React, { useState } from 'react';
import {
    Settings, Bell, Moon, Sun, Globe, Shield, Eye, Smartphone,
    Mail, MapPin, Trash2, Download, ChevronRight, ToggleLeft, ToggleRight, Palette
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

function ToggleSwitch({ enabled, onChange, label, description, icon: Icon }) {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="p-2 bg-muted rounded-lg">
                        <Icon size={16} className="text-muted-foreground" />
                    </div>
                )}
                <div>
                    <div className="text-sm font-medium">{label}</div>
                    {description && <div className="text-xs text-muted-foreground">{description}</div>}
                </div>
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
            >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}

export default function SettingsPage() {
    // Notification settings
    const [pushNotifs, setPushNotifs] = useState(true);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);
    const [swapAlerts, setSwapAlerts] = useState(true);
    const [leaderboardAlerts, setLeaderboardAlerts] = useState(true);

    // Privacy settings
    const [publicProfile, setPublicProfile] = useState(true);
    const [showLeaderboard, setShowLeaderboard] = useState(true);
    const [shareActivity, setShareActivity] = useState(false);
    const [locationTracking, setLocationTracking] = useState(true);

    // Appearance
    const [darkMode, setDarkMode] = useState(false);
    const [compactMode, setCompactMode] = useState(false);

    // Extension
    const [autoDetect, setAutoDetect] = useState(true);
    const [showPopup, setShowPopup] = useState(true);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Settings className="text-muted-foreground" /> Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your GreenLoop account preferences and privacy settings.
                </p>
            </div>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Bell size={18} /> Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                    <ToggleSwitch icon={Bell} enabled={pushNotifs} onChange={setPushNotifs} label="Push Notifications" description="Get notified about new achievements and milestones" />
                    <ToggleSwitch icon={Mail} enabled={emailNotifs} onChange={setEmailNotifs} label="Email Notifications" description="Receive activity summaries via email" />
                    <ToggleSwitch icon={Mail} enabled={weeklyDigest} onChange={setWeeklyDigest} label="Weekly Digest" description="A weekly summary of your eco impact" />
                    <ToggleSwitch icon={Smartphone} enabled={swapAlerts} onChange={setSwapAlerts} label="Swap Alerts" description="Get notified when new eco swaps are available" />
                    <ToggleSwitch icon={Smartphone} enabled={leaderboardAlerts} onChange={setLeaderboardAlerts} label="Leaderboard Updates" description="Know when your ranking changes" />
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Palette size={18} /> Appearance
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                    <ToggleSwitch icon={Moon} enabled={darkMode} onChange={setDarkMode} label="Dark Mode" description="Switch to a darker color scheme" />
                    <ToggleSwitch icon={Eye} enabled={compactMode} onChange={setCompactMode} label="Compact Mode" description="Reduce spacing for a denser layout" />
                </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield size={18} /> Privacy
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                    <ToggleSwitch icon={Eye} enabled={publicProfile} onChange={setPublicProfile} label="Public Profile" description="Allow others to see your profile and stats" />
                    <ToggleSwitch icon={Globe} enabled={showLeaderboard} onChange={setShowLeaderboard} label="Show on Leaderboard" description="Appear in public leaderboard rankings" />
                    <ToggleSwitch icon={Globe} enabled={shareActivity} onChange={setShareActivity} label="Share Activity Feed" description="Let friends see your recent eco actions" />
                    <ToggleSwitch icon={MapPin} enabled={locationTracking} onChange={setLocationTracking} label="Location Services" description="Used for nearby nurseries and activity logging" />
                </CardContent>
            </Card>

            {/* Chrome Extension */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Smartphone size={18} /> Chrome Extension
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                    <ToggleSwitch icon={Eye} enabled={autoDetect} onChange={setAutoDetect} label="Auto-Detect Products" description="Automatically scan shopping pages for eco swap suggestions" />
                    <ToggleSwitch icon={Bell} enabled={showPopup} onChange={setShowPopup} label="Show Swap Popup" description="Display a popup when an eco-friendly alternative is found" />
                </CardContent>
            </Card>

            {/* Data & Account */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield size={18} /> Data & Account
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-between h-11 text-sm">
                        <span className="flex items-center gap-2"><Download size={16} /> Export My Data</span>
                        <ChevronRight size={16} className="text-muted-foreground" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between h-11 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                        <span className="flex items-center gap-2"><Trash2 size={16} /> Delete Account</span>
                        <ChevronRight size={16} />
                    </Button>
                </CardContent>
            </Card>

            {/* App Info */}
            <div className="text-center text-xs text-muted-foreground space-y-1 pb-4">
                <p>GreenLoop v1.0.0 • SF Hacks 2026</p>
                <p>Made with 💚 for a greener planet</p>
            </div>
        </div>
    );
}
