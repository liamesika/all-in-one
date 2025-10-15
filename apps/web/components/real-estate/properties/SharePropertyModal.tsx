"use client";

import { useState } from "react";
import { X, Copy, Check, Share2, MessageCircle, Mail } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/lib/language-context";

interface Property {
  id: string;
  name: string;
  city?: string;
  slug?: string;
  transactionType?: "SALE" | "RENT";
  price?: number;
  rentPriceMonthly?: number;
}

interface SharePropertyModalProps {
  isOpen: boolean;
  property: Property;
  onClose: () => void;
}

export function SharePropertyModal({
  isOpen,
  property,
  onClose,
}: SharePropertyModalProps) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [generatingSlug, setGeneratingSlug] = useState(false);

  if (!isOpen) return null;

  // Generate the property URL
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://effinity.co.il";
  const propertyUrl = property.slug
    ? `${baseUrl}/property/${property.slug}`
    : "";

  const handleCopyToClipboard = async () => {
    if (!propertyUrl) return;

    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleGenerateSlug = async () => {
    setGeneratingSlug(true);
    try {
      const response = await fetch(`/api/real-estate/properties/${property.id}/slug`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh the page to update the property with the new slug
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to generate slug:", error);
    } finally {
      setGeneratingSlug(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!propertyUrl) return;

    const isSale = property.transactionType === "SALE";
    const priceText = isSale && property.price
      ? `at ₪${property.price.toLocaleString()}`
      : !isSale && property.rentPriceMonthly
      ? `at ₪${property.rentPriceMonthly.toLocaleString()}/month`
      : "";

    const message = encodeURIComponent(
      `Check out this ${isSale ? 'property for sale' : 'rental property'}: ${property.name} in ${property.city || ''} ${priceText}\n\n${propertyUrl}`
    );

    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleShareEmail = () => {
    if (!propertyUrl) return;

    const subject = encodeURIComponent(`Property Listing: ${property.name}`);
    const body = encodeURIComponent(
      `I wanted to share this property with you:\n\n${property.name}\nLocation: ${property.city || 'N/A'}\n\nView full details: ${propertyUrl}`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const texts = {
    en: {
      title: "Share Property",
      url: "Property URL",
      copy: "Copy Link",
      copied: "Copied!",
      qrCode: "QR Code",
      shareVia: "Share via",
      whatsapp: "WhatsApp",
      email: "Email",
      close: "Close",
      noSlug: "No landing page yet",
      generate: "Generate Landing Page",
      generating: "Generating...",
      description: "Share this property landing page with potential buyers or renters. They can view all details and contact you directly.",
    },
    he: {
      title: "שיתוף נכס",
      url: "כתובת הנכס",
      copy: "העתק קישור",
      copied: "הועתק!",
      qrCode: "קוד QR",
      shareVia: "שתף דרך",
      whatsapp: "WhatsApp",
      email: "אימייל",
      close: "סגור",
      noSlug: "עדיין אין דף נחיתה",
      generate: "צור דף נחיתה",
      generating: "יוצר...",
      description: "שתף את דף הנחיתה של הנכס עם קונים או שוכרים פוטנציאליים. הם יוכלו לראות את כל הפרטים וליצור איתך קשר ישירות.",
    },
  };

  const t = texts[language as keyof typeof texts];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
              <p className="text-sm text-gray-500 truncate max-w-xs">
                {property.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Description */}
          <p className="text-sm text-gray-600">
            {t.description}
          </p>

          {!property.slug ? (
            // No slug - show generate button
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4">
              <div className="text-amber-800 font-medium">{t.noSlug}</div>
              <button
                onClick={handleGenerateSlug}
                disabled={generatingSlug}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingSlug ? t.generating : t.generate}
              </button>
            </div>
          ) : (
            <>
              {/* URL Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.url}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={propertyUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm"
                  />
                  <button
                    onClick={handleCopyToClipboard}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t.copy}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.qrCode}
                </label>
                <div className="flex justify-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <QRCodeSVG
                    value={propertyUrl}
                    size={200}
                    level="H"
                    includeMargin
                    bgColor="#FFFFFF"
                    fgColor="#111827"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {language === "he"
                    ? "סרוק כדי לפתוח את דף הנכס"
                    : "Scan to open property page"}
                </p>
              </div>

              {/* Share Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.shareVia}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t.whatsapp}
                  </button>
                  <button
                    onClick={handleShareEmail}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <Mail className="w-5 h-5" />
                    {t.email}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-h-[44px]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
