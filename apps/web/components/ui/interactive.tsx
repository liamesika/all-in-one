'use client';

import React, { useState, useEffect } from 'react';

// Interactive Button with multiple hover effects
export const InteractiveButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  effect?: 'lift' | 'magnetic' | 'ripple' | 'glow' | 'bounce';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}> = ({
  children,
  onClick,
  variant = 'primary',
  effect = 'lift',
  size = 'md',
  className = '',
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>([]);

  const baseClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-50 border border-transparent'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const effectClasses = {
    lift: 'hover-lift',
    magnetic: 'btn-magnetic',
    ripple: 'btn-ripple',
    glow: 'animate-glow',
    bounce: 'hover:animate-bounce-in'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (effect === 'ripple') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples(prev => [...prev, { id, x, y }]);

      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
      }, 600);
    }

    onClick?.();
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-300 relative overflow-hidden
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${baseClasses[variant]}
        ${sizeClasses[size]}
        ${effectClasses[effect]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
    >
      {effect === 'ripple' && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white opacity-30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20
          }}
        />
      ))}
      {children}
    </button>
  );
};

// Interactive Card with hover effects
export const InteractiveCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  effect?: 'lift' | 'glow' | 'scale' | 'tilt';
  className?: string;
  clickable?: boolean;
}> = ({
  children,
  onClick,
  effect = 'lift',
  className = '',
  clickable = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (effect === 'tilt') {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      setMousePosition({
        x: mouseX / (rect.width / 2),
        y: mouseY / (rect.height / 2)
      });
    }
  };

  const effectStyles = effect === 'tilt' && isHovered ? {
    transform: `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg) scale3d(1.05, 1.05, 1.05)`
  } : {};

  const effectClasses = {
    lift: 'hover-lift',
    glow: 'hover:shadow-2xl hover:shadow-blue-500/20',
    scale: 'hover:scale-105',
    tilt: 'transform-gpu'
  };

  return (
    <div
      className={`
        card transition-all duration-300 transform-gpu
        ${effectClasses[effect]}
        ${clickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={effectStyles}
    >
      {children}
    </div>
  );
};

// Floating Action Button
export const FloatingButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  children,
  onClick,
  position = 'bottom-right',
  size = 'md',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  return (
    <button
      className={`
        ${positions[position]}
        ${sizes[size]}
        bg-blue-600 text-white rounded-full shadow-lg
        hover:bg-blue-700 hover:shadow-xl hover:scale-110
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        transition-all duration-300 transform-gpu z-50
        flex items-center justify-center
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Animated Counter
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  className?: string;
}> = ({ value, duration = 1000, className = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [value, duration]);

  return <span className={className}>{count}</span>;
};

// Tooltip with smooth animation
export const Tooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}> = ({ children, content, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`
            absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded
            whitespace-nowrap opacity-0 animate-fade-in
            ${positionClasses[position]}
          `}
        >
          {content}
          <div
            className={`
              absolute w-0 h-0 border-solid
              ${position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 border-t-4 border-x-transparent border-x-4 border-b-0' : ''}
              ${position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900 border-b-4 border-x-transparent border-x-4 border-t-0' : ''}
              ${position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900 border-l-4 border-y-transparent border-y-4 border-r-0' : ''}
              ${position === 'right' ? 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900 border-r-4 border-y-transparent border-y-4 border-l-0' : ''}
            `}
          />
        </div>
      )}
    </div>
  );
};

// Interactive Input with focus effects
export const InteractiveInput: React.FC<{
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  icon?: React.ReactNode;
  label?: string;
}> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  icon,
  label
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          className={`
            absolute left-3 transition-all duration-200 pointer-events-none
            ${isFocused || hasValue
              ? 'top-2 text-xs text-blue-600 bg-white px-1'
              : 'top-3 text-sm text-gray-500'
            }
          `}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={!label ? placeholder : ''}
          value={value}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            onChange?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
            hover:border-gray-400
          `}
        />
      </div>
    </div>
  );
};

// Progress indicator with animation
export const AnimatedProgress: React.FC<{
  progress: number;
  label?: string;
  className?: string;
}> = ({ progress, label, className = '' }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-500">{Math.round(animatedProgress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{ width: `${animatedProgress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};