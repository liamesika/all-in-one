'use client';

import { motion } from 'framer-motion';
import { Clock, User, Edit, Eye, Share2, MessageCircle } from 'lucide-react';
import { staggerContainer, slideUp } from '@/lib/animations/variants';

interface Activity {
  id: string;
  type: 'created' | 'updated' | 'viewed' | 'shared' | 'contacted';
  message: string;
  user: string;
  timestamp: Date;
}

export function PropertyActivityTimeline({ propertyId }: { propertyId: string }) {
  const activities: Activity[] = [
    { id: '1', type: 'created', message: 'Property created', user: 'Agent Smith', timestamp: new Date(Date.now() - 86400000 * 3) },
    { id: '2', type: 'updated', message: 'Price updated to ₪2,500,000', user: 'Agent Smith', timestamp: new Date(Date.now() - 86400000 * 2) },
    { id: '3', type: 'viewed', message: 'Viewed by potential buyer', user: 'John Doe', timestamp: new Date(Date.now() - 86400000) },
    { id: '4', type: 'contacted', message: 'Contact request received', user: 'Sarah Cohen', timestamp: new Date(Date.now() - 3600000 * 6) },
    { id: '5', type: 'shared', message: 'Property shared via WhatsApp', user: 'Agent Smith', timestamp: new Date(Date.now() - 3600000 * 2) },
  ];

  const getIcon = (type: Activity['type']) => {
    const icons = {
      created: Plus,
      updated: Edit,
      viewed: Eye,
      shared: Share2,
      contacted: MessageCircle
    };
    const Icon = icons[type] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const getColor = (type: Activity['type']) => {
    const colors = {
      created: 'bg-green-500',
      updated: 'bg-blue-500',
      viewed: 'bg-purple-500',
      shared: 'bg-orange-500',
      contacted: 'bg-red-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          variants={slideUp}
          className="flex gap-4 relative"
        >
          {index !== activities.length - 1 && (
            <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
          )}
          <div className={'w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 z-10 ' + getColor(activity.type)}>
            {getIcon(activity.type)}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {activity.user} • {activity.timestamp.toLocaleString()}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
