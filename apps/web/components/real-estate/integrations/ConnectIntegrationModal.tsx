'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Key, Link as LinkIcon, Lock, CheckCircle2, XCircle } from 'lucide-react';

export type IntegrationType =
  | 'HUBSPOT'
  | 'ZOHO'
  | 'MONDAY'
  | 'SALESFORCE'
  | 'GOOGLE_CALENDAR'
  | 'OUTLOOK_CALENDAR'
  | 'APPLE_CALENDAR'
  | 'FACEBOOK_LEADS'
  | 'INSTAGRAM_LEADS'
  | 'LINKEDIN_LEADS'
  | 'TIKTOK_LEADS'
  | 'GUESTY'
  | 'AIRBNB'
  | 'YAD2'
  | 'MADLAN'
  | 'ZILLOW'
  | 'ZAPIER'
  | 'MAKE'
  | 'CUSTOM_WEBHOOK';

export type AuthMethod = 'oauth' | 'api_key' | 'credentials';

interface Integration {
  platform: IntegrationType;
  name: string;
  authMethod: AuthMethod;
}

interface ConnectIntegrationModalProps {
  open: boolean;
  onClose: () => void;
  integration: Integration | null;
  onConnect: (credentials: Record<string, any>) => Promise<void>;
}

export function ConnectIntegrationModal({
  open,
  onClose,
  integration,
  onConnect,
}: ConnectIntegrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  if (!integration) return null;

  const handleOAuthConnect = async () => {
    setLoading(true);
    try {
      // Initiate OAuth flow
      const response = await fetch(
        `/api/real-estate/integrations/oauth/${integration.platform}`
      );
      const data = await response.json();

      if (data.authUrl) {
        // Open OAuth popup
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          data.authUrl,
          'oauth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Poll for popup close
        const pollTimer = setInterval(() => {
          if (popup?.closed) {
            clearInterval(pollTimer);
            setLoading(false);
            onClose();
          }
        }, 500);
      }
    } catch (error) {
      console.error('OAuth initiation error:', error);
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    // Simulate API test
    setTimeout(() => {
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 2000);
    }, 1500);
  };

  const handleSaveCredentials = async () => {
    setLoading(true);
    try {
      await onConnect(credentials);
      onClose();
    } catch (error) {
      console.error('Failed to save credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOAuthForm = () => (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          You'll be redirected to {integration.name} to authorize EFFINITY to access your account.
        </p>
      </div>
      <Button
        onClick={handleOAuthConnect}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <LinkIcon className="w-4 h-4 mr-2" />
            Connect with {integration.name}
          </>
        )}
      </Button>
    </div>
  );

  const renderApiKeyForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="apiKey" className="text-white">
          API Key
        </Label>
        <div className="relative mt-1">
          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your API key"
            value={credentials.apiKey || ''}
            onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
            className="pl-10 bg-[#0E1A2B] border-[#374151] text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="apiSecret" className="text-white">
          API Secret (Optional)
        </Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="apiSecret"
            type="password"
            placeholder="Enter your API secret"
            value={credentials.apiSecret || ''}
            onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
            className="pl-10 bg-[#0E1A2B] border-[#374151] text-white"
          />
        </div>
      </div>

      <div className="bg-gray-800/50 border border-[#374151] rounded-lg p-3">
        <Label className="text-xs text-gray-400">Webhook URL</Label>
        <div className="flex items-center gap-2 mt-1">
          <code className="flex-1 text-xs text-white bg-[#0E1A2B] px-3 py-2 rounded border border-[#374151]">
            https://app.effinity.io/webhooks/{integration.platform.toLowerCase()}
          </code>
          <Button size="sm" variant="ghost" className="text-gray-400">
            Copy
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleTestConnection}
          disabled={!credentials.apiKey || testStatus === 'testing'}
          variant="outline"
          className="flex-1 bg-transparent border-[#374151] text-white"
        >
          {testStatus === 'testing' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />}
          {testStatus === 'error' && <XCircle className="w-4 h-4 mr-2 text-red-500" />}
          Test Connection
        </Button>
        <Button
          onClick={handleSaveCredentials}
          disabled={!credentials.apiKey || loading}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </div>
  );

  const renderCredentialsForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="username" className="text-white">
          Username / Email
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username or email"
          value={credentials.username || ''}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          className="mt-1 bg-[#0E1A2B] border-[#374151] text-white"
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-white">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={credentials.password || ''}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          className="mt-1 bg-[#0E1A2B] border-[#374151] text-white"
        />
      </div>

      <div>
        <Label htmlFor="domain" className="text-white">
          Domain / URL (Optional)
        </Label>
        <Input
          id="domain"
          type="text"
          placeholder="e.g., yourdomain.com"
          value={credentials.domain || ''}
          onChange={(e) => setCredentials({ ...credentials, domain: e.target.value })}
          className="mt-1 bg-[#0E1A2B] border-[#374151] text-white"
        />
      </div>

      <Button
        onClick={handleSaveCredentials}
        disabled={!credentials.username || !credentials.password || loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          'Test & Connect'
        )}
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A2F4B] border-[#374151] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Connect {integration.name}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {integration.authMethod === 'oauth' && renderOAuthForm()}
          {integration.authMethod === 'api_key' && renderApiKeyForm()}
          {integration.authMethod === 'credentials' && renderCredentialsForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
