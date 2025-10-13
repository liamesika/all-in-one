'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { IntegrationCategory } from './IntegrationCard';

interface Integration {
  id: string;
  platform: string;
  name: string;
  category: IntegrationCategory;
  settings?: Record<string, any>;
}

interface IntegrationSettingsModalProps {
  open: boolean;
  onClose: () => void;
  integration: Integration | null;
  onSave: (settings: Record<string, any>) => Promise<void>;
}

export function IntegrationSettingsModal({
  open,
  onClose,
  integration,
  onSave,
}: IntegrationSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>(
    integration?.settings || {}
  );

  if (!integration) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCRMSettings = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-white">Sync Direction</Label>
        <Select
          value={settings.syncDirection || 'one_way'}
          onValueChange={(value) => setSettings({ ...settings, syncDirection: value })}
        >
          <SelectTrigger className="mt-1 bg-[#0E1A2B] border-[#374151] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A2F4B] border-[#374151]">
            <SelectItem value="one_way">One-way (EFFINITY → CRM)</SelectItem>
            <SelectItem value="two_way">Two-way sync</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white">Sync Frequency</Label>
        <Select
          value={settings.syncFrequency || 'real_time'}
          onValueChange={(value) => setSettings({ ...settings, syncFrequency: value })}
        >
          <SelectTrigger className="mt-1 bg-[#0E1A2B] border-[#374151] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A2F4B] border-[#374151]">
            <SelectItem value="real_time">Real-time</SelectItem>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-white">Only sync qualified leads</Label>
          <p className="text-xs text-gray-400">Only sync leads with status "Qualified"</p>
        </div>
        <Switch
          checked={settings.onlyQualified || false}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, onlyQualified: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-white">Sync properties</Label>
          <p className="text-xs text-gray-400">Include property data in sync</p>
        </div>
        <Switch
          checked={settings.syncProperties || true}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, syncProperties: checked })
          }
        />
      </div>
    </div>
  );

  const renderCalendarSettings = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-white">Default Calendar</Label>
        <Select
          value={settings.defaultCalendar || 'primary'}
          onValueChange={(value) => setSettings({ ...settings, defaultCalendar: value })}
        >
          <SelectTrigger className="mt-1 bg-[#0E1A2B] border-[#374151] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A2F4B] border-[#374151]">
            <SelectItem value="primary">Primary Calendar</SelectItem>
            <SelectItem value="work">Work Calendar</SelectItem>
            <SelectItem value="property_tours">Property Tours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white">Time Zone</Label>
        <Select
          value={settings.timezone || 'Asia/Jerusalem'}
          onValueChange={(value) => setSettings({ ...settings, timezone: value })}
        >
          <SelectTrigger className="mt-1 bg-[#0E1A2B] border-[#374151] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A2F4B] border-[#374151]">
            <SelectItem value="Asia/Jerusalem">Asia/Jerusalem (IST)</SelectItem>
            <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
            <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-white">Enable notifications</Label>
          <p className="text-xs text-gray-400">Send reminders before events</p>
        </div>
        <Switch
          checked={settings.notifications || true}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, notifications: checked })
          }
        />
      </div>

      <div>
        <Label className="text-white">Reminder Time</Label>
        <Select
          value={settings.reminderTime || '30'}
          onValueChange={(value) => setSettings({ ...settings, reminderTime: value })}
        >
          <SelectTrigger className="mt-1 bg-[#0E1A2B] border-[#374151] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A2F4B] border-[#374151]">
            <SelectItem value="15">15 minutes before</SelectItem>
            <SelectItem value="30">30 minutes before</SelectItem>
            <SelectItem value="60">1 hour before</SelectItem>
            <SelectItem value="1440">1 day before</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderSocialSettings = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-white">Lead Form</Label>
        <Select
          value={settings.leadForm || 'all'}
          onValueChange={(value) => setSettings({ ...settings, leadForm: value })}
        >
          <SelectTrigger className="mt-1 bg-[#0E1A2B] border-[#374151] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A2F4B] border-[#374151]">
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="property_inquiry">Property Inquiry</SelectItem>
            <SelectItem value="contact_request">Contact Request</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-white">Auto-assign to agent</Label>
          <p className="text-xs text-gray-400">Automatically assign new leads</p>
        </div>
        <Switch
          checked={settings.autoAssign || false}
          onCheckedChange={(checked) => setSettings({ ...settings, autoAssign: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-white">Instant notifications</Label>
          <p className="text-xs text-gray-400">Get notified immediately for new leads</p>
        </div>
        <Switch
          checked={settings.instantNotifications || true}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, instantNotifications: checked })
          }
        />
      </div>
    </div>
  );

  const renderPropertySettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-white">Sync prices</Label>
          <p className="text-xs text-gray-400">Keep property prices in sync</p>
        </div>
        <Switch
          checked={settings.syncPrices || true}
          onCheckedChange={(checked) => setSettings({ ...settings, syncPrices: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-white">Sync photos</Label>
          <p className="text-xs text-gray-400">Import property photos</p>
        </div>
        <Switch
          checked={settings.syncPhotos || true}
          onCheckedChange={(checked) => setSettings({ ...settings, syncPhotos: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-white">Sync descriptions</Label>
          <p className="text-xs text-gray-400">Import property descriptions</p>
        </div>
        <Switch
          checked={settings.syncDescriptions || true}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, syncDescriptions: checked })
          }
        />
      </div>

      <div>
        <Label className="text-white">Sync Frequency</Label>
        <Select
          value={settings.syncFrequency || 'hourly'}
          onValueChange={(value) => setSettings({ ...settings, syncFrequency: value })}
        >
          <SelectTrigger className="mt-1 bg-[#0E1A2B] border-[#374151] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A2F4B] border-[#374151]">
            <SelectItem value="real_time">Real-time</SelectItem>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderAutomationSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-white">Enable automation</Label>
          <p className="text-xs text-gray-400">Allow automated workflows</p>
        </div>
        <Switch
          checked={settings.enabled || true}
          onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
        />
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          Configure automation workflows in the Automation section.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A2F4B] border-[#374151] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {integration.name} Settings
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {integration.category === 'CRM' && renderCRMSettings()}
          {integration.category === 'CALENDAR' && renderCalendarSettings()}
          {integration.category === 'SOCIAL' && renderSocialSettings()}
          {integration.category === 'PROPERTY' && renderPropertySettings()}
          {integration.category === 'AUTOMATION' && renderAutomationSettings()}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-[#374151]">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-transparent border-[#374151] text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
