import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Bot, User, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const API_URL = 'http://localhost:3001';

export default function GreenManPage({ token }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm The Green Man. Ask me anything about sustainability, recycling, or eco-friendly living!" }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = useRef(SpeechRecognition ? new SpeechRecognition() : null);

    useEffect(() => {
        if (recognition.current) {
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US';

            recognition.current.onstart = () => setIsListening(true);
            recognition.current.onend = () => setIsListening(false);
            recognition.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                handleSendMessage(text);
            };
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop current speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            // Optional: Adjust voice/pitch/rate here
            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognition.current?.stop();
        } else {
            recognition.current?.start();
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
            speak(aiMessage.content);
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
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <span className="text-emerald-600">The Green Man</span> 🌿
                    </h1>
                    <p className="text-muted-foreground">Your AI sustainability assistant. Talk to me!</p>
                </div>
                {isSpeaking && (
                    <Button variant="outline" size="sm" onClick={stopSpeaking} className="gap-2 text-red-500 border-red-200">
                        <VolumeX size={16} /> Stop Speaking
                    </Button>
                )}
            </div>

            {/* Chat Area */}
            <Card className="flex-1 overflow-hidden border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white">
                <CardContent className="p-4 h-full overflow-y-auto space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-emerald-600 text-white'
                                }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-3 rounded-2xl ${
                                    msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                        : 'bg-white border border-emerald-100 shadow-sm rounded-tl-none'
                                }`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white border border-emerald-100 shadow-sm rounded-2xl rounded-tl-none p-4 flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
            </Card>

            {/* Input Area */}
            <div className="flex gap-2">
                <Button
                    onClick={toggleListening}
                    size="lg"
                    className={`rounded-full h-14 w-14 shadow-lg transition-all duration-300 ${
                        isListening 
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                            : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                </Button>
                
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(transcript); }} 
                    className="flex-1 flex gap-2"
                >
                    <input
                        type="text"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Type your message..."}
                        className="flex-1 rounded-full border border-input bg-card px-6 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        disabled={loading}
                    />
                    <Button 
                        type="submit" 
                        size="lg" 
                        className="rounded-full h-14 w-14 px-0 bg-primary hover:bg-primary/90"
                        disabled={!transcript.trim() || loading}
                    >
                        <Send size={20} />
                    </Button>
                </form>
            </div>
        </div>
    );
}
