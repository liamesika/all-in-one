import { Job, normalizeJobsResponse } from './types/job';

export async function safeFetchJobs(url: string, options?: RequestInit): Promise<Job[]> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json-array',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      console.error(`Jobs API returned ${response.status}: ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    // Handle both array and object responses
    const normalizedJobs = normalizeJobsResponse(data);

    // Log warning if response was not an array (for telemetry)
    if (!Array.isArray(data)) {
      console.warn('Jobs API returned non-array response, normalized to array:', {
        originalType: typeof data,
        hasJobsProperty: data && typeof data === 'object' && 'jobs' in data,
        normalizedCount: normalizedJobs.length
      });
    }

    return normalizedJobs;
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return [];
  }
}

export async function safeFetchJobsSummary(url: string, options?: RequestInit): Promise<any> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`Jobs summary API returned ${response.status}: ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch jobs summary:', error);
    return null;
  }
}