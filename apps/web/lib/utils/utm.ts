// UTM parameter preservation utilities

export function getUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  // Standard UTM parameters
  const utmKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ];

  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  // Also check sessionStorage for preserved UTMs
  try {
    const stored = sessionStorage.getItem('utm_params');
    if (stored) {
      const storedParams = JSON.parse(stored);
      Object.assign(utmParams, storedParams);
    }
  } catch (e) {
    // Ignore storage errors
  }

  return utmParams;
}

export function preserveUTMParams(): void {
  if (typeof window === 'undefined') return;

  const utmParams = getUTMParams();

  // Store in sessionStorage for persistence across navigation
  if (Object.keys(utmParams).length > 0) {
    try {
      sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
    } catch (e) {
      // Ignore storage errors
    }
  }
}

export function appendUTMParams(url: string): string {
  const utmParams = getUTMParams();

  if (Object.keys(utmParams).length === 0) {
    return url;
  }

  const urlObj = new URL(url, window.location.origin);
  Object.entries(utmParams).forEach(([key, value]) => {
    if (!urlObj.searchParams.has(key)) {
      urlObj.searchParams.set(key, value);
    }
  });

  return urlObj.pathname + urlObj.search;
}
