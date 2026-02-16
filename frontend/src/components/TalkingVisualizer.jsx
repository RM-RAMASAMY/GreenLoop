import React, { useEffect, useRef } from 'react';

const TalkingVisualizer = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let bars = [];
        const numBars = 50; // Increased number of bars
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 60; // Slightly larger base circle

        // Initialize bars with random phases
        for (let i = 0; i < numBars; i++) {
            bars.push({
                angle: (i / numBars) * Math.PI * 2,
                height: Math.random() * 20,
                speed: 0.1 + Math.random() * 0.2, // Random speed for each bar
                phase: Math.random() * Math.PI * 2
            });
        }

        const draw = (time) => {
            animationRef.current = requestAnimationFrame((t) => draw(t));

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw central pulsing circle
            const pulse = Math.sin(time * 0.005) * 5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + pulse, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.3)'; // Emerald-500
            ctx.fill();

            // Draw Center Icon Placeholder (optional, or just the circle)
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#10b981'; // Emerald-500
            ctx.fill();

            // Draw radiating bars
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';

            bars.forEach((bar) => {
                // Simulate audio reactivity with sine waves
                const dynamicHeight = 10 + Math.sin(time * 0.01 * bar.speed + bar.phase) * 20 + Math.random() * 15;

                const startX = centerX + Math.cos(bar.angle) * radius;
                const startY = centerY + Math.sin(bar.angle) * radius;

                const endX = centerX + Math.cos(bar.angle) * (radius + dynamicHeight);
                const endY = centerY + Math.sin(bar.angle) * (radius + dynamicHeight);

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);

                // Gradient color for bars
                const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                gradient.addColorStop(0, '#10b981');
                gradient.addColorStop(1, '#6ee7b7'); // Emerald-300
                ctx.strokeStyle = gradient;

                ctx.stroke();
            });
        };

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <div className="flex justify-center items-center h-full w-full">
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="max-w-full"
            />
        </div>
    );
};

export default TalkingVisualizer;
