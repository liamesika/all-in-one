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

export default function LawDashboardRedirect({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Build query string from searchParams
  const queryParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) queryParams.set(key, value);
  });

  const queryString = queryParams.toString();
  const destination = `/dashboard/law/dashboard${queryString ? `?${queryString}` : ''}`;

  redirect(destination);
}
