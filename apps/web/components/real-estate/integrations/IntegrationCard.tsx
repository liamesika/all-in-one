'use client';

import { ReactNode, useState } from 'react';
import {
  Settings,
  MoreVertical,
  RefreshCw,
  Unplug,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING';
export type IntegrationCategory = 'CRM' | 'CALENDAR' | 'SOCIAL' | 'PROPERTY' | 'AUTOMATION';

interface IntegrationCardProps {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: ReactNode;
  status: IntegrationStatus;
  lastSyncAt?: Date | string;
  syncCount?: number;
  onConnect: () => void;
  onDisconnect: () => void;
  onConfigure: () => void;
  onSync?: () => void;
}

export function IntegrationCard({
  id,
  name,
  description,
  category,
  icon,
  status,
  lastSyncAt,
  syncCount = 0,
  onConnect,
  onDisconnect,
  onConfigure,
  onSync,
}: IntegrationCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (onSync) {
      setIsSyncing(true);
      try {
        await onSync();
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const statusConfig = {
    CONNECTED: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      text: 'Connected',
      color: 'bg-green-500/10 text-green-500 border-green-500/20',
      dotColor: 'bg-green-500',
    },
    DISCONNECTED: {
      icon: <XCircle className="w-3 h-3" />,
      text: 'Disconnected',
      color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      dotColor: 'bg-gray-400',
    },
    ERROR: {
      icon: <AlertCircle className="w-3 h-3" />,
      text: 'Error',
      color: 'bg-red-500/10 text-red-500 border-red-500/20',
      dotColor: 'bg-red-500',
    },
    SYNCING: {
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      text: 'Syncing...',
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      dotColor: 'bg-yellow-500 animate-pulse',
    },
  };

  const config = statusConfig[status];

  const formatLastSync = (date?: Date | string) => {
    if (!date) return 'Never';
    const syncDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - syncDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="group relative bg-[#1A2F4B] border border-[#374151] rounded-xl p-6 hover:border-blue-500/50 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#0E1A2B] border border-[#374151] flex items-center justify-center">
          {icon}
        </div>

        {/* Status Badge & Menu */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
          >
            <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
            {config.text}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1A2F4B] border-[#374151]">
              {status === 'CONNECTED' && (
                <>
                  <DropdownMenuItem
                    onClick={onConfigure}
                    className="text-gray-300 hover:bg-[#0E1A2B]"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="text-gray-300 hover:bg-[#0E1A2B]"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Now
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={onDisconnect}
                className="text-red-400 hover:bg-red-500/10"
              >
                <Unplug className="w-4 h-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-white font-semibold text-lg mb-1">{name}</h3>
        <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
      </div>

      {/* Stats */}
      {status === 'CONNECTED' && (
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-[#374151]">
          <span>Last sync: {formatLastSync(lastSyncAt)}</span>
          <span>{syncCount.toLocaleString()} items synced</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {status === 'CONNECTED' ? (
          <Button
            onClick={onConfigure}
            variant="outline"
            className="flex-1 bg-transparent border-[#374151] text-white hover:bg-blue-500/10 hover:border-blue-500"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        ) : (
          <Button
            onClick={onConnect}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Connect
          </Button>
        )}
      </div>

      {/* Category Badge */}
      <div className="absolute top-3 left-3">
        <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
          {category}
        </span>
      </div>
    </div>
  );
}
