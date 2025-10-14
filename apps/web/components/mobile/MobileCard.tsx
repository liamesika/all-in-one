'use client';

// apps/web/components/mobile/MobileCard.tsx - EFFINITY Mobile-Optimized Card
// Compact card with swipeable actions (delete, archive, etc.)

import React from 'react';
import { Trash2, Archive, MoreVertical, type LucideIcon } from 'lucide-react';
import { useSwipeDetection } from '@/lib/gestures';

/**
 * Card Action Interface
 */
export interface CardAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  color: 'red' | 'blue' | 'gray';
  onClick: () => void;
}

/**
 * MobileCard Props
 */
export interface MobileCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  image?: string;
  actions?: CardAction[];
  swipeActions?: {
    left?: CardAction;
    right?: CardAction;
  };
  expandable?: boolean;
  onExpand?: () => void;
  onClick?: () => void;
  className?: string;
}

/**
 * MobileCard Component
 * Touch-optimized card with swipe actions and expandable details
 * Following EFFINITY design system: 8pt grid, 44px touch targets, brand colors
 */
export function MobileCard({
  children,
  title,
  subtitle,
  image,
  actions,
  swipeActions,
  expandable = false,
  onExpand,
  onClick,
  className = '',
}: MobileCardProps) {
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);

  const cardRef = React.useRef<HTMLDivElement>(null);

  // Swipe detection
  const swipeHandlers = useSwipeDetection({
    onSwipeLeft: () => {
      if (swipeActions?.left) {
        setSwipeOffset(-80); // Show left action
      }
    },
    onSwipeRight: () => {
      if (swipeActions?.right) {
        setSwipeOffset(80); // Show right action
      } else {
        setSwipeOffset(0); // Reset
      }
    },
  });

  // Reset swipe on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setSwipeOffset(0);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleExpand = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
      onExpand?.();
    }
  };

  const renderAction = (action: CardAction, side: 'left' | 'right') => {
    const Icon = action.icon || MoreVertical;
    const bgColors = {
      red: 'bg-red-500',
      blue: 'bg-blue-700',
      gray: 'bg-gray-500',
    };

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          action.onClick();
          setSwipeOffset(0);
        }}
        className={`
          absolute top-0 bottom-0
          ${side === 'left' ? 'right-full' : 'left-full'}
          w-20
          flex flex-col items-center justify-center gap-1
          ${bgColors[action.color]}
          text-white
          touch-manipulation
        `}
        aria-label={action.label}
      >
        <Icon className="w-5 h-5" />
        <span className="text-xs font-semibold">{action.label}</span>
      </button>
    );
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={cardRef}>
      {/* Swipe Actions Background */}
      {swipeActions?.left && swipeOffset < 0 && (
        renderAction(swipeActions.left, 'left')
      )}
      {swipeActions?.right && swipeOffset > 0 && (
        renderAction(swipeActions.right, 'right')
      )}

      {/* Card Content */}
      <div
        {...swipeHandlers}
        onClick={onClick}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: 'transform 0.3s ease-out',
        }}
        className={`
          relative
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-lg
          shadow-sm
          ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
          transition-transform duration-150
        `}
      >
        {/* Header */}
        {(title || subtitle || image || actions) && (
          <div className="flex items-start gap-3 p-4">
            {/* Image */}
            {image && (
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title & Subtitle */}
            {(title || subtitle) && (
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Actions Menu */}
            {actions && actions.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="
                  p-2 rounded-lg
                  text-gray-600 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                  touch-manipulation
                "
                aria-label="More actions"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Actions Dropdown */}
        {showActions && actions && (
          <div className="absolute top-16 right-4 z-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {actions.map((action) => {
              const Icon = action.icon || MoreVertical;
              return (
                <button
                  key={action.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                    setShowActions(false);
                  }}
                  className="
                    w-full
                    flex items-center gap-3
                    px-4 py-3
                    text-start
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    transition-colors
                    touch-manipulation
                  "
                >
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-4">
          {children}
        </div>

        {/* Expandable Section */}
        {expandable && (
          <button
            onClick={handleExpand}
            className="
              w-full
              px-4 py-3
              border-t border-gray-200 dark:border-gray-700
              text-sm font-semibold text-blue-700 dark:text-blue-400
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-colors
              touch-manipulation
            "
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * MobileCardList
 * Optimized list wrapper for mobile cards
 */
export function MobileCardList({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
}

export default MobileCard;
