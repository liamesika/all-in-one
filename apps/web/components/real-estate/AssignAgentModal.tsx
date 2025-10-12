'use client';

import { useState, useEffect } from 'react';
import { X, Search, User, Check } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface Agent {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AssignAgentModalProps {
  propertyId: string;
  currentAgentId?: string | null;
  onClose: () => void;
  onAssign: (agentId: string | null) => Promise<void>;
}

export function AssignAgentModal({
  propertyId,
  currentAgentId,
  onClose,
  onAssign,
}: AssignAgentModalProps) {
  const { language } = useLanguage();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(currentAgentId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredAgents(
        agents.filter(
          (agent) =>
            agent.name.toLowerCase().includes(query) ||
            agent.email.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredAgents(agents);
    }
  }, [searchQuery, agents]);

  const fetchAgents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock data - replace with actual API call
      // const response = await fetch('/api/organizations/me/members');
      // const data = await response.json();

      const mockAgents: Agent[] = [
        { id: '1', name: 'David Cohen', email: 'david@example.com', role: 'Senior Agent' },
        { id: '2', name: 'Sarah Levi', email: 'sarah@example.com', role: 'Agent' },
        { id: '3', name: 'Michael Katz', email: 'michael@example.com', role: 'Junior Agent' },
        { id: '4', name: 'Rachel Ben-David', email: 'rachel@example.com', role: 'Agent' },
      ];

      setAgents(mockAgents);
      setFilteredAgents(mockAgents);
    } catch (err: any) {
      setError(err.message || (language === 'he' ? 'שגיאה בטעינת סוכנים' : 'Failed to load agents'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onAssign(selectedAgentId);
      onClose();
    } catch (err: any) {
      setError(err.message || (language === 'he' ? 'שגיאה בהקצאה' : 'Failed to assign agent'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnassign = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onAssign(null);
      onClose();
    } catch (err: any) {
      setError(err.message || (language === 'he' ? 'שגיאה בביטול הקצאה' : 'Failed to unassign agent'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden ${
          language === 'he' ? 'rtl' : 'ltr'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'הקצה סוכן' : 'Assign Agent'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'he' ? 'חפש סוכן...' : 'Search agents...'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Agents List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'he' ? 'טוען...' : 'Loading...'}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'he' ? 'לא נמצאו סוכנים' : 'No agents found'}
              </div>
            ) : (
              filteredAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    selectedAgentId === agent.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-600">{agent.email}</div>
                    {agent.role && (
                      <div className="text-xs text-gray-500 mt-0.5">{agent.role}</div>
                    )}
                  </div>
                  {selectedAgentId === agent.id && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Current Assignment */}
          {currentAgentId && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {language === 'he'
                  ? 'הנכס כבר מוקצה לסוכן. שמירה תחליף את ההקצאה הנוכחית.'
                  : 'This property is already assigned. Saving will replace the current assignment.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div>
            {currentAgentId && (
              <button
                onClick={handleUnassign}
                disabled={isSaving || isLoading}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {language === 'he' ? 'בטל הקצאה' : 'Unassign'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading || !selectedAgentId || selectedAgentId === currentAgentId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? language === 'he'
                  ? 'שומר...'
                  : 'Saving...'
                : language === 'he'
                ? 'שמור'
                : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
