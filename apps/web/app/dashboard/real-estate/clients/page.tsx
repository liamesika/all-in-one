'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Users, Phone, Mail, Building2, Calendar, Archive, Edit, Trash, UserPlus } from 'lucide-react';
import { auth } from '@/lib/firebase';
import CreateClientModal from './components/CreateClientModal';
import ClientDetailPanel from './components/ClientDetailPanel';
import EditClientModal from './components/EditClientModal';

interface Client {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: string;
  assignedAgentId: string | null;
  createdAt: string;
  assignedAgent?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  properties: Array<{
    property: {
      id: string;
      name: string;
      address: string | null;
      status: string;
    };
  }>;
  meetingParticipations: Array<{
    meetingId: string;
  }>;
  convertedFromLead?: {
    id: string;
    source: string | null;
  } | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const fetchClients = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/real-estate/clients?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter]);

  const handleCreateClient = async (clientData: any) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/real-estate/clients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchClients();
      }
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const handleUpdateClient = async (id: string, updates: any) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/real-estate/clients', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...updates })
      });

      if (response.ok) {
        setShowEditModal(false);
        setShowDetailPanel(false);
        fetchClients();
      }
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`/api/real-estate/clients?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setShowDetailPanel(false);
        fetchClients();
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setShowDetailPanel(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-[#1A2F4B] rounded" />
            <div className="h-96 bg-[#1A2F4B] rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1A2B]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
            <p className="text-gray-400">Manage your client relationships</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#2979FF] text-white rounded-lg flex items-center gap-2 hover:bg-[#1E5FCC] transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            New Client
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#1A2F4B] rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0E1A2B] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#0E1A2B] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#2979FF]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1A2F4B] rounded-xl p-4 border border-[#2979FF]/20">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-[#2979FF]" />
              <div>
                <div className="text-2xl font-bold text-white">{clients.length}</div>
                <div className="text-sm text-gray-400">Total Clients</div>
              </div>
            </div>
          </div>
          <div className="bg-[#1A2F4B] rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {clients.filter(c => c.status === 'ACTIVE').length}
                </div>
                <div className="text-sm text-gray-400">Active</div>
              </div>
            </div>
          </div>
          <div className="bg-[#1A2F4B] rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {clients.reduce((acc, c) => acc + c.properties.length, 0)}
                </div>
                <div className="text-sm text-gray-400">Properties</div>
              </div>
            </div>
          </div>
          <div className="bg-[#1A2F4B] rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {clients.reduce((acc, c) => acc + c.meetingParticipations.length, 0)}
                </div>
                <div className="text-sm text-gray-400">Meetings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-[#1A2F4B] rounded-xl overflow-hidden">
          {clients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No clients found</h3>
              <p className="text-gray-400 mb-4">Get started by creating your first client</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#2979FF] text-white rounded-lg hover:bg-[#1E5FCC] transition-colors"
              >
                Create Client
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0E1A2B]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Assigned Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Properties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#0E1A2B] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#2979FF] flex items-center justify-center text-white font-semibold">
                            {client.fullName[0]?.toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">{client.fullName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {client.phone}
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1 mt-1">
                              <Mail className="w-4 h-4" />
                              {client.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          client.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                          client.status === 'INACTIVE' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {client.assignedAgent?.fullName || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {client.properties.length} properties
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">
                          {client.convertedFromLead?.source || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(client)}
                            className="text-[#2979FF] hover:text-[#1E5FCC]"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateClientModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClient}
        />
      )}

      {showEditModal && selectedClient && (
        <EditClientModal
          client={selectedClient}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updates) => handleUpdateClient(selectedClient.id, updates)}
        />
      )}

      {showDetailPanel && selectedClient && (
        <ClientDetailPanel
          client={selectedClient}
          onClose={() => setShowDetailPanel(false)}
          onUpdate={(updates) => handleUpdateClient(selectedClient.id, updates)}
          onDelete={() => handleDeleteClient(selectedClient.id)}
        />
      )}
    </div>
  );
}
