'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { AutomationCard } from '@/components/real-estate/automations/AutomationCard';
import { AutomationBuilderModal } from '@/components/real-estate/automations/AutomationBuilderModal';
import { AutomationTemplates, Template } from '@/components/real-estate/automations/AutomationTemplates';
import { useAuth } from '@/lib/auth-context';

export interface AutomationsClientProps {
  initialAutomations: any[];
}

export function AutomationsClient({ initialAutomations }: AutomationsClientProps) {
  const { lang } = useLang();
  const { user } = useAuth();
  const isRtl = lang === 'he';

  const [automations, setAutomations] = useState(initialAutomations);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchAutomations = async () => {
    try {
      setIsLoading(true);
      const token = await user?.getIdToken();
      const response = await fetch('/api/real-estate/automations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAutomations(data);
      }
    } catch (error) {
      console.error('Error fetching automations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/real-estate/automations/${id}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchAutomations();
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const handleEdit = (id: string) => {
    const automation = automations.find((a) => a.id === id);
    if (automation) {
      setEditingAutomation(automation);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/real-estate/automations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchAutomations();
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    const automation = automations.find((a) => a.id === id);
    if (automation) {
      const duplicate = {
        ...automation,
        name: `${automation.name} (Copy)`,
        status: 'PAUSED',
      };
      delete duplicate.id;
      await handleSave(duplicate);
    }
  };

  const handleSave = async (automation: any) => {
    try {
      const token = await user?.getIdToken();
      const url = editingAutomation
        ? `/api/real-estate/automations/${editingAutomation.id}`
        : '/api/real-estate/automations';
      const method = editingAutomation ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(automation),
      });

      if (response.ok) {
        await fetchAutomations();
        setIsModalOpen(false);
        setEditingAutomation(null);
      }
    } catch (error) {
      console.error('Error saving automation:', error);
    }
  };

  const handleUseTemplate = (template: Template) => {
    setEditingAutomation({
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      actions: template.actions,
    });
    setShowTemplates(false);
    setIsModalOpen(true);
  };

  // Calculate stats
  const stats = {
    active: automations.filter((a) => a.status === 'ACTIVE').length,
    paused: automations.filter((a) => a.status === 'PAUSED').length,
    totalRuns: automations.reduce((sum, a) => sum + (a.stats?.totalRuns || 0), 0),
  };

  // Filter automations
  const filteredAutomations = automations.filter((automation) => {
    if (statusFilter !== 'all' && automation.status.toLowerCase() !== statusFilter) {
      return false;
    }
    if (categoryFilter !== 'all') {
      const triggerType = automation.trigger?.type?.toLowerCase() || '';
      if (categoryFilter === 'leads' && !triggerType.includes('lead')) return false;
      if (categoryFilter === 'properties' && !triggerType.includes('property')) return false;
      if (categoryFilter === 'campaigns' && !triggerType.includes('campaign')) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0E1A2B] p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {lang === 'he' ? 'אוטומציות' : 'Automations'}
            </h1>
            <p className="text-gray-400">
              {lang === 'he'
                ? 'צור תהליכי עבודה אוטומטיים לחיסכון בזמן'
                : 'Create automated workflows to save time'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
            >
              {lang === 'he' ? 'תבניות' : 'Templates'}
            </button>
            <button
              onClick={() => {
                setEditingAutomation(null);
                setIsModalOpen(true);
              }}
              className="px-6 py-3 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {lang === 'he' ? 'צור אוטומציה' : 'Create Automation'}
            </button>
          </div>
        </div>

        {/* Templates Section */}
        {showTemplates && (
          <div className="mb-8">
            <AutomationTemplates onUseTemplate={handleUseTemplate} />
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1A2F4B] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">
                  {lang === 'he' ? 'פעיל' : 'Active'}
                </div>
                <div className="text-3xl font-bold text-green-400">{stats.active}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#1A2F4B] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">
                  {lang === 'he' ? 'מושהה' : 'Paused'}
                </div>
                <div className="text-3xl font-bold text-yellow-400">{stats.paused}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#1A2F4B] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">
                  {lang === 'he' ? 'סה"כ ריצות' : 'Total Runs'}
                </div>
                <div className="text-3xl font-bold text-blue-400">{stats.totalRuns.toLocaleString()}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              {lang === 'he' ? 'סטטוס' : 'Status'}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#1A2F4B] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">{lang === 'he' ? 'הכל' : 'All'}</option>
              <option value="active">{lang === 'he' ? 'פעיל' : 'Active'}</option>
              <option value="paused">{lang === 'he' ? 'מושהה' : 'Paused'}</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              {lang === 'he' ? 'קטגוריה' : 'Category'}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-[#1A2F4B] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">{lang === 'he' ? 'הכל' : 'All'}</option>
              <option value="leads">{lang === 'he' ? 'לידים' : 'Leads'}</option>
              <option value="properties">{lang === 'he' ? 'נכסים' : 'Properties'}</option>
              <option value="campaigns">{lang === 'he' ? 'קמפיינים' : 'Campaigns'}</option>
            </select>
          </div>
        </div>

        {/* Automations List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            {lang === 'he' ? 'טוען...' : 'Loading...'}
          </div>
        ) : filteredAutomations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {lang === 'he' ? 'אין אוטומציות עדיין' : 'No automations yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {lang === 'he'
                ? 'צור את האוטומציה הראשונה שלך או השתמש בתבנית'
                : 'Create your first automation or use a template'}
            </p>
            <button
              onClick={() => setShowTemplates(true)}
              className="px-6 py-3 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-medium transition-colors"
            >
              {lang === 'he' ? 'צפה בתבניות' : 'View Templates'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAutomations.map((automation) => (
              <AutomationCard
                key={automation.id}
                {...automation}
                onToggleStatus={handleToggleStatus}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Builder Modal */}
      <AutomationBuilderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAutomation(null);
        }}
        onSave={handleSave}
        initialData={editingAutomation}
      />
    </div>
  );
}
