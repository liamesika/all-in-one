'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  ChevronRight,
  Loader2,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
} from '@/components/shared';
import { RealEstateHeader } from '@/components/dashboard/RealEstateHeader';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface PerformanceReport {
  id: string;
  storeDomain: string;
  performanceScore: number;
  seoScore: number;
  ttfb: number;
  lcp: number;
  cls: number;
  fid: number;
  recommendations: Array<{
    category: string;
    issue: string;
    solution: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  createdAt: string;
}

export function PerformanceCheckClient() {
  const router = useRouter();
  const { lang } = useLang();
  const [storeDomain, setStoreDomain] = useState('');
  const [running, setRunning] = useState(false);
  const [currentReport, setCurrentReport] = useState<PerformanceReport | null>(null);
  const [history, setHistory] = useState<PerformanceReport[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/ecommerce/performance/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data.reports);
          if (data.lastDomain) {
            setStoreDomain(data.lastDomain);
          }
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    fetchHistory();
  }, []);

  const handleRunCheck = async () => {
    if (!storeDomain) return;

    setRunning(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/ecommerce/performance/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: storeDomain }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentReport(data.report);
        setHistory(prev => [data.report, ...prev]);
      }
    } catch (error) {
      console.error('Performance check failed:', error);
    } finally {
      setRunning(false);
    }
  };

  const handleExportPDF = async () => {
    if (!currentReport) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/ecommerce/performance/export/pdf?reportId=${currentReport.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${currentReport.storeDomain}-${Date.now()}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  const handleExportJSON = () => {
    if (!currentReport) return;

    const json = JSON.stringify(currentReport, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${currentReport.storeDomain}-${Date.now()}.json`;
    a.click();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      <RealEstateHeader />

      <div className="pt-20 pb-16 max-w-full mx-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2979FF] mb-4 transition-colors"
          >
            <ChevronRight className={`w-5 h-5 ${lang === 'he' ? '' : 'rotate-180'}`} />
            <span>{lang === 'he' ? 'חזרה' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="w-8 h-8 text-[#2979FF]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {lang === 'he' ? 'בדיקת ביצועים' : 'Performance Check'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {lang === 'he'
                  ? 'ניתוח ביצועים ו-SEO של החנות שלך'
                  : 'Analyze your store performance and SEO'}
              </p>
            </div>
          </div>

          {/* Run Check */}
          <UniversalCard variant="elevated" className="mb-8">
            <CardBody>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {lang === 'he' ? 'כתובת החנות' : 'Store Domain'}
                  </label>
                  <input
                    type="url"
                    value={storeDomain}
                    onChange={e => setStoreDomain(e.target.value)}
                    placeholder="https://your-store.myshopify.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <UniversalButton
                    onClick={handleRunCheck}
                    disabled={!storeDomain || running}
                    className="w-full sm:w-auto min-w-[140px]"
                  >
                    {running ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {lang === 'he' ? 'רץ...' : 'Running...'}
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        {lang === 'he' ? 'הרץ בדיקה' : 'Run Check'}
                      </>
                    )}
                  </UniversalButton>
                </div>
              </div>
            </CardBody>
          </UniversalCard>

          {/* Current Report */}
          {currentReport && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <UniversalCard variant="elevated">
                  <CardBody>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {lang === 'he' ? 'ביצועים' : 'Performance'}
                      </span>
                      <BarChart3 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(currentReport.performanceScore)}`}>
                      {currentReport.performanceScore}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                      <div
                        className={`h-2 rounded-full transition-all ${getScoreBg(currentReport.performanceScore)}`}
                        style={{ width: `${currentReport.performanceScore}%` }}
                      />
                    </div>
                  </CardBody>
                </UniversalCard>

                <UniversalCard variant="elevated">
                  <CardBody>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">SEO</span>
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(currentReport.seoScore)}`}>
                      {currentReport.seoScore}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                      <div
                        className={`h-2 rounded-full transition-all ${getScoreBg(currentReport.seoScore)}`}
                        style={{ width: `${currentReport.seoScore}%` }}
                      />
                    </div>
                  </CardBody>
                </UniversalCard>

                <UniversalCard variant="elevated">
                  <CardBody>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {lang === 'he' ? 'זמן לתוכן הראשון' : 'LCP'}
                      </span>
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {currentReport.lcp.toFixed(1)}s
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {lang === 'he' ? 'טוב: < 2.5s' : 'Good: < 2.5s'}
                    </div>
                  </CardBody>
                </UniversalCard>

                <UniversalCard variant="elevated">
                  <CardBody>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {lang === 'he' ? 'יציבות חזותית' : 'CLS'}
                      </span>
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {currentReport.cls.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {lang === 'he' ? 'טוב: < 0.1' : 'Good: < 0.1'}
                    </div>
                  </CardBody>
                </UniversalCard>
              </div>

              {/* Recommendations */}
              <UniversalCard variant="elevated" className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lang === 'he' ? 'המלצות לשיפור' : 'Recommendations'}
                    </h3>
                    <div className="flex gap-2">
                      <UniversalButton onClick={handleExportJSON} variant="secondary" size="sm">
                        <Download className="w-4 h-4" />
                        JSON
                      </UniversalButton>
                      <UniversalButton onClick={handleExportPDF} size="sm">
                        <Download className="w-4 h-4" />
                        PDF
                      </UniversalButton>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {currentReport.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4"
                        style={{
                          borderColor:
                            rec.priority === 'high' ? '#EF4444' : rec.priority === 'medium' ? '#F59E0B' : '#10B981',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {rec.priority === 'high' ? (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : rec.priority === 'medium' ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                {rec.category}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  rec.priority === 'high'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                                    : rec.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                                }`}
                              >
                                {rec.priority === 'high'
                                  ? lang === 'he'
                                    ? 'דחוף'
                                    : 'High'
                                  : rec.priority === 'medium'
                                  ? lang === 'he'
                                    ? 'בינוני'
                                    : 'Medium'
                                  : lang === 'he'
                                  ? 'נמוך'
                                  : 'Low'}
                              </span>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white mb-2">{rec.issue}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{rec.solution}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </UniversalCard>
            </>
          )}

          {/* History */}
          {history.length > 0 && (
            <UniversalCard variant="elevated">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lang === 'he' ? 'היסטוריה' : 'History'}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {history.slice(0, 5).map(report => (
                    <div
                      key={report.id}
                      onClick={() => setCurrentReport(report)}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{report.storeDomain}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(report.createdAt).toLocaleString(lang === 'he' ? 'he-IL' : 'en-US')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(report.performanceScore)}`}>
                            {report.performanceScore}
                          </div>
                          <div className="text-xs text-gray-500">
                            {lang === 'he' ? 'ביצועים' : 'Performance'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(report.seoScore)}`}>
                            {report.seoScore}
                          </div>
                          <div className="text-xs text-gray-500">SEO</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </UniversalCard>
          )}
        </div>
      </div>
    </div>
  );
}
