'use client';

/**
 * Law Clients Page
 * Client management with CRUD operations
 */

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard, KPICard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { Search, Plus, User, Users as UsersIcon, Briefcase } from 'lucide-react';

const mockClients = [
  {
    id: '1',
    name: 'Tech Corporation Ltd.',
    email: 'contact@techcorp.com',
    phone: '+972-50-123-4567',
    clientType: 'corporate',
    activeCases: 3,
    tags: ['vip', 'technology'],
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    phone: '+972-50-234-5678',
    clientType: 'individual',
    activeCases: 1,
    tags: ['employment'],
  },
];

export default function LawClientsPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = mockClients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'he' ? 'לקוחות' : 'Clients'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {language === 'he' ? 'נהל את בסיס הלקוחות שלך' : 'Manage your client base'}
          </p>
        </div>
        <UniversalButton variant="primary" icon={<Plus className="w-4 h-4" />}>
          {language === 'he' ? 'לקוח חדש' : 'New Client'}
        </UniversalButton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPICard
          icon={<UsersIcon className="w-6 h-6" />}
          label={language === 'he' ? 'סה"כ לקוחות' : 'Total Clients'}
          value="47"
          change={{ value: '+8% מחודש שעבר', trend: 'up' }}
        />
        <KPICard
          icon={<Briefcase className="w-6 h-6" />}
          label={language === 'he' ? 'לקוחות תאגידיים' : 'Corporate Clients'}
          value="23"
        />
        <KPICard
          icon={<User className="w-6 h-6" />}
          label={language === 'he' ? 'לקוחות פרטיים' : 'Individual Clients'}
          value="24"
        />
      </div>

      {/* Search */}
      <UniversalCard>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'he' ? 'חפש לקוחות...' : 'Search clients...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
            />
          </div>
        </div>
      </UniversalCard>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <UniversalCard key={client.id} hoverable>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2979FF]/10 flex items-center justify-center">
                    {client.clientType === 'corporate' ? (
                      <Briefcase className="w-6 h-6 text-[#2979FF]" />
                    ) : (
                      <User className="w-6 h-6 text-[#2979FF]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {client.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {client.clientType === 'corporate' ? 'Corporate' : 'Individual'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">{client.email}</p>
                <p className="text-gray-600 dark:text-gray-400" dir="ltr">{client.phone}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'he' ? 'תיקים פעילים' : 'Active Cases'}
                </span>
                <span className="font-semibold text-[#2979FF]">{client.activeCases}</span>
              </div>

              <UniversalButton variant="secondary" className="w-full">
                {language === 'he' ? 'צפה בפרטים' : 'View Details'}
              </UniversalButton>
            </div>
          </UniversalCard>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <UniversalCard>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'he' ? 'לא נמצאו לקוחות' : 'No clients found'}
            </p>
          </div>
        </UniversalCard>
      )}
    </div>
  );
}
