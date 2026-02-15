import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, AlertCircle } from 'lucide-react';

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
        <div>
            <div className="header">
                <h1>Log Activity</h1>
                <p>Capture your green actions to earn XP and track your impact.</p>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                {!preview ? (
                    <div
                        style={{
                            border: '2px dashed #E5E7EB',
                            borderRadius: '12px',
                            padding: '3rem',
                            cursor: 'pointer',
                            background: '#F9FAFB',
                            transition: 'background 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                        onClick={() => document.getElementById('fileInput').click()}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F3F4F6'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    >
                        <div style={{ padding: '1rem', background: '#DBEAFE', borderRadius: '50%', color: '#3B82F6' }}>
                            <Camera size={32} />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>Take a Photo</h3>
                            <p style={{ fontSize: '0.875rem' }}>or upload from your device</p>
                        </div>
                        <input
                            type="file"
                            id="fileInput"
                            accept="image/*"
                            capture="environment"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    <div>
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #E5E7EB' }}>
                            <img src={preview} alt="Preview" style={{ width: '100%', display: 'block' }} />
                            <button
                                onClick={() => { setFile(null); setPreview(null); }}
                                style={{
                                    position: 'absolute', top: 10, right: 10,
                                    background: 'rgba(0,0,0,0.6)', color: 'white',
                                    border: 'none', borderRadius: '50%', width: 32, height: 32,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                className="btn-primary"
                                onClick={handleUpload}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Uploading...' : <><Upload size={18} /> Upload & Earn XP</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supported Actions</h3>
                <div className="grid-3" style={{ marginTop: '1rem' }}>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🌱</span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600 }}>Planting</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>+50 XP</div>
                        </div>
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🚶</span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600 }}>Commute</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>+30 XP</div>
                        </div>
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>♻️</span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600 }}>Recycling</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>+10 XP</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
