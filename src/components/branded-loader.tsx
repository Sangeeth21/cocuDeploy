"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Gift } from 'lucide-react';

const loadingMessages = [
  "Adding a pinch of magic dust…",
  "Curating smiles, hang tight!",
  "Customizing your dreams in real-time…",
  "Finalizing your bulk perfection…",
  "Unboxing creativity just for you!",
];

/**
 * Animated SVG as a fallback for the requested Lottie animation.
 * This SVG is self-contained and uses CSS animations for the ribbon and sparkles.
 */
const AnimatedGiftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="150"
    height="150"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="drop-shadow-lg"
  >
    <defs>
        {/* Gradient for the box */}
        <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        </linearGradient>
         {/* Gradient for the ribbon */}
        <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.8 }} />
        </linearGradient>
    </defs>
    <style>
      {`
        .sparkle {
          animation: sparkle-anim 1.5s infinite;
          transform-origin: center;
        }
        .sparkle-1 { animation-delay: 0s; }
        .sparkle-2 { animation-delay: 0.3s; }
        .sparkle-3 { animation-delay: 0.6s; }
        .sparkle-4 { animation-delay: 0.9s; }

        @keyframes sparkle-anim {
          0%, 100% { transform: scale(0.5); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}
    </style>
    {/* Box */}
    <path d="M20 12v10H4V12" fill="url(#boxGradient)" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5"/>
    <path d="M2 7h20v5H2z" fill="url(#boxGradient)" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5"/>
    {/* Ribbon */}
    <path d="M12 22V7" stroke="url(#ribbonGradient)" strokeWidth="1.5" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" fill="url(#ribbonGradient)" strokeWidth="0.5" stroke="hsl(var(--primary-foreground))" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" fill="url(#ribbonGradient)" strokeWidth="0.5" stroke="hsl(var(--primary-foreground))" />
     {/* Sparkles */}
    <path d="M19 4 L 19.5 5 L 20 4 L 19.5 3 Z" fill="hsl(var(--accent))" className="sparkle sparkle-1" />
    <path d="M5 4 L 5.5 5 L 6 4 L 5.5 3 Z" fill="hsl(var(--accent))" className="sparkle sparkle-2" />
    <path d="M22 14 L 22.5 15 L 23 14 L 22.5 13 Z" fill="hsl(var(--accent))" className="sparkle sparkle-3" />
    <path d="M2 14 L 2.5 15 L 3 14 L 2.5 13 Z" fill="hsl(var(--accent))" className="sparkle sparkle-4" />
  </svg>
);


export function BrandedLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  // This effect simulates the end of a page load.
  // In a real application, you would replace this timer with a state
  // that tracks when your actual data has finished loading.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Hide after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  // This effect handles the rotation of loading messages.
  useEffect(() => {
    if (!isVisible) return;

    const messageTimer = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(messageTimer);
  }, [isVisible]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent backdrop-blur-sm transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative">
        <AnimatedGiftIcon />
      </div>

      <div className="w-full max-w-sm text-center">
        {/* The key={messageIndex} is important here. It tells React to re-render the component when the message changes, which restarts the CSS animation. */}
        <p key={messageIndex} className="text-lg font-medium text-foreground animate-fade-in-out">
          {loadingMessages[messageIndex]}
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in-out {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          20%, 80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
