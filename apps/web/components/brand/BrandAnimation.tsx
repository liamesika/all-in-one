'use client';

// apps/web/components/brand/BrandAnimation.tsx - EFFINITY Brand Animations
// Animated brand elements for hero sections and marketing pages

import React from 'react';
import { Logo } from './Logo';

/**
 * LogoReveal Component
 * Animated logo reveal on page load
 */
export function LogoReveal({
  onComplete,
  className = '',
}: {
  onComplete?: () => void;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    setTimeout(() => onComplete?.(), 1500);
  }, [onComplete]);

  return (
    <div
      className={`
        transition-all duration-1000
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        ${className}
      `}
    >
      <Logo size="2xl" animated />
    </div>
  );
}

/**
 * TypewriterText Component
 * Typewriter effect for taglines
 */
export function TypewriterText({
  text,
  speed = 50,
  className = '',
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

/**
 * ParticleBackground Component
 * Floating particles for hero sections
 */
export function ParticleBackground({
  particleCount = 20,
  color = 'rgba(41, 121, 255, 0.1)',
  className = '',
}: {
  particleCount?: number;
  color?: string;
  className?: string;
}) {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: color,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(20px, -20px);
          }
          50% {
            transform: translate(-20px, 20px);
          }
          75% {
            transform: translate(20px, 20px);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * GradientText Component
 * Animated gradient text effect
 */
export function GradientText({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`
        bg-clip-text text-transparent
        bg-gradient-to-r from-[#2979FF] via-[#60A5FA] to-[#2979FF]
        bg-[length:200%_auto]
        animate-gradient
        ${className}
      `}
      style={{
        animation: 'gradient 3s linear infinite',
      }}
    >
      {children}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </span>
  );
}

/**
 * PulseGlow Component
 * Pulsing glow effect for CTAs
 */
export function PulseGlow({
  children,
  color = '#2979FF',
  className = '',
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 rounded-lg blur-xl opacity-50 animate-pulse"
        style={{
          backgroundColor: color,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * FadeInUp Component
 * Fade in from bottom animation
 */
export function FadeInUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        transition-all duration-700
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * ScaleIn Component
 * Scale in animation
 */
export function ScaleIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        transition-all duration-500
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default LogoReveal;
