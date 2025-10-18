// Analytics consent management

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for common consent management platforms
  // Google Consent Mode v2
  if (typeof (window as any).gtag === 'function') {
    // If gtag exists, assume consent is managed properly
    // The actual consent state is handled by the CMP
    return true;
  }

  // OneTrust
  if ((window as any).OnetrustActiveGroups) {
    const groups = (window as any).OnetrustActiveGroups;
    // Check if performance/analytics cookies are enabled (usually group C0002)
    return groups.includes('C0002') || groups.includes(',C0002,');
  }

  // Cookiebot
  if ((window as any).Cookiebot) {
    return (window as any).Cookiebot.consent?.statistics === true;
  }

  // If no CMP detected, default to true (consent assumed)
  return true;
}

export function trackEventWithConsent(
  eventName: string,
  params?: Record<string, any>
) {
  if (!hasAnalyticsConsent()) {
    console.debug(`Analytics event blocked (no consent): ${eventName}`);
    return;
  }

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
}
