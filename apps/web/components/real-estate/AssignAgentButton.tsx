'use client';

import { useState, useEffect } from 'react';
import { User, X, Check, UserPlus } from 'lucide-react';

interface Agent {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
}

interface AssignAgentButtonProps {
  propertyId: string;
  currentAgentId?: string | null;
  currentAgentName?: string | null;
  onAssignSuccess?: (agentId: string | null, agentName: string | null) => void;
  accountType?: 'COMPANY' | 'FREELANCER';
  className?: string;
}

export function AssignAgentButton({
  propertyId,
  currentAgentId,
  currentAgentName,
  onAssignSuccess,
  accountType = 'FREELANCER',
  className = '',
}: AssignAgentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(currentAgentId || null);

  // Only show for Company accounts
  if (accountType !== 'COMPANY') {
    return null;
  }

  // Fetch available agents when dialog opens
  useEffect(() => {
    if (isOpen && agents.length === 0) {
      fetchAgents();
    }
  }, [isOpen]);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/organizations/me/memberships', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      setAgents(data.members || []);
    } catch (err) {
      console.error('[AssignAgentButton] Error fetching agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (agentId: string | null) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/real-estate/properties/${propertyId}/assign-agent`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign agent');
      }

      const data = await response.json();
      setSelectedAgentId(agentId);

      // Find agent name
      const agent = agents.find((a) => a.id === agentId);
      const agentName = agent ? agent.displayName || agent.email : null;

      onAssignSuccess?.(agentId, agentName);
      setIsOpen(false);
    } catch (err) {
      console.error('[AssignAgentButton] Error assigning agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign agent');
    } finally {
      setIsLoading(false);
    }
  };

  const displayAgentName = currentAgentName || agents.find((a) => a.id === selectedAgentId)?.displayName || 'Unassigned';

  return (
    <>
      {/* Assign Agent Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${className}`}
        style={{
          background: selectedAgentId ? '#2979FF' : 'transparent',
          color: selectedAgentId ? '#FFFFFF' : '#9EA7B3',
          border: '1px solid',
          borderColor: selectedAgentId ? '#2979FF' : '#374151',
        }}
      >
        {selectedAgentId ? (
          <>
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{displayAgentName}</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span className="text-sm font-medium">Assign Agent</span>
          </>
        )}
      </button>

      {/* Agent Selection Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="rounded-xl shadow-2xl max-w-md w-full"
            style={{ background: '#1A2F4B', border: '1px solid #374151' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: '#374151' }}
            >
              <h2 className="text-xl font-bold text-white">Assign Agent</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {error && (
                <div
                  className="mb-4 p-4 rounded-lg border"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#EF4444',
                  }}
                >
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {isLoading && agents.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Unassign Option */}
                  <button
                    onClick={() => handleAssign(null)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:bg-white/5"
                    style={{
                      background: !selectedAgentId ? 'rgba(41, 121, 255, 0.1)' : 'transparent',
                      border: '1px solid',
                      borderColor: !selectedAgentId ? '#2979FF' : '#374151',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: '#374151' }}
                      >
                        <User className="w-5 h-5" style={{ color: '#9EA7B3' }} />
                      </div>
                      <span className="text-white font-medium">Unassigned</span>
                    </div>
                    {!selectedAgentId && (
                      <Check className="w-5 h-5" style={{ color: '#2979FF' }} />
                    )}
                  </button>

                  {/* Agent Options */}
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAssign(agent.id)}
                      disabled={isLoading}
                      className="w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:bg-white/5"
                      style={{
                        background: selectedAgentId === agent.id ? 'rgba(41, 121, 255, 0.1)' : 'transparent',
                        border: '1px solid',
                        borderColor: selectedAgentId === agent.id ? '#2979FF' : '#374151',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: '#2979FF' }}
                        >
                          <span className="text-white font-semibold text-sm">
                            {agent.displayName?.[0]?.toUpperCase() || agent.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="text-white font-medium">
                            {agent.displayName || agent.email}
                          </div>
                          {agent.displayName && (
                            <div className="text-xs" style={{ color: '#9EA7B3' }}>
                              {agent.email}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedAgentId === agent.id && (
                        <Check className="w-5 h-5" style={{ color: '#2979FF' }} />
                      )}
                    </button>
                  ))}

                  {agents.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <p style={{ color: '#9EA7B3' }}>No team members found</p>
                      <p className="text-sm mt-2" style={{ color: '#6B7280' }}>
                        Invite team members in Organization Settings
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
