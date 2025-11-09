'use client';

import { useLang } from '@/components/i18n/LangProvider';
import { useLanguage } from '@/lib/language-context';

interface SidebarProps {
  currentPath?: string;
}

export function Sidebar({ currentPath = 'dashboard' }: SidebarProps) {
  const { lang } = useLang();
  const { language } = useLanguage();

  const navigationItems = [
    {
      href: '/dashboard/real-estate/dashboard',
      label: lang === 'he' ? 'דשבורד' : 'Dashboard',
      key: 'dashboard',
      icon: '📊'
    },
    {
      href: '/dashboard/real-estate/properties',
      label: lang === 'he' ? 'נכסים' : 'Properties',
      key: 'properties',
      icon: '🏠'
    },
    {
      href: '/dashboard/real-estate/leads',
      label: lang === 'he' ? 'לידים' : 'Leads',
      key: 'leads',
      icon: '🎯'
    },
    {
      href: '/dashboard/real-estate/clients',
      label: lang === 'he' ? 'לקוחות' : 'Clients',
      key: 'clients',
      icon: '👥'
    },
    {
      href: '/dashboard/real-estate/meetings',
      label: lang === 'he' ? 'פגישות' : 'Meetings',
      key: 'meetings',
      icon: '📅'
    },
    {
      href: '/dashboard/real-estate/campaigns',
      label: lang === 'he' ? 'קמפיינים' : 'Campaigns',
      key: 'campaigns',
      icon: '📢'
    },
    {
      href: '/dashboard/real-estate/reports',
      label: lang === 'he' ? 'דוחות' : 'Reports',
      key: 'reports',
      icon: '📈'
    },
    {
      href: '/dashboard/real-estate/ai-searcher',
      label: lang === 'he' ? 'חיפוש AI' : 'AI Search',
      key: 'ai-searcher',
      icon: '🔍'
    },
    {
      href: '/dashboard/real-estate/neighborhoods',
      label: lang === 'he' ? 'מפת שכונות' : 'Neighborhoods',
      key: 'neighborhoods',
      icon: '🗺️'
    },
    {
      href: '/dashboard/real-estate/agents',
      label: lang === 'he' ? 'סוכנים ומשימות' : 'Agents & Tasks',
      key: 'agents',
      icon: '✅'
    },
    {
      href: '/dashboard/real-estate/automations',
      label: lang === 'he' ? 'אוטומציות' : 'Automations',
      key: 'automations',
      icon: '⚡'
    },
    {
      href: '/dashboard/real-estate/integrations',
      label: lang === 'he' ? 'אינטגרציות' : 'Integrations',
      key: 'integrations',
      icon: '🔌'
    }
  ];

  return (
    <aside className="hidden md:block col-span-2">
      <div className="sticky top-6 rounded-2xl bg-white shadow-xl border p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">E</div>
          <div className="font-semibold">EFFINITY</div>
        </div>
        
        <nav className="space-y-1 text-sm">
          {navigationItems.map((item) => (
            <a 
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                currentPath === item.key
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs">
          <div className="font-medium mb-1">
            {lang === 'he' ? 'טיפ מקצועי' : 'Pro Tip'}
          </div>
          <p className="text-blue-700">
            {lang === 'he' 
              ? 'השתמש בפילטרים העליונים לצמצום הנתונים לתקופות או תחומי עיסוק ספציפיים'
              : 'Use the top filters to narrow down data to specific time periods or practice areas'
            }
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">
            {lang === 'he' ? 'גישה מהירה' : 'Quick Actions'}
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              {lang === 'he' ? '+ תיק חדש' : '+ New Matter'}
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              {lang === 'he' ? '+ לקוח חדש' : '+ New Client'}  
            </button>
            <button className="w-full text-left px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              {lang === 'he' ? 'יצירת דוח' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}