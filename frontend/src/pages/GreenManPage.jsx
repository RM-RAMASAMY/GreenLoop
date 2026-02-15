import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Bot, VolumeX } from 'lucide-react';
import { Button } from '../components/ui/Button';
import VoiceVisualizer from '../components/VoiceVisualizer';

const API_URL = 'http://localhost:3001';

export default function GreenManPage({ token }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm The Green Man. Ask me anything about sustainability, recycling, or eco-friendly living!" }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audioStream, setAudioStream] = useState(null);
    const messagesEndRef = useRef(null);

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = useRef(SpeechRecognition ? new SpeechRecognition() : null);

    useEffect(() => {
        if (recognition.current) {
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US';

            recognition.current.onstart = () => {
                setIsListening(true);
            };
            recognition.current.onend = () => {
                setIsListening(false);
                stopAudioStream();
            };
            recognition.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                handleSendMessage(text);
            };
        }
        return () => {
            stopAudioStream();
        };
    }, []);

    const speak = (text, audioBase64 = null) => {
        // Stop any current speech
        window.speechSynthesis.cancel();

        if (audioBase64) {
            try {
                const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
                audio.onplay = () => setIsSpeaking(true);
                audio.onended = () => setIsSpeaking(false);
                audio.play();
                return;
            } catch (e) {
                console.error("Audio playback error:", e);
                // Fallback to browser TTS if audio fails
            }
        }

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            // Optional: Adjust voice/pitch/rate here
            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const startAudioStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);
            return true;
        } catch (error) {
            console.error("Error accessing microphone:", error);
            return false;
        }
    };

    const stopAudioStream = () => {
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
            setAudioStream(null);
        }
    };

    const toggleListening = async () => {
        if (isListening) {
            recognition.current?.stop();
            stopAudioStream(); // Ensure stream is stopped
        } else {
            const streamStarted = await startAudioStream();
            if (streamStarted) {
                recognition.current?.start();
            }
        }
    };

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setTranscript('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();

            const aiMessage = { role: 'assistant', content: data.reply || "I'm not sure how to answer that, but stay green!" };
            setMessages(prev => [...prev, aiMessage]);

            // Play audio if available, otherwise fallback to text
            speak(aiMessage.content, data.audio);

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = { role: 'assistant', content: "Sorry, I'm having trouble connecting to nature right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
            speak(errorMessage.content);
        } finally {
            setLoading(false);
        }
    };

    if (!recognition.current) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="p-4 bg-red-100 rounded-full text-red-600">
                    <MicOff size={48} />
                </div>
                <h2 className="text-xl font-bold">Browser Not Supported</h2>
                <p className="text-muted-foreground">
                    Your browser does not support Speech Recognition. Please try using Google Chrome or Microsoft Edge.
                </p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center relative overflow-hidden">

            {/* Main Visualizer - Centered */}
            <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 scale-150">
                <div className="relative flex items-center justify-center">
                    {/* Visualizer or Idle State */}
                    {isListening && audioStream ? (
                        <VoiceVisualizer stream={audioStream} isListening={isListening} />
                    ) : (
                        <div className="relative group cursor-pointer" onClick={toggleListening}>
                            <div className={`absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl transition-all duration-1000 ${isSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`} />
                            <div className={`relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-full shadow-2xl transition-transform duration-300 ${isSpeaking ? 'scale-110' : 'hover:scale-105'}`}>
                                <Bot size={64} className="text-white" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mic Control - Bottom Center */}
            <div className="mb-24 z-10">
                <Button
                    onClick={toggleListening}
                    size="lg"
                    className={`rounded-full h-24 w-24 shadow-2xl transition-all duration-500 flex items-center justify-center border-4 ${isListening
                        ? 'bg-red-500 hover:bg-red-600 border-red-200 animate-pulse'
                        : 'bg-white hover:bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}
                >
                    {isListening ? <MicOff size={40} className="text-white" /> : <Mic size={40} />}
                </Button>
            </div>

            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
            </div>

            {/* Optional: Stop Speaking Button (Absolute Positioned) */}
            {isSpeaking && (
                <div className="absolute top-4 right-4 z-20">
                    <Button variant="outline" size="sm" onClick={stopSpeaking} className="gap-2 text-red-500 border-red-200 bg-white/80 backdrop-blur-sm">
                        <VolumeX size={16} /> Stop Speaking
                    </Button>
                </div>
            )}
        </div>
    );
}
