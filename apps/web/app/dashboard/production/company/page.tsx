'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  Phone,
  Mail,
  MapPin,
  Building2,
  TrendingUp,
  Users,
  FolderKanban,
  DollarSign,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Star,
  Calendar
} from 'lucide-react';
import { ProductionsHeader } from '@/components/productions/ProductionsHeader';
import { useClients, useDeleteClient } from '@/hooks/useProductionsData';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list';

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch clients with React Query
  const { data: allClients = [], isLoading } = useClients();
  const deleteClient = useDeleteClient();

  // Filter clients
  const filteredClients = allClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (client.contactName && client.contactName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || client.type === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate project counts for each client
  const clientsWithProjects = filteredClients.map(client => ({
    ...client,
    projectCount: client.projects?.length || 0,
  }));

  const totalStats = {
    total: allClients.length,
    active: allClients.filter(c => c.type === 'CORPORATE' || c.type === 'AGENCY').length,
    totalRevenue: 0, // Backend doesn't track client revenue yet
    avgRating: '5.0' // Backend doesn't have ratings yet
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await deleteClient.mutateAsync(clientId);
      toast.success('Client deleted');
    } catch (err: any) {
      toast.error('Failed to delete client');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#F9FAFB]">
        <ProductionsHeader userName="Production Manager" />
        <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F9FAFB]">
      <ProductionsHeader userName="Production Manager" />

      <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Clients</h1>
              <p className="text-gray-600 mt-1">
                Manage client relationships and project history
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm hover:shadow-md">
              <Plus size={20} />
              New Client
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Clients', value: totalStats.total, icon: Users, color: 'blue' },
              { label: 'Active', value: totalStats.active, icon: TrendingUp, color: 'green' },
              { label: 'Total Revenue', value: '$' + (totalStats.totalRevenue / 1000).toFixed(0) + 'K', icon: DollarSign, color: 'purple' },
              { label: 'Avg Rating', value: totalStats.avgRating, icon: Star, color: 'yellow' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                    <stat.icon className={`text-${stat.color}-600`} size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters & View Modes */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex flex-1 items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search clients or contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="CORPORATE">Corporate</option>
                <option value="AGENCY">Agency</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="NONPROFIT">Nonprofit</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Grid View"
              >
                <Grid3x3 size={18} className={viewMode === 'grid' ? 'text-orange-600' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="List View"
              >
                <List size={18} className={viewMode === 'list' ? 'text-orange-600' : 'text-gray-600'} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {clientsWithProjects.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                      {client.name}
                    </h3>
                    <p className="text-sm text-gray-600">{client.type}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  {client.contactName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} className="flex-shrink-0" />
                      <span className="truncate">{client.contactName}</span>
                    </div>
                  )}
                  {client.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} className="flex-shrink-0" />
                      <span className="truncate">{client.contactEmail}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} className="flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="flex-shrink-0" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Projects</p>
                    <p className="text-lg font-semibold text-gray-900">{client.projectCount}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Since</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(client.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
                    <Eye size={16} />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    <Edit2 size={16} />
                    Edit
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Projects</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clientsWithProjects.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        {client.website && (
                          <div className="text-xs text-gray-500 mt-1">{client.website}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {client.contactName && (
                          <div className="text-sm text-gray-900">{client.contactName}</div>
                        )}
                        {client.contactEmail && (
                          <div className="text-xs text-gray-500 mt-1">{client.contactEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full font-medium border bg-gray-50 text-gray-700 border-gray-200">
                          {client.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{client.projectCount} projects</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center"
          >
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first client'}
            </p>
            {!searchQuery && (
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all">
                Add New Client
              </button>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
