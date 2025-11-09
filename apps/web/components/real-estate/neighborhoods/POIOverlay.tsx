'use client';

import { useState } from 'react';
import { School, ShoppingCart, Bus, Trees, Utensils, Dumbbell, Heart, ChevronDown } from 'lucide-react';

export interface POICategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface POIOverlayProps {
  activeCategories: string[];
  onToggleCategory: (categoryId: string) => void;
}

export default function POIOverlay({ activeCategories, onToggleCategory }: POIOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const categories: POICategory[] = [
    {
      id: 'schools',
      name: 'Schools',
      icon: <School className="w-4 h-4" />,
      color: '#4CAF50',
    },
    {
      id: 'supermarkets',
      name: 'Supermarkets',
      icon: <ShoppingCart className="w-4 h-4" />,
      color: '#FF9800',
    },
    {
      id: 'transport',
      name: 'Public Transport',
      icon: <Bus className="w-4 h-4" />,
      color: '#2196F3',
    },
    {
      id: 'parks',
      name: 'Parks',
      icon: <Trees className="w-4 h-4" />,
      color: '#8BC34A',
    },
    {
      id: 'restaurants',
      name: 'Restaurants',
      icon: <Utensils className="w-4 h-4" />,
      color: '#F44336',
    },
    {
      id: 'gyms',
      name: 'Gyms',
      icon: <Dumbbell className="w-4 h-4" />,
      color: '#9C27B0',
    },
    {
      id: 'hospitals',
      name: 'Hospitals',
      icon: <Heart className="w-4 h-4" />,
      color: '#E91E63',
    },
  ];

  return (
    <div className="absolute top-4 right-4 z-10 bg-[#0E1A2B]/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl max-w-xs">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors rounded-t-lg"
      >
        <span className="font-semibold">Points of Interest</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Categories */}
      {isExpanded && (
        <div className="p-4 space-y-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-3">
            Select categories to display on map
          </p>
          {categories.map((category) => {
            const isActive = activeCategories.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => onToggleCategory(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gray-800 border-2'
                    : 'bg-gray-800/30 border-2 border-transparent hover:bg-gray-800/50'
                }`}
                style={{
                  borderColor: isActive ? category.color : 'transparent',
                }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{
                    backgroundColor: isActive ? `${category.color}20` : 'transparent',
                    color: category.color,
                  }}
                >
                  {category.icon}
                </div>
                <span className="text-sm text-white font-medium flex-1 text-left">
                  {category.name}
                </span>
                {isActive && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                )}
              </button>
            );
          })}

          {/* Clear All Button */}
          {activeCategories.length > 0 && (
            <button
              onClick={() => activeCategories.forEach(onToggleCategory)}
              className="w-full mt-3 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Active Count Indicator */}
      {!isExpanded && activeCategories.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-[#00FFD1]" />
            <span>{activeCategories.length} categories active</span>
          </div>
        </div>
      )}
    </div>
  );
}
