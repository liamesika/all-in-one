'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, School, ShoppingCart, Bus, Trees, Utensils, Dumbbell, Heart, MapPin, Star } from 'lucide-react';
import { PropertyData } from './MapContainer';

interface NeighborhoodSidebarProps {
  property: PropertyData | null;
  isOpen: boolean;
  onClose: () => void;
}

interface NeighborhoodScore {
  overall: number;
  proximity: number;
  schools: number;
  transport: number;
  lifestyle: number;
  safety: number;
}

export default function NeighborhoodSidebar({ property, isOpen, onClose }: NeighborhoodSidebarProps) {
  const [score, setScore] = useState<NeighborhoodScore | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (property && isOpen) {
      calculateNeighborhoodScore(property);
    }
  }, [property, isOpen]);

  const calculateNeighborhoodScore = async (prop: PropertyData) => {
    setIsCalculating(true);

    // Simulate AI scoring calculation
    // In production, this would call an API that uses Google Places API
    // and other data sources to calculate real scores
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock scoring based on property data and location
    const mockScore: NeighborhoodScore = {
      overall: Math.min(100, (prop.score || 0) + Math.random() * 20),
      proximity: 65 + Math.random() * 30,
      schools: 70 + Math.random() * 25,
      transport: 60 + Math.random() * 35,
      lifestyle: 75 + Math.random() * 20,
      safety: 80 + Math.random() * 15,
    };

    setScore(mockScore);
    setIsCalculating(false);
  };

  const getScoreColor = (value: number): string => {
    if (value >= 80) return 'text-[#00FFD1]';
    if (value >= 60) return 'text-[#2979FF]';
    return 'text-yellow-500';
  };

  const getScoreLabel = (value: number): string => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Poor';
  };

  if (!isOpen || !property) return null;

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-[#0E1A2B] border-l border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } overflow-y-auto`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#0E1A2B] border-b border-gray-700 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Neighborhood Scorecard</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Property Info */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">{property.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>
              {property.neighborhood}, {property.city}
            </span>
          </div>
          {property.price && (
            <p className="text-[#2979FF] font-semibold mt-2">
              ₪{property.price.toLocaleString()}
            </p>
          )}
        </div>

        {/* Overall Score */}
        {isCalculating ? (
          <div className="bg-gray-800/50 rounded-lg p-6 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Calculating scores...</div>
          </div>
        ) : score ? (
          <>
            <div className="bg-gradient-to-br from-[#2979FF]/20 to-[#00FFD1]/10 rounded-lg p-6 border border-[#2979FF]/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Overall Score</h3>
                <Star className="w-5 h-5 text-[#00FFD1]" />
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-5xl font-bold ${getScoreColor(score.overall)}`}>
                  {Math.round(score.overall)}
                </span>
                <span className="text-gray-400 mb-2">/100</span>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                {getScoreLabel(score.overall)} neighborhood rating
              </p>
            </div>

            {/* Detailed Scores */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Detailed Analysis</h3>

              {/* Proximity Score */}
              <ScoreItem
                icon={<TrendingUp className="w-5 h-5" />}
                label="Proximity Index"
                score={score.proximity}
                description="Distance to key amenities"
              />

              {/* Schools */}
              <ScoreItem
                icon={<School className="w-5 h-5" />}
                label="Education"
                score={score.schools}
                description="Nearby schools and educational facilities"
              />

              {/* Transport */}
              <ScoreItem
                icon={<Bus className="w-5 h-5" />}
                label="Public Transport"
                score={score.transport}
                description="Access to buses, trains, and metro"
              />

              {/* Lifestyle */}
              <ScoreItem
                icon={<Utensils className="w-5 h-5" />}
                label="Lifestyle"
                score={score.lifestyle}
                description="Restaurants, cafes, and entertainment"
              />

              {/* Safety */}
              <ScoreItem
                icon={<Heart className="w-5 h-5" />}
                label="Safety Index"
                score={score.safety}
                description="Crime rate and neighborhood security"
              />
            </div>

            {/* AI Insights */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00FFD1]" />
                AI Insights
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {score.schools >= 70 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FFD1] mt-1">•</span>
                    <span>Excellent school district with high-rated institutions nearby</span>
                  </li>
                )}
                {score.transport >= 70 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FFD1] mt-1">•</span>
                    <span>Well-connected to public transportation networks</span>
                  </li>
                )}
                {score.lifestyle >= 75 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FFD1] mt-1">•</span>
                    <span>Vibrant neighborhood with diverse dining and entertainment</span>
                  </li>
                )}
                {score.safety >= 80 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FFD1] mt-1">•</span>
                    <span>Low crime rate area with strong community safety</span>
                  </li>
                )}
                {score.overall >= 75 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#2979FF] mt-1">•</span>
                    <span>Recommended for families and long-term investment</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Action Button */}
            <a
              href={`/dashboard/real-estate/properties/${property.id}`}
              className="block w-full bg-[#2979FF] hover:bg-[#2979FF]/80 text-white text-center py-3 rounded-lg font-semibold transition-colors"
            >
              View Full Property Details
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface ScoreItemProps {
  icon: React.ReactNode;
  label: string;
  score: number;
  description: string;
}

function ScoreItem({ icon, label, score, description }: ScoreItemProps) {
  const getScoreColor = (value: number): string => {
    if (value >= 80) return 'bg-[#00FFD1]';
    if (value >= 60) return 'bg-[#2979FF]';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-gray-400">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-medium text-sm">{label}</span>
            <span className="text-white font-semibold">{Math.round(score)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(score)}`}
              style={{ width: `${Math.min(100, score)}%` }}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 ml-8">{description}</p>
    </div>
  );
}
