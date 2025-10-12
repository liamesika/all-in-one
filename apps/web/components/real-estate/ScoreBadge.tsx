'use client';

import { useState } from 'react';
import { TrendingUp, Info } from 'lucide-react';
import {
  calculatePropertyScore,
  getScoreBadgeColor,
  getScoreLabel,
  mockNeighborhoodMedians,
  type PropertyScoreBreakdown,
} from '@/lib/propertyScoring';

interface Property {
  price?: number;
  size?: number;
  city?: string;
  createdAt?: string;
  publishedAt?: string | null;
  images?: string[];
  description?: string;
}

interface ScoreBadgeProps {
  property: Property;
  language?: 'en' | 'he';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreBadge({
  property,
  language = 'en',
  size = 'md',
  showLabel = false,
}: ScoreBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate score
  const breakdown = calculatePropertyScore(property, mockNeighborhoodMedians);
  const colors = getScoreBadgeColor(breakdown.total);
  const label = getScoreLabel(breakdown.total, language);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]} cursor-help transition-all hover:shadow-md`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <TrendingUp className="w-4 h-4" />
        <span>{breakdown.total}</span>
        {showLabel && <span className="font-semibold">{label}</span>}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`absolute z-50 w-72 p-4 bg-gray-900 text-white rounded-lg shadow-2xl ${
            language === 'he' ? 'left-0' : 'right-0'
          } top-full mt-2`}
          style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
            <Info className="w-4 h-4" />
            <span className="font-bold text-sm">
              {language === 'he' ? 'פירוט ציון' : 'Score Breakdown'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Base */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">
                {language === 'he' ? 'בסיס' : 'Base'}
              </span>
              <span className="font-bold">{breakdown.base}</span>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">
                {language === 'he' ? 'מחיר/מ״ר לעומת שכונה' : 'Price/sqm vs Area'}
              </span>
              <span className="font-bold text-green-400">
                +{breakdown.pricing}
              </span>
            </div>

            {/* Market Time */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">
                {language === 'he' ? 'זמן בשוק' : 'Days on Market'}
              </span>
              <span className="font-bold text-blue-400">
                +{breakdown.marketTime}
              </span>
            </div>

            {/* Photos */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">
                {language === 'he' ? 'תמונות' : 'Photos'}
              </span>
              <span className="font-bold text-purple-400">
                +{breakdown.photos}
              </span>
            </div>

            {/* Description */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">
                {language === 'he' ? 'איכות תיאור' : 'Description Quality'}
              </span>
              <span className="font-bold text-yellow-400">
                +{breakdown.description}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-700">
              <span className="font-bold">
                {language === 'he' ? 'סה״כ' : 'Total'}
              </span>
              <span className="font-bold text-lg">{breakdown.total}/100</span>
            </div>
          </div>

          {/* Arrow pointer */}
          <div
            className={`absolute bottom-full ${
              language === 'he' ? 'left-4' : 'right-4'
            } w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900`}
          />
        </div>
      )}
    </div>
  );
}
