'use client';

import { useState, useMemo } from 'react';
import { Plus, Building2, Calendar, Facebook, Home, Zap, Instagram, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IntegrationCard,
  type IntegrationStatus,
  type IntegrationCategory,
} from '@/components/real-estate/integrations/IntegrationCard';
import {
  ConnectIntegrationModal,
  type IntegrationType,
  type AuthMethod,
} from '@/components/real-estate/integrations/ConnectIntegrationModal';
import { IntegrationSettingsModal } from '@/components/real-estate/integrations/IntegrationSettingsModal';

interface IntegrationData {
  id?: string;
  platform: IntegrationType;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: React.ReactNode;
  authMethod: AuthMethod;
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncCount?: number;
  settings?: Record<string, any>;
}

// Define all available integrations
const AVAILABLE_INTEGRATIONS: Omit<IntegrationData, 'id' | 'status' | 'lastSyncAt' | 'syncCount'>[] = [
  // CRM Integrations
  {
    platform: 'HUBSPOT',
    name: 'HubSpot',
    description: 'Sync contacts, deals, and companies with HubSpot CRM',
    category: 'CRM',
    icon: <Building2 className="w-6 h-6 text-orange-500" />,
    authMethod: 'oauth',
  },
  {
    platform: 'ZOHO',
    name: 'Zoho CRM',
    description: 'Connect leads, accounts, and contacts with Zoho CRM',
    category: 'CRM',
    icon: <Building2 className="w-6 h-6 text-red-500" />,
    authMethod: 'oauth',
  },
  {
    platform: 'MONDAY',
    name: 'Monday.com',
    description: 'Sync boards, items, and updates with Monday.com',
    category: 'CRM',
    icon: <Building2 className="w-6 h-6 text-pink-500" />,
    authMethod: 'api_key',
  },
  {
    platform: 'SALESFORCE',
    name: 'Salesforce',
    description: 'Integrate leads, opportunities, and accounts with Salesforce',
    category: 'CRM',
    icon: <Building2 className="w-6 h-6 text-blue-400" />,
    authMethod: 'oauth',
  },

  // Calendar Integrations
  {
    platform: 'GOOGLE_CALENDAR',
    name: 'Google Calendar',
    description: 'Sync property tours and appointments with Google Calendar',
    category: 'CALENDAR',
    icon: <Calendar className="w-6 h-6 text-blue-500" />,
    authMethod: 'oauth',
  },
  {
    platform: 'OUTLOOK_CALENDAR',
    name: 'Outlook Calendar',
    description: 'Manage appointments and reminders in Outlook Calendar',
    category: 'CALENDAR',
    icon: <Calendar className="w-6 h-6 text-blue-600" />,
    authMethod: 'oauth',
  },
  {
    platform: 'APPLE_CALENDAR',
    name: 'Apple Calendar',
    description: 'Sync events with Apple iCal calendar',
    category: 'CALENDAR',
    icon: <Calendar className="w-6 h-6 text-gray-400" />,
    authMethod: 'credentials',
  },

  // Social Media Integrations
  {
    platform: 'FACEBOOK_LEADS',
    name: 'Facebook Lead Ads',
    description: 'Automatically capture leads from Facebook Lead Ads',
    category: 'SOCIAL',
    icon: <Facebook className="w-6 h-6 text-blue-600" />,
    authMethod: 'oauth',
  },
  {
    platform: 'INSTAGRAM_LEADS',
    name: 'Instagram Lead Ads',
    description: 'Import leads from Instagram Lead Generation forms',
    category: 'SOCIAL',
    icon: <Instagram className="w-6 h-6 text-pink-500" />,
    authMethod: 'oauth',
  },
  {
    platform: 'LINKEDIN_LEADS',
    name: 'LinkedIn Lead Gen',
    description: 'Capture leads from LinkedIn Lead Generation forms',
    category: 'SOCIAL',
    icon: <Linkedin className="w-6 h-6 text-blue-700" />,
    authMethod: 'oauth',
  },
  {
    platform: 'TIKTOK_LEADS',
    name: 'TikTok Lead Gen',
    description: 'Collect leads from TikTok Lead Generation ads',
    category: 'SOCIAL',
    icon: <Mail className="w-6 h-6 text-black" />,
    authMethod: 'api_key',
  },

  // Property Platform Integrations
  {
    platform: 'GUESTY',
    name: 'Guesty',
    description: 'Sync vacation rental properties and bookings from Guesty',
    category: 'PROPERTY',
    icon: <Home className="w-6 h-6 text-purple-500" />,
    authMethod: 'api_key',
  },
  {
    platform: 'AIRBNB',
    name: 'Airbnb',
    description: 'Import property listings and sync availability with Airbnb',
    category: 'PROPERTY',
    icon: <Home className="w-6 h-6 text-red-500" />,
    authMethod: 'oauth',
  },
  {
    platform: 'YAD2',
    name: 'Yad2',
    description: 'Sync property listings with Yad2 Israeli real estate portal',
    category: 'PROPERTY',
    icon: <Home className="w-6 h-6 text-blue-500" />,
    authMethod: 'credentials',
  },
  {
    platform: 'MADLAN',
    name: 'Madlan',
    description: 'Connect properties with Madlan Israeli property platform',
    category: 'PROPERTY',
    icon: <Home className="w-6 h-6 text-green-500" />,
    authMethod: 'credentials',
  },
  {
    platform: 'ZILLOW',
    name: 'Zillow',
    description: 'Import property data and market insights from Zillow',
    category: 'PROPERTY',
    icon: <Home className="w-6 h-6 text-blue-700" />,
    authMethod: 'api_key',
  },

  // Automation Tools
  {
    platform: 'ZAPIER',
    name: 'Zapier',
    description: 'Connect EFFINITY with 5000+ apps via Zapier workflows',
    category: 'AUTOMATION',
    icon: <Zap className="w-6 h-6 text-orange-500" />,
    authMethod: 'api_key',
  },
  {
    platform: 'MAKE',
    name: 'Make (Integromat)',
    description: 'Build advanced automation workflows with Make',
    category: 'AUTOMATION',
    icon: <Zap className="w-6 h-6 text-purple-500" />,
    authMethod: 'api_key',
  },
  {
    platform: 'CUSTOM_WEBHOOK',
    name: 'Custom Webhook',
    description: 'Create custom integrations with webhooks and API access',
    category: 'AUTOMATION',
    icon: <Zap className="w-6 h-6 text-gray-500" />,
    authMethod: 'api_key',
  },
];

