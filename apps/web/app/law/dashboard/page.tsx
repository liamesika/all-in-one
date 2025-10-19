import { redirect } from 'next/navigation';

interface SearchParams {
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  attorneyId?: string;
  practiceArea?: string;
  matterStage?: string;
  matterStatus?: string;
  leadSource?: string;
  search?: string;
  lang?: string;
}

export default async function LawDashboardRedirect({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Build query string from searchParams
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.set(key, value);
  });

  const queryString = queryParams.toString();
  const destination = `/dashboard/law/dashboard${queryString ? `?${queryString}` : ''}`;

  redirect(destination);
}
