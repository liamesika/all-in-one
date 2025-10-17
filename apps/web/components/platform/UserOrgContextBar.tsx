'use client';

import { useState } from 'react';
import { ChevronDown, Building2, Film, Home as HomeIcon, ShoppingBag, Scale, Crown, Users, AlertCircle } from 'lucide-react';

type Vertical = 'productions' | 'real-estate' | 'ecommerce' | 'law';
type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';

interface Organization {
  id: string;
  name: string;
  plan: PlanType;
  vertical: Vertical;
  limits?: {
    projects?: number;
    properties?: number;
    leads?: number;
    storage?: string; // e.g., "10 GB"
  };
  usage?: {
    projects?: number;
    properties?: number;
    leads?: number;
    storage?: string; // e.g., "2.5 GB"
  };
}

interface UserOrgContextBarProps {
  organizations?: Organization[];
  currentOrgId?: string;
  onOrgChange?: (orgId: string) => void;
  onVerticalChange?: (vertical: Vertical) => void;
}

const verticalConfig: Record<Vertical, { name: string; icon: React.ElementType; color: string }> = {
  productions: { name: 'Productions', icon: Film, color: 'text-purple-600' },
  'real-estate': { name: 'Real Estate', icon: HomeIcon, color: 'text-blue-600' },
  ecommerce: { name: 'E-commerce', icon: ShoppingBag, color: 'text-green-600' },
  law: { name: 'Law', icon: Scale, color: 'text-orange-600' },
};

const planConfig: Record<PlanType, { name: string; color: string; icon: React.ElementType }> = {
  free: { name: 'Free', color: 'text-gray-600', icon: Users },
  starter: { name: 'Starter', color: 'text-blue-600', icon: Building2 },
  professional: { name: 'Professional', color: 'text-purple-600', icon: Crown },
  enterprise: { name: 'Enterprise', color: 'text-orange-600', icon: Crown },
};

export function UserOrgContextBar({
  organizations = [
    {
      id: 'org1',
      name: 'Acme Productions',
      plan: 'professional',
      vertical: 'productions',
      limits: { projects: 50, storage: '100 GB' },
      usage: { projects: 23, storage: '45 GB' },
    },
  ],
  currentOrgId = 'org1',
  onOrgChange,
  onVerticalChange,
}: UserOrgContextBarProps) {
  const [isOrgSelectorOpen, setIsOrgSelectorOpen] = useState(false);
  const [isVerticalSelectorOpen, setIsVerticalSelectorOpen] = useState(false);

  const currentOrg = organizations.find((org) => org.id === currentOrgId) || organizations[0];
  const VerticalIcon = verticalConfig[currentOrg.vertical].icon;
  const PlanIcon = planConfig[currentOrg.plan].icon;

  const isNearLimit = (usage: number = 0, limit: number = 0) => {
    if (!limit) return false;
    return (usage / limit) >= 0.8;
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 gap-4">
          {/* Organization Selector */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative">
              <button
                onClick={() => setIsOrgSelectorOpen(!isOrgSelectorOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors min-w-[200px]"
              >
                <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {currentOrg.name}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                  isOrgSelectorOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Org Dropdown */}
              {isOrgSelectorOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOrgSelectorOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-2 max-h-96 overflow-y-auto">
                      {organizations.map((org) => {
                        const Icon = verticalConfig[org.vertical].icon;
                        const isSelected = org.id === currentOrgId;
                        return (
                          <button
                            key={org.id}
                            onClick={() => {
                              onOrgChange?.(org.id);
                              setIsOrgSelectorOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                            }`}
                          >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${verticalConfig[org.vertical].color}`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{org.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {verticalConfig[org.vertical].name} · {planConfig[org.plan].name}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <button className="w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        + Create New Organization
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Vertical Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsVerticalSelectorOpen(!isVerticalSelectorOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <VerticalIcon className={`w-4 h-4 ${verticalConfig[currentOrg.vertical].color}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {verticalConfig[currentOrg.vertical].name}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                  isVerticalSelectorOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Vertical Dropdown */}
              {isVerticalSelectorOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsVerticalSelectorOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-2">
                      {(Object.entries(verticalConfig) as [Vertical, typeof verticalConfig[Vertical]][]).map(([key, config]) => {
                        const Icon = config.icon;
                        const isSelected = key === currentOrg.vertical;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              onVerticalChange?.(key);
                              setIsVerticalSelectorOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${config.color}`} />
                            <span className="font-medium">{config.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Plan Badge */}
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              currentOrg.plan === 'enterprise'
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                : currentOrg.plan === 'professional'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                : currentOrg.plan === 'starter'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              <PlanIcon className="w-3.5 h-3.5" />
              {planConfig[currentOrg.plan].name}
            </div>
          </div>

          {/* Usage Indicators */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            {currentOrg.limits?.projects && currentOrg.usage?.projects !== undefined && (
              <div className={`flex items-center gap-2 ${
                isNearLimit(currentOrg.usage.projects, currentOrg.limits.projects) ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {isNearLimit(currentOrg.usage.projects, currentOrg.limits.projects) && (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {currentOrg.usage.projects} / {currentOrg.limits.projects}
                </span>
                <span className="text-gray-500">projects</span>
              </div>
            )}

            {currentOrg.limits?.storage && currentOrg.usage?.storage && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="font-medium">{currentOrg.usage.storage}</span>
                <span className="text-gray-500">/ {currentOrg.limits.storage}</span>
              </div>
            )}

            <button className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