interface IntegrationsClientProps {
  initialIntegrations: any[];
}

export default function IntegrationsClient({ initialIntegrations }: IntegrationsClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | IntegrationCategory>('all');
  const [integrations, setIntegrations] = useState<IntegrationData[]>(
    AVAILABLE_INTEGRATIONS.map((int) => {
      const existing = initialIntegrations.find((i) => i.platform === int.platform);
      return {
        ...int,
        id: existing?.id,
        status: existing?.status || 'DISCONNECTED',
        lastSyncAt: existing?.lastSyncAt,
        syncCount: existing?.syncCount || 0,
        settings: existing?.settings || {},
      };
    })
  );
  const [connectModal, setConnectModal] = useState<{
    open: boolean;
    integration: IntegrationData | null;
  }>({ open: false, integration: null });
  const [settingsModal, setSettingsModal] = useState<{
    open: boolean;
    integration: IntegrationData | null;
  }>({ open: false, integration: null });

  const filteredIntegrations = useMemo(() => {
    if (activeTab === 'all') return integrations;
    return integrations.filter((int) => int.category === activeTab);
  }, [integrations, activeTab]);

  const connectedCount = integrations.filter((int) => int.status === 'CONNECTED').length;

  const handleConnect = async (integration: IntegrationData, credentials: Record<string, any>) => {
    try {
      const response = await fetch('/api/real-estate/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: integration.platform,
          credentials,
        }),
      });

      if (response.ok) {
        const newIntegration = await response.json();
        setIntegrations((prev) =>
          prev.map((int) =>
            int.platform === integration.platform
              ? {
                  ...int,
                  id: newIntegration.id,
                  status: 'CONNECTED' as IntegrationStatus,
                  lastSyncAt: new Date().toISOString(),
                }
              : int
          )
        );
      }
    } catch (error) {
      console.error('Failed to connect integration:', error);
    }
  };

  const handleDisconnect = async (integration: IntegrationData) => {
    if (!integration.id) return;

    if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/real-estate/integrations/${integration.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIntegrations((prev) =>
          prev.map((int) =>
            int.platform === integration.platform
              ? {
                  ...int,
                  id: undefined,
                  status: 'DISCONNECTED' as IntegrationStatus,
                  lastSyncAt: undefined,
                  syncCount: 0,
                }
              : int
          )
        );
      }
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const handleSync = async (integration: IntegrationData) => {
    if (!integration.id) return;

    try {
      const response = await fetch(`/api/real-estate/integrations/${integration.id}/sync`, {
        method: 'POST',
      });

      if (response.ok) {
        setIntegrations((prev) =>
          prev.map((int) =>
            int.id === integration.id
              ? { ...int, status: 'SYNCING' as IntegrationStatus }
              : int
          )
        );

        // Simulate sync completion (in real app, this would be via websocket or polling)
        setTimeout(() => {
          setIntegrations((prev) =>
            prev.map((int) =>
              int.id === integration.id
                ? {
                    ...int,
                    status: 'CONNECTED' as IntegrationStatus,
                    lastSyncAt: new Date().toISOString(),
                    syncCount: (int.syncCount || 0) + Math.floor(Math.random() * 100),
                  }
                : int
            )
          );
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to sync integration:', error);
    }
  };

  const handleSaveSettings = async (
    integration: IntegrationData,
    settings: Record<string, any>
  ) => {
    if (!integration.id) return;

    try {
      const response = await fetch(`/api/real-estate/integrations/${integration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setIntegrations((prev) =>
          prev.map((int) => (int.id === integration.id ? { ...int, settings } : int))
        );
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1A2B] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Integrations</h1>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>
          <p className="text-gray-400">
            Connect EFFINITY with your favorite tools and platforms. {connectedCount} of{' '}
            {integrations.length} integrations connected.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
          <TabsList className="bg-[#1A2F4B] border border-[#374151]">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-500">
              All ({integrations.length})
            </TabsTrigger>
            <TabsTrigger value="CRM" className="data-[state=active]:bg-blue-500">
              CRM ({integrations.filter((i) => i.category === 'CRM').length})
            </TabsTrigger>
            <TabsTrigger value="CALENDAR" className="data-[state=active]:bg-blue-500">
              Calendar ({integrations.filter((i) => i.category === 'CALENDAR').length})
            </TabsTrigger>
            <TabsTrigger value="SOCIAL" className="data-[state=active]:bg-blue-500">
              Social ({integrations.filter((i) => i.category === 'SOCIAL').length})
            </TabsTrigger>
            <TabsTrigger value="PROPERTY" className="data-[state=active]:bg-blue-500">
              Property ({integrations.filter((i) => i.category === 'PROPERTY').length})
            </TabsTrigger>
            <TabsTrigger value="AUTOMATION" className="data-[state=active]:bg-blue-500">
              Automation ({integrations.filter((i) => i.category === 'AUTOMATION').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.platform}
              id={integration.id || ''}
              name={integration.name}
              description={integration.description}
              category={integration.category}
              icon={integration.icon}
              status={integration.status}
              lastSyncAt={integration.lastSyncAt}
              syncCount={integration.syncCount}
              onConnect={() => setConnectModal({ open: true, integration })}
              onDisconnect={() => handleDisconnect(integration)}
              onConfigure={() => setSettingsModal({ open: true, integration })}
              onSync={() => handleSync(integration)}
            />
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No integrations found in this category.</p>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      <ConnectIntegrationModal
        open={connectModal.open}
        onClose={() => setConnectModal({ open: false, integration: null })}
        integration={
          connectModal.integration
            ? {
                platform: connectModal.integration.platform,
                name: connectModal.integration.name,
                authMethod: connectModal.integration.authMethod,
              }
            : null
        }
        onConnect={(credentials) =>
          connectModal.integration && handleConnect(connectModal.integration, credentials)
        }
      />

      {/* Settings Modal */}
      <IntegrationSettingsModal
        open={settingsModal.open}
        onClose={() => setSettingsModal({ open: false, integration: null })}
        integration={
          settingsModal.integration
            ? {
                id: settingsModal.integration.id || '',
                platform: settingsModal.integration.platform,
                name: settingsModal.integration.name,
                category: settingsModal.integration.category,
                settings: settingsModal.integration.settings,
              }
            : null
        }
        onSave={(settings) =>
          settingsModal.integration && handleSaveSettings(settingsModal.integration, settings)
        }
      />
    </div>
  );
}
