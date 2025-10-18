'use client';

/**
 * Law Clients Page
 * Client management with CRUD operations
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { UniversalCard, KPICard } from '@/components/shared/UniversalCard';
import { UniversalButton } from '@/components/shared';
import { ClientModal } from '@/components/law/modals';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';
import { Search, Plus, User, Users as UsersIcon, Briefcase } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  clientType: 'individual' | 'corporate';
  _count?: { cases: number };
  createdAt: string;
}

export default function LawClientsPage() {
  const { language } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, [searchQuery, clientTypeFilter]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 1000 };
      if (searchQuery) params.q = searchQuery;
      if (clientTypeFilter !== 'all') params.clientType = clientTypeFilter;

      const response = await lawApi.clients.list(params);
      setClients(response.data || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת לקוחות' : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

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
        <UniversalButton
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedClient(null);
            setIsModalOpen(true);
          }}
        >
          {language === 'he' ? 'לקוח חדש' : 'New Client'}
        </UniversalButton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPICard
          icon={<UsersIcon className="w-6 h-6" />}
          label={language === 'he' ? 'סה"כ לקוחות' : 'Total Clients'}
          value={clients.length.toString()}
        />
        <KPICard
          icon={<Briefcase className="w-6 h-6" />}
          label={language === 'he' ? 'לקוחות תאגידיים' : 'Corporate Clients'}
          value={clients.filter(c => c.clientType === 'corporate').length.toString()}
        />
        <KPICard
          icon={<User className="w-6 h-6" />}
          label={language === 'he' ? 'לקוחות פרטיים' : 'Individual Clients'}
          value={clients.filter(c => c.clientType === 'individual').length.toString()}
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

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <UniversalCard key={i}>
              <div className="p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </UniversalCard>
          ))}
        </div>
      )}

      {/* Clients Grid */}
      {!loading && clients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
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
                  {client.phone && (
                    <p className="text-gray-600 dark:text-gray-400" dir="ltr">{client.phone}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'he' ? 'תיקים פעילים' : 'Active Cases'}
                  </span>
                  <span className="font-semibold text-[#2979FF]">{client._count?.cases || 0}</span>
                </div>

                <UniversalButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setSelectedClient(client);
                    setIsModalOpen(true);
                  }}
                >
                  {language === 'he' ? 'ערוך פרטים' : 'Edit Details'}
                </UniversalButton>
              </div>
            </UniversalCard>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && clients.length === 0 && (
        <UniversalCard>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'he' ? 'לא נמצאו לקוחות' : 'No clients found'}
            </p>
          </div>
        </UniversalCard>
      )}

      {/* Client Modal */}
      {isModalOpen && (
        <ClientModal
          client={selectedClient}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedClient(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedClient(null);
            fetchClients();
            toast.success(
              selectedClient
                ? language === 'he' ? 'הלקוח עודכן בהצלחה' : 'Client updated'
                : language === 'he' ? 'הלקוח נוצר בהצלחה' : 'Client created'
            );
          }}
        />
      )}
    </div>
  );
}
