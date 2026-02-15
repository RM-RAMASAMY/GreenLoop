import React, { useEffect, useRef } from 'react';

const VoiceVisualizer = ({ stream, isListening }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);

    useEffect(() => {
        if (!stream || !isListening) {
            cancelAnimationFrame(animationRef.current);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 50;

            // Draw central circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'; // Emerald-500 with opacity
            ctx.fill();
            ctx.strokeStyle = '#10b981'; // Emerald-500
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw frequency bars (vectors)
            const barWidth = (2 * Math.PI) / bufferLength;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2;
                const angle = i * barWidth;
                
                const x1 = centerX + Math.cos(angle) * radius;
                const y1 = centerY + Math.sin(angle) * radius;
                const x2 = centerX + Math.cos(angle) * (radius + barHeight);
                const y2 = centerY + Math.sin(angle) * (radius + barHeight);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = `rgba(16, 185, 129, ${barHeight / 100 + 0.5})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [stream, isListening]);

    return (
        <div className="flex justify-center items-center h-48 w-full">
            <canvas 
                ref={canvasRef} 
                width={300} 
                height={300} 
                className="max-w-full"
            />
        </div>
    );
};

export default VoiceVisualizer;
