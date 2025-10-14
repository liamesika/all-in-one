'use client';

import { useEffect, useState, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface Stat {
  icon: LucideIcon;
  value: string;
  label: string;
}

interface StatsCounterProps {
  stats: Stat[];
}

export function StatsCounter({ stats }: StatsCounterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`text-center transition-all duration-700 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon size={24} className="text-blue-700" />
            </div>
            <div className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">
              {stat.value}
            </div>
            <div className="text-sm font-normal text-gray-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
