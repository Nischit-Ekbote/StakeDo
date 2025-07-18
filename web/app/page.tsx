'use client';
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const StakeDoLanding: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Optimized animated blob properties
    let time = 0;
    const blobs = [
      { x: 0.3, y: 0.4, radius: 150, color: 'rgba(139, 92, 246, 0.2)' },
      { x: 0.7, y: 0.6, radius: 120, color: 'rgba(236, 72, 153, 0.15)' },
    ];

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Simplified background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw optimized morphing blobs
      blobs.forEach((blob, index) => {
        const centerX = blob.x * canvas.width + Math.sin(time * 0.001 + index) * 50;
        const centerY = blob.y * canvas.height + Math.cos(time * 0.0015 + index) * 40;
        
        ctx.beginPath();
        
        // Reduced complexity - fewer points
        const points = 6;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const radiusVariation = Math.sin(time * 0.003 + angle * 2 + index) * 20;
          const radius = blob.radius + radiusVariation;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        ctx.fillStyle = blob.color;
        ctx.filter = 'blur(40px)';
        ctx.fill();
        ctx.filter = 'none';
      });

      time += 8; // Reduced animation speed
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col justify-center items-center px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <h1 className="text-8xl md:text-9xl text-transparent mb-6 text-white tracking-tight">
              Stake-<span className='bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent'>Do</span>
            </h1>
            
            {/* Tagline */}
            <p className="text-2xl md:text-xl text-purple-200 mb-8 font-light font-mono">
              Stake Your SOL, Complete Your Tasks
            </p>
          
            
            {/* CTA Button */}
            <div className="flex justify-center">
              <Link href={"/dashboard"} className="group bg-white text-black font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeDoLanding;