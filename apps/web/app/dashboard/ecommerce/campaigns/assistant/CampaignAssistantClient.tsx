'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  ChevronRight,
  Loader2,
  Download,
  Sparkles,
  Users,
  FileText,
  History,
  CheckCircle2,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
} from '@/components/shared';
import { EcommerceHeader } from '@/components/dashboard/RealEstateHeader';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface CampaignBrief {
  goal: string;
  budget: string;
  targetRegion: string;
  targetAudience: string;
  productCategory: string;
  additionalNotes: string;
}

interface AudienceSuggestion {
  id: string;
  name: string;
  description: string;
  demographics: string;
  interests: string[];
  estimatedReach: string;
}

interface AdCopyVariant {
  id: string;
  headline: string;
  body: string;
  cta: string;
  tone: string;
}

interface CampaignVersion {
  id: string;
  brief: CampaignBrief;
  audiences: AudienceSuggestion[];
  adCopies: AdCopyVariant[];
  createdAt: string;
}

export function CampaignAssistantClient() {
  const router = useRouter();
  const { lang } = useLang();

  const [brief, setBrief] = useState<CampaignBrief>({
    goal: '',
    budget: '',
    targetRegion: '',
    targetAudience: '',
    productCategory: '',
    additionalNotes: '',
  });

  const [generating, setGenerating] = useState(false);
  const [audiences, setAudiences] = useState<AudienceSuggestion[]>([]);
  const [adCopies, setAdCopies] = useState<AdCopyVariant[]>([]);
  const [history, setHistory] = useState<CampaignVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<CampaignVersion | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/ecommerce/campaigns/assistant/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data.versions);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    fetchHistory();
  }, []);

  const handleGenerate = async () => {
    if (!brief.goal || !brief.budget) return;

    setGenerating(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/ecommerce/campaigns/assistant/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brief }),
      });

      if (response.ok) {
        const data = await response.json();
        setAudiences(data.audiences);
        setAdCopies(data.adCopies);
        setCurrentVersion(data.version);
        setHistory(prev => [data.version, ...prev]);
      }
    } catch (error) {
      console.error('Campaign generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportJSON = () => {
    if (!currentVersion) return;

    const json = JSON.stringify(currentVersion, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${currentVersion.id}-${Date.now()}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    if (!currentVersion) return;

    const headers = ['Type', 'Name', 'Content', 'Details'];
    const rows: string[][] = [];

    // Add audiences
    currentVersion.audiences.forEach(aud => {
      rows.push([
        'Audience',
        aud.name,
        aud.description,
        `Demographics: ${aud.demographics} | Interests: ${aud.interests.join(', ')} | Reach: ${aud.estimatedReach}`,
      ]);
    });

    // Add ad copies
    currentVersion.adCopies.forEach(ad => {
      rows.push([
        'Ad Copy',
        ad.headline,
        ad.body,
        `CTA: ${ad.cta} | Tone: ${ad.tone}`,
      ]);
    });

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${currentVersion.id}-${Date.now()}.csv`;
    a.click();
  };

  const loadVersion = (version: CampaignVersion) => {
    setCurrentVersion(version);
    setBrief(version.brief);
    setAudiences(version.audiences);
    setAdCopies(version.adCopies);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      <EcommerceHeader />

      <div className="pt-24 pb-16 max-w-full mx-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2979FF] mb-4 transition-colors"
          >
            <ChevronRight className={`w-5 h-5 ${lang === 'he' ? '' : 'rotate-180'}`} />
            <span>{lang === 'he' ? 'חזרה' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <Megaphone className="w-8 h-8 text-[#2979FF]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {lang === 'he' ? 'עוזר קמפיינים' : 'Campaign Assistant'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {lang === 'he'
                  ? 'צור קמפיינים מותאמים אישית עם AI'
                  : 'Create personalized campaigns with AI'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Brief Form */}
            <div className="lg:col-span-1">
              <UniversalCard variant="elevated" className="sticky top-24">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {lang === 'he' ? 'תדריך קמפיין' : 'Campaign Brief'}
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'מטרה' : 'Goal'} *
                      </label>
                      <select
                        value={brief.goal}
                        onChange={e => setBrief(prev => ({ ...prev, goal: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">
                          {lang === 'he' ? 'בחר מטרה' : 'Select goal'}
                        </option>
                        <option value="awareness">
                          {lang === 'he' ? 'מודעות למותג' : 'Brand Awareness'}
                        </option>
                        <option value="traffic">
                          {lang === 'he' ? 'תנועה לאתר' : 'Website Traffic'}
                        </option>
                        <option value="conversions">
                          {lang === 'he' ? 'המרות' : 'Conversions'}
                        </option>
                        <option value="engagement">
                          {lang === 'he' ? 'מעורבות' : 'Engagement'}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'תקציב יומי' : 'Daily Budget'} *
                      </label>
                      <input
                        type="text"
                        value={brief.budget}
                        onChange={e => setBrief(prev => ({ ...prev, budget: e.target.value }))}
                        placeholder={lang === 'he' ? '₪500' : '$100'}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'אזור יעד' : 'Target Region'}
                      </label>
                      <input
                        type="text"
                        value={brief.targetRegion}
                        onChange={e => setBrief(prev => ({ ...prev, targetRegion: e.target.value }))}
                        placeholder={lang === 'he' ? 'ישראל, תל אביב' : 'United States, New York'}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'קהל יעד' : 'Target Audience'}
                      </label>
                      <input
                        type="text"
                        value={brief.targetAudience}
                        onChange={e => setBrief(prev => ({ ...prev, targetAudience: e.target.value }))}
                        placeholder={lang === 'he' ? 'נשים 25-45' : 'Women 25-45'}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'קטגוריית מוצר' : 'Product Category'}
                      </label>
                      <input
                        type="text"
                        value={brief.productCategory}
                        onChange={e => setBrief(prev => ({ ...prev, productCategory: e.target.value }))}
                        placeholder={lang === 'he' ? 'אופנה, אלקטרוניקה' : 'Fashion, Electronics'}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'הערות נוספות' : 'Additional Notes'}
                      </label>
                      <textarea
                        value={brief.additionalNotes}
                        onChange={e => setBrief(prev => ({ ...prev, additionalNotes: e.target.value }))}
                        rows={3}
                        placeholder={lang === 'he' ? 'הערות נוספות...' : 'Additional notes...'}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      />
                    </div>

                    <UniversalButton
                      onClick={handleGenerate}
                      disabled={!brief.goal || !brief.budget || generating}
                      className="w-full"
                      size="lg"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {lang === 'he' ? 'מייצר...' : 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {lang === 'he' ? 'צור קמפיין' : 'Generate Campaign'}
                        </>
                      )}
                    </UniversalButton>
                  </div>
                </CardBody>
              </UniversalCard>
            </div>

            {/* Right Panel - Results */}
            <div className="lg:col-span-2">
              {currentVersion && (
                <>
                  {/* Export Actions */}
                  <div className="flex gap-3 mb-6">
                    <UniversalButton onClick={handleExportJSON} variant="secondary" size="sm">
                      <Download className="w-4 h-4" />
                      JSON
                    </UniversalButton>
                    <UniversalButton onClick={handleExportCSV} variant="secondary" size="sm">
                      <Download className="w-4 h-4" />
                      CSV
                    </UniversalButton>
                  </div>

                  {/* Audiences */}
                  <UniversalCard variant="elevated" className="mb-8">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#2979FF]" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {lang === 'he' ? 'קהלי יעד מוצעים' : 'Suggested Audiences'}
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        {audiences.map((audience, index) => (
                          <div
                            key={audience.id}
                            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-[#2979FF]"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {index + 1}. {audience.name}
                              </h4>
                              <CheckCircle2 className="w-5 h-5 text-[#2979FF] flex-shrink-0" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {audience.description}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {lang === 'he' ? 'דמוגרפיה:' : 'Demographics:'}
                                </span>{' '}
                                <span className="text-gray-600 dark:text-gray-400">
                                  {audience.demographics}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {lang === 'he' ? 'טווח הגעה:' : 'Estimated Reach:'}
                                </span>{' '}
                                <span className="text-gray-600 dark:text-gray-400">
                                  {audience.estimatedReach}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {lang === 'he' ? 'תחומי עניין:' : 'Interests:'}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {audience.interests.map((interest, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </UniversalCard>

                  {/* Ad Copies */}
                  <UniversalCard variant="elevated" className="mb-8">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#10B981]" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {lang === 'he' ? 'גרסאות קופי פרסומי' : 'Ad Copy Variants'}
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adCopies.map((copy, index) => (
                          <div
                            key={copy.id}
                            className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                {lang === 'he' ? 'גרסה' : 'Variant'} {index + 1}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                {copy.tone}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                              {copy.headline}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {copy.body}
                            </p>
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-xs font-semibold text-[#2979FF]">
                                {copy.cta}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </UniversalCard>
                </>
              )}

              {/* Empty State */}
              {!currentVersion && !generating && (
                <UniversalCard variant="elevated">
                  <CardBody>
                    <div className="text-center py-12">
                      <Megaphone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {lang === 'he' ? 'אין קמפיינים עדיין' : 'No campaigns yet'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {lang === 'he'
                          ? 'מלא את פרטי התדריך וצור קמפיין'
                          : 'Fill out the brief and generate a campaign'}
                      </p>
                    </div>
                  </CardBody>
                </UniversalCard>
              )}

              {/* History */}
              {history.length > 0 && (
                <UniversalCard variant="elevated" className="mt-8">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {lang === 'he' ? 'היסטוריה' : 'History'}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {history.slice(0, 5).map(version => (
                        <div
                          key={version.id}
                          onClick={() => loadVersion(version)}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {version.brief.goal} - {version.brief.productCategory || 'General'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(version.createdAt).toLocaleString(
                                lang === 'he' ? 'he-IL' : 'en-US'
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-bold text-[#2979FF]">
                                {version.audiences.length}
                              </div>
                              <div className="text-xs text-gray-500">
                                {lang === 'he' ? 'קהלים' : 'Audiences'}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-[#10B981]">
                                {version.adCopies.length}
                              </div>
                              <div className="text-xs text-gray-500">
                                {lang === 'he' ? 'גרסאות' : 'Copies'}
                              </div>
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
      </div>
    </div>
  );
}
