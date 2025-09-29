'use client';

import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { Job } from '@/lib/types/job';
import { safeFetchJobs } from '@/lib/safe-fetch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

function JobsPageContent() {
  const { t, language } = useLanguage();
  const { user, ownerUid, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if user is authenticated and ownerUid is available
    if (!ownerUid || authLoading) return;

    setLoading(true);
    safeFetchJobs(`/api/jobs?ownerUid=${ownerUid}`, { credentials: 'include' })
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [ownerUid, authLoading]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'he' ? 'היסטוריית עבודות' : 'Jobs History'}
        </h1>
        <p className="text-gray-600">
          {language === 'he'
            ? 'צפה בכל העבודות שהושלמו, כולל הסטטוס והלוגים'
            : 'View all completed jobs, including status and logs'
          }
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'he' ? 'כל העבודות' : 'All Jobs'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{language === 'he' ? 'סוג' : 'Type'}</th>
                  <th className="px-4 py-3">{language === 'he' ? 'סטטוס' : 'Status'}</th>
                  <th className="px-4 py-3">{language === 'he' ? 'נוצר' : 'Created'}</th>
                  <th className="px-4 py-3">{language === 'he' ? 'תמונות' : 'Images'}</th>
                  <th className="px-4 py-3">{language === 'he' ? 'פעולה' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(jobs) && jobs.length > 0 ? jobs.map((job) => (
                  <tr key={job.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{job.id}</td>
                    <td className="px-4 py-3 text-gray-900">{job.type ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={
                        `text-xs px-2 py-1 rounded-full border font-medium ${
                          job.status === 'SUCCESS' || job.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                          job.status === 'FAILED'  ? 'bg-red-50 text-red-700 border-red-200' :
                          job.status === 'RUNNING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          job.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                     'bg-gray-50 text-gray-700 border-gray-200'
                        }`
                      }>{job.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {job.createdAt ? new Date(job.createdAt).toLocaleString() : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{job.metrics?.images ?? ''}</td>
                    <td className="px-4 py-3">
                      {(job.status === 'SUCCESS' || job.status === 'COMPLETED') && job.type === 'shopify_csv'
                        ? <a
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                            href={`/api/jobs/${job.id}/output`}
                          >
                            {language === 'he' ? 'הורד CSV' : 'Download CSV'}
                          </a>
                        : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                      {language === 'he'
                        ? 'אין עדיין עבודות — העלה ZIP כדי להתחיל'
                        : 'No jobs yet — upload a ZIP to get started'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JobsPage() {
  return (
    <LanguageProvider>
      <JobsPageContent />
    </LanguageProvider>
  );
}