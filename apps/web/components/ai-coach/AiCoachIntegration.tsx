'use client';

import React, { useEffect } from 'react';
// Temporary fallback: replaced framer-motion for Vercel build compatibility
// import { AnimatePresence } from 'framer-motion';
import AiChatWidget from './AiChatWidget';
import ProactiveWelcome from './ProactiveWelcome';
import { useAiCoach, useLoginDetection } from '../../lib/ai-coach-context';

interface AiCoachIntegrationProps {
  ownerUid: string;
  organizationId?: string;
  enableProactive?: boolean;
  enableChat?: boolean;
  className?: string;
}

export default function AiCoachIntegration({
  ownerUid,
  organizationId,
  enableProactive = true,
  enableChat = true,
  className
}: AiCoachIntegrationProps) {
  const {
    shouldShowWelcome,
    dismissWelcome,
    isWelcomeEnabled,
    setWelcomeEnabled
  } = useAiCoach();

  const isNewSession = useLoginDetection(ownerUid);

  // Enable/disable proactive messages based on prop
  useEffect(() => {
    setWelcomeEnabled(enableProactive);
  }, [enableProactive, setWelcomeEnabled]);

  // Track page visibility to potentially show welcome on return
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && enableProactive && isNewSession) {
        // User returned to tab and it's a new session - could trigger welcome
        // This is handled by the context automatically
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enableProactive, isNewSession]);

  return (
    <div className={className}>
      {/* Proactive Welcome Messages */}
      {enableProactive && shouldShowWelcome && isWelcomeEnabled && (
        <ProactiveWelcome
          ownerUid={ownerUid}
          organizationId={organizationId}
          onClose={dismissWelcome}
        />
      )}

      {/* Chat Widget */}
      {enableChat && (
        <AiChatWidget
          ownerUid={ownerUid}
          organizationId={organizationId}
        />
      )}
    </div>
  );
}