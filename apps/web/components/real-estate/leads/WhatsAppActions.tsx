'use client';

import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface WhatsAppActionsProps {
  phone?: string;
  leadName?: string;
  className?: string;
  variant?: 'icon' | 'button';
}

/**
 * WhatsAppActions Component
 * Opens WhatsApp Web with pre-filled message for a single lead
 */
export function WhatsAppActions({ phone, leadName, className = '', variant = 'icon' }: WhatsAppActionsProps) {
  const { language } = useLanguage();

  const t = {
    whatsapp: language === 'he' ? 'שלח WhatsApp' : 'Send WhatsApp',
    noPhone: language === 'he' ? 'אין מספר טלפון' : 'No phone number',
  };

  const handleOpenWhatsApp = () => {
    if (!phone) {
      alert(t.noPhone);
      return;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    // Create message
    const greeting = language === 'he' ? 'שלום' : 'Hello';
    const message = leadName ? `${greeting} ${leadName},` : `${greeting},`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp Web
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!phone) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleOpenWhatsApp}
        title={t.whatsapp}
        className={`p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleOpenWhatsApp}
      className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      {t.whatsapp}
    </button>
  );
}

interface BatchWhatsAppActionsProps {
  leads: Array<{ id: string; phone?: string; fullName?: string }>;
  onComplete?: () => void;
}

/**
 * BatchWhatsAppActions Component
 * Opens WhatsApp Web with pre-filled message for multiple leads
 */
export function BatchWhatsAppActions({ leads, onComplete }: BatchWhatsAppActionsProps) {
  const { language } = useLanguage();

  const t = {
    sendBatch: language === 'he' ? 'שלח WhatsApp לנבחרים' : 'Send WhatsApp to Selected',
    noLeads: language === 'he' ? 'אין לידים נבחרים' : 'No leads selected',
    noPhones: language === 'he' ? 'אף אחד מהלידים הנבחרים אין לו מספר טלפון' : 'None of the selected leads have phone numbers',
  };

  const handleBatchWhatsApp = () => {
    if (leads.length === 0) {
      alert(t.noLeads);
      return;
    }

    // Filter leads with phone numbers
    const leadsWithPhone = leads.filter((lead) => lead.phone);

    if (leadsWithPhone.length === 0) {
      alert(t.noPhones);
      return;
    }

    // For batch, we'll open WhatsApp with the first lead and include info about others
    const firstLead = leadsWithPhone[0];
    const cleanPhone = firstLead.phone!.replace(/[\s\-()]/g, '');

    // Create message with batch info
    const greeting = language === 'he' ? 'שלום' : 'Hello';
    let message = firstLead.fullName ? `${greeting} ${firstLead.fullName},` : `${greeting},`;

    if (leadsWithPhone.length > 1) {
      const additionalNote =
        language === 'he'
          ? `\n\n(הערה: נבחרו ${leadsWithPhone.length} איש קשר לפנייה)`
          : `\n\n(Note: ${leadsWithPhone.length} contacts selected for outreach)`;
      message += additionalNote;
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp Web with first lead
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // Note: For true batch messaging, you would need to open multiple windows or use WhatsApp Business API
    // This implementation opens the first contact with a note about the batch

    onComplete?.();
  };

  return (
    <button
      onClick={handleBatchWhatsApp}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      <MessageCircle className="w-4 h-4" />
      {t.sendBatch} ({leads.length})
    </button>
  );
}
