'use client';

import { useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface NeighborhoodGuide {
  id: string;
  neighborhood: string;
  city: string;
  status: 'published' | 'draft' | 'updating';
  lastUpdated: string;
  views: number;
  downloads: number;
  shares: number;
  leadGenerated: number;
  avgTimeOnPage: number; // seconds
  bounceRate: number; // percentage
  topSources: string[];
  content: {
    schools: number;
    restaurants: number;
    parks: number;
    transport: number;
    shopping: number;
    healthcare: number;
  };
  marketData: {
    avgPrice: number;
    priceChange: number; // percentage
    inventory: number;
    avgDOM: number;
    transactions: number;
  };
  engagement: {
    comments: number;
    likes: number;
    bookmarks: number;
    propertyInquiries: number;
  };
}

interface NeighborhoodGuideWidgetProps {
  data?: NeighborhoodGuide[];
  onViewDetails?: () => void;
  onGuideClick?: (guideId: string) => void;
}

export function NeighborhoodGuideWidget({ data, onViewDetails, onGuideClick }: NeighborhoodGuideWidgetProps) {
  const { lang } = useLang();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'content'>('overview');
  const [sortBy, setSortBy] = useState<'views' | 'leads' | 'engagement' | 'updated'>('views');

  const mockGuides: NeighborhoodGuide[] = data?.length ? data : [
    {
      id: '1',
      neighborhood: 'Rothschild Boulevard',
      city: 'Tel Aviv',
      status: 'published',
      lastUpdated: '2024-01-15T10:30:00Z',
      views: 2847,
      downloads: 156,
      shares: 89,
      leadGenerated: 34,
      avgTimeOnPage: 245,
      bounceRate: 28,
      topSources: ['Google', 'Social Media', 'Direct'],
      content: {
        schools: 8,
        restaurants: 45,
        parks: 3,
        transport: 12,
        shopping: 23,
        healthcare: 6
      },
      marketData: {
        avgPrice: 2800000,
        priceChange: 8.5,
        inventory: 23,
        avgDOM: 28,
        transactions: 12
      },
      engagement: {
        comments: 23,
        likes: 156,
        bookmarks: 89,
        propertyInquiries: 45
      }
    },
    {
      id: '2',
      neighborhood: 'Florentin',
      city: 'Tel Aviv',
      status: 'published',
      lastUpdated: '2024-01-12T14:20:00Z',
      views: 1956,
      downloads: 98,
      shares: 67,
      leadGenerated: 28,
      avgTimeOnPage: 198,
      bounceRate: 35,
      topSources: ['Instagram', 'Google', 'Referral'],
      content: {
        schools: 5,
        restaurants: 67,
        parks: 2,
        transport: 8,
        shopping: 34,
        healthcare: 4
      },
      marketData: {
        avgPrice: 2200000,
        priceChange: 12.3,
        inventory: 34,
        avgDOM: 32,
        transactions: 18
      },
      engagement: {
        comments: 45,
        likes: 234,
        bookmarks: 123,
        propertyInquiries: 56
      }
    },
    {
      id: '3',
      neighborhood: 'German Colony',
      city: 'Jerusalem',
      status: 'updating',
      lastUpdated: '2024-01-08T09:15:00Z',
      views: 1234,
      downloads: 67,
      shares: 34,
      leadGenerated: 19,
      avgTimeOnPage: 312,
      bounceRate: 22,
      topSources: ['Google', 'Direct', 'Email'],
      content: {
        schools: 12,
        restaurants: 28,
        parks: 6,
        transport: 15,
        shopping: 18,
        healthcare: 8
      },
      marketData: {
        avgPrice: 3200000,
        priceChange: 5.7,
        inventory: 18,
        avgDOM: 35,
        transactions: 8
      },
      engagement: {
        comments: 18,
        likes: 98,
        bookmarks: 56,
        propertyInquiries: 34
      }
    },
    {
      id: '4',
      neighborhood: 'Neve Tzedek',
      city: 'Tel Aviv',
      status: 'draft',
      lastUpdated: '2024-01-10T16:45:00Z',
      views: 0,
      downloads: 0,
      shares: 0,
      leadGenerated: 0,
      avgTimeOnPage: 0,
      bounceRate: 0,
      topSources: [],
      content: {
        schools: 6,
        restaurants: 52,
        parks: 4,
        transport: 10,
        shopping: 28,
        healthcare: 5
      },
      marketData: {
        avgPrice: 4200000,
        priceChange: 6.8,
        inventory: 12,
        avgDOM: 25,
        transactions: 6
      },
      engagement: {
        comments: 0,
        likes: 0,
        bookmarks: 0,
        propertyInquiries: 0
      }
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-300';
      case 'updating': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEngagementScore = (guide: NeighborhoodGuide) => {
    const score = guide.views + (guide.shares * 5) + (guide.engagement.likes * 2) + (guide.engagement.propertyInquiries * 10);
    return score;
  };

  const sortedGuides = [...mockGuides].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.views - a.views;
      case 'leads':
        return b.leadGenerated - a.leadGenerated;
      case 'engagement':
        return getEngagementScore(b) - getEngagementScore(a);
      case 'updated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return 0;
    }
  });

  const publishedGuides = mockGuides.filter(guide => guide.status === 'published');
  const totalViews = publishedGuides.reduce((sum, guide) => sum + guide.views, 0);
  const totalLeads = publishedGuides.reduce((sum, guide) => sum + guide.leadGenerated, 0);
  const totalEngagement = publishedGuides.reduce((sum, guide) => sum + guide.engagement.likes + guide.engagement.comments + guide.engagement.bookmarks, 0);
  const avgBounceRate = publishedGuides.reduce((sum, guide) => sum + guide.bounceRate, 0) / Math.max(1, publishedGuides.length);

  const tabs = [
    { id: 'overview', label: lang === 'he' ? 'סקירה כללית' : 'Overview' },
    { id: 'performance', label: lang === 'he' ? 'ביצועים' : 'Performance' },
    { id: 'content', label: lang === 'he' ? 'תוכן' : 'Content' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'he' ? 'שימוש במדריכי שכונות' : 'Neighborhood Guide Usage'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {lang === 'he' 
              ? `${totalViews.toLocaleString()} צפיות • ${totalLeads} לידים • ${avgBounceRate.toFixed(0)}% bounce rate`
              : `${totalViews.toLocaleString()} views • ${totalLeads} leads • ${avgBounceRate.toFixed(0)}% bounce rate`
            }
          </p>
        </div>
        
        <button 
          onClick={onViewDetails}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {lang === 'he' ? 'הצג פרטים' : 'View Details'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{publishedGuides.length}</div>
              <div className="text-xs text-gray-600">
                {lang === 'he' ? 'מדריכים פרסומים' : 'Published Guides'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{totalViews.toLocaleString()}</div>
              <div className="text-xs text-gray-600">
                {lang === 'he' ? 'סה״כ צפיות' : 'Total Views'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{totalLeads}</div>
              <div className="text-xs text-gray-600">
                {lang === 'he' ? 'לידים שנוצרו' : 'Leads Generated'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{totalEngagement}</div>
              <div className="text-xs text-gray-600">
                {lang === 'he' ? 'אינטראקציות' : 'Engagement'}
              </div>
            </div>
          </div>

          {/* Top Performing Guides */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              {lang === 'he' ? 'מדריכים מובילים' : 'Top Performing Guides'}
            </h4>
            <div className="space-y-2">
              {publishedGuides.slice(0, 3).map((guide, index) => (
                <div key={guide.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{guide.neighborhood}</div>
                      <div className="text-xs text-gray-600">{guide.city}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{guide.views.toLocaleString()} {lang === 'he' ? 'צפיות' : 'views'}</div>
                    <div className="text-xs text-gray-600">{guide.leadGenerated} {lang === 'he' ? 'לידים' : 'leads'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {lang === 'he' ? 'ניתוח ביצועים' : 'Performance Analysis'}
            </h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-300"
            >
              <option value="views">{lang === 'he' ? 'לפי צפיות' : 'By Views'}</option>
              <option value="leads">{lang === 'he' ? 'לפי לידים' : 'By Leads'}</option>
              <option value="engagement">{lang === 'he' ? 'לפי מעורבות' : 'By Engagement'}</option>
              <option value="updated">{lang === 'he' ? 'לפי עדכון' : 'By Updated'}</option>
            </select>
          </div>

          <div className="space-y-3">
            {sortedGuides.map((guide) => (
              <div
                key={guide.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onGuideClick?.(guide.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium text-gray-900">{guide.neighborhood}</h5>
                      <span className="text-sm text-gray-600">{guide.city}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(guide.status)}`}>
                        {lang === 'he' 
                          ? guide.status === 'published' ? 'פורסם'
                            : guide.status === 'updating' ? 'מתעדכן'
                            : 'טיוטה'
                          : guide.status
                        }
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      📅 {lang === 'he' ? 'עודכן:' : 'Updated:'} {formatDate(guide.lastUpdated)}
                    </div>

                    {guide.status === 'published' && (
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'צפיות:' : 'Views:'}</span>
                          <div className="font-medium">{guide.views.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'לידים:' : 'Leads:'}</span>
                          <div className="font-medium">{guide.leadGenerated}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'זמן ממוצע:' : 'Avg Time:'}</span>
                          <div className="font-medium">{formatTime(guide.avgTimeOnPage)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">{lang === 'he' ? 'Bounce Rate:' : 'Bounce Rate:'}</span>
                          <div className="font-medium">{guide.bounceRate}%</div>
                        </div>
                      </div>
                    )}

                    {guide.status === 'published' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">{lang === 'he' ? 'לייקים:' : 'Likes:'}</span>
                            <div className="font-medium">{guide.engagement.likes}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">{lang === 'he' ? 'שיתופים:' : 'Shares:'}</span>
                            <div className="font-medium">{guide.shares}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">{lang === 'he' ? 'תגובות:' : 'Comments:'}</span>
                            <div className="font-medium">{guide.engagement.comments}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">{lang === 'he' ? 'פניות נכס:' : 'Property Inquiries:'}</span>
                            <div className="font-medium">{guide.engagement.propertyInquiries}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            {lang === 'he' ? 'ניתוח תוכן' : 'Content Analysis'}
          </h4>
          
          <div className="space-y-3">
            {mockGuides.map((guide) => (
              <div key={guide.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{guide.neighborhood}, {guide.city}</h5>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(guide.status)}`}>
                    {lang === 'he' 
                      ? guide.status === 'published' ? 'פורסם'
                        : guide.status === 'updating' ? 'מתעדכן'
                        : 'טיוטה'
                      : guide.status
                    }
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'בתי ספר:' : 'Schools:'}</span>
                    <div className="font-medium">{guide.content.schools}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'מסעדות:' : 'Restaurants:'}</span>
                    <div className="font-medium">{guide.content.restaurants}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'פארקים:' : 'Parks:'}</span>
                    <div className="font-medium">{guide.content.parks}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'תחבורה:' : 'Transport:'}</span>
                    <div className="font-medium">{guide.content.transport}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'קניות:' : 'Shopping:'}</span>
                    <div className="font-medium">{guide.content.shopping}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{lang === 'he' ? 'בריאות:' : 'Healthcare:'}</span>
                    <div className="font-medium">{guide.content.healthcare}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500">{lang === 'he' ? 'מחיר ממוצע:' : 'Avg Price:'}</span>
                      <span className="font-medium ml-1">{formatCurrency(guide.marketData.avgPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{lang === 'he' ? 'שינוי מחיר:' : 'Price Change:'}</span>
                      <span className={`font-medium ml-1 ${guide.marketData.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {guide.marketData.priceChange >= 0 ? '+' : ''}{guide.marketData.priceChange}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">{lang === 'he' ? 'מלאי:' : 'Inventory:'}</span>
                      <span className="font-medium ml-1">{guide.marketData.inventory}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            {lang === 'he' ? '+ מדריך חדש' : '+ New Guide'}
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            {lang === 'he' ? 'עדכן מדריכים' : 'Update Guides'}
          </button>
        </div>
      </div>
    </div>
  );
}