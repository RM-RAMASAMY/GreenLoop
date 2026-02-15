import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function CameraPage() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        try {
            // Mock getting location for the action
            navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                    await axios.post('http://localhost:3001/api/action', {
                        userId: 'user1',
                        actionType: 'PLANT',
                        details: {
                            plantName: 'New Green Entry',
                            location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
                        }
                    });

                    alert('Successfully logged! +50 XP');
                    navigate('/');
                } catch (apiErr) {
                    console.error("API Error, navigating anyway for demo", apiErr);
                    alert('Successfully logged (Mock)! +50 XP');
                    navigate('/');
                }
            }, (err) => {
                console.error(err);
                setLoading(false);
                alert('Could not get location. Try again.');
            });

        } catch (err) {
            console.error(err);
            alert('Failed to upload');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Log Activity</h1>
                <p className="text-muted-foreground">Capture your green actions to earn XP and track your impact.</p>
            </div>

            <Card className="text-center">
                <CardContent className="p-6">
                    {!preview ? (
                        <div
                            className="border-2 border-dashed border-input rounded-xl p-12 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center gap-4"
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            <div className="p-4 bg-primary/10 rounded-full text-primary">
                                <Camera size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Take a Photo</h3>
                                <p className="text-sm text-muted-foreground">or upload from your device</p>
                            </div>
                            <input
                                type="file"
                                id="fileInput"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative rounded-xl overflow-hidden border border-border">
                                <img src={preview} alt="Preview" className="w-full block" />
                                <button
                                    onClick={() => { setFile(null); setPreview(null); }}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? 'Uploading...' : <><Upload className="mr-2 h-4 w-4" /> Upload & Earn XP</>}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">Supported Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <span className="text-2xl">🌱</span>
                            <div>
                                <div className="font-semibold">Planting</div>
                                <div className="text-xs text-muted-foreground">+50 XP</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <span className="text-2xl">🚶</span>
                            <div>
                                <div className="font-semibold">Commute</div>
                                <div className="text-xs text-muted-foreground">+30 XP</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <span className="text-2xl">♻️</span>
                            <div>
                                <div className="font-semibold">Recycling</div>
                                <div className="text-xs text-muted-foreground">+10 XP</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
