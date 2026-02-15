import React, { useState, useEffect } from 'react';
import {
    Settings, Bell, Moon, Sun, Globe, Shield, Eye, Smartphone,
    Mail, MapPin, Trash2, Download, ChevronRight, ToggleLeft, ToggleRight, Palette, Loader2, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const API_URL = 'http://localhost:3001';

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

export default function SettingsPage({ token }) {
    const [settings, setSettings] = useState({
        pushNotifications: true,
        emailNotifications: true,
        weeklyDigest: false,
        swapAlerts: true,
        leaderboardUpdates: false,
        darkMode: false,
        compactMode: false,
        publicProfile: true,
        showOnLeaderboard: true,
        shareActivity: false,
        locationServices: true,
        autoDetectProducts: true,
        showSwapPopup: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Fetch settings from backend
    useEffect(() => {
        if (!token) { setLoading(false); return; }
        fetch(`${API_URL}/api/user/me/settings`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setSettings(prev => ({ ...prev, ...data }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    // Save individual setting to backend
    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);

        if (token) {
            setSaving(true);
            fetch(`${API_URL}/api/user/me/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ [key]: value })
            })
                .then(res => res.json())
                .then(() => {
                    setSaving(false);
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                })
                .catch(() => setSaving(false));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Settings className="text-muted-foreground" /> Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your GreenLoop account preferences and privacy settings.
                    </p>
                </div>
                {saving && (
                    <Badge className="bg-amber-100 text-amber-700 animate-pulse">
                        <Loader2 size={12} className="mr-1 animate-spin" /> Saving...
                    </Badge>
                )}
                {saved && (
                    <Badge className="bg-emerald-100 text-emerald-700">
                        <Check size={12} className="mr-1" /> Saved
                    </Badge>
                )}
            </div>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Bell size={18} /> Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                    <ToggleSwitch icon={Bell} enabled={settings.pushNotifications} onChange={(v) => updateSetting('pushNotifications', v)} label="Push Notifications" description="Get notified about new achievements and milestones" />
                    <ToggleSwitch icon={Mail} enabled={settings.emailNotifications} onChange={(v) => updateSetting('emailNotifications', v)} label="Email Notifications" description="Receive activity summaries via email" />
                    <ToggleSwitch icon={Mail} enabled={settings.weeklyDigest} onChange={(v) => updateSetting('weeklyDigest', v)} label="Weekly Digest" description="A weekly summary of your eco impact" />
                    <ToggleSwitch icon={Smartphone} enabled={settings.swapAlerts} onChange={(v) => updateSetting('swapAlerts', v)} label="Swap Alerts" description="Get notified when new eco swaps are available" />
                    <ToggleSwitch icon={Smartphone} enabled={settings.leaderboardUpdates} onChange={(v) => updateSetting('leaderboardUpdates', v)} label="Leaderboard Updates" description="Know when your ranking changes" />
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
                    <ToggleSwitch icon={Moon} enabled={settings.darkMode} onChange={(v) => updateSetting('darkMode', v)} label="Dark Mode" description="Switch to a darker color scheme" />
                    <ToggleSwitch icon={Eye} enabled={settings.compactMode} onChange={(v) => updateSetting('compactMode', v)} label="Compact Mode" description="Reduce spacing for a denser layout" />
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
                    <ToggleSwitch icon={Eye} enabled={settings.publicProfile} onChange={(v) => updateSetting('publicProfile', v)} label="Public Profile" description="Allow others to see your profile and stats" />
                    <ToggleSwitch icon={Globe} enabled={settings.showOnLeaderboard} onChange={(v) => updateSetting('showOnLeaderboard', v)} label="Show on Leaderboard" description="Appear in public leaderboard rankings" />
                    <ToggleSwitch icon={Globe} enabled={settings.shareActivity} onChange={(v) => updateSetting('shareActivity', v)} label="Share Activity Feed" description="Let friends see your recent eco actions" />
                    <ToggleSwitch icon={MapPin} enabled={settings.locationServices} onChange={(v) => updateSetting('locationServices', v)} label="Location Services" description="Used for nearby nurseries and activity logging" />
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
                    <ToggleSwitch icon={Eye} enabled={settings.autoDetectProducts} onChange={(v) => updateSetting('autoDetectProducts', v)} label="Auto-Detect Products" description="Automatically scan shopping pages for eco swap suggestions" />
                    <ToggleSwitch icon={Bell} enabled={settings.showSwapPopup} onChange={(v) => updateSetting('showSwapPopup', v)} label="Show Swap Popup" description="Display a popup when an eco-friendly alternative is found" />
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
