'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

type ViewMode = 'grid' | 'list';
type ClientType = 'corporate' | 'agency' | 'individual' | 'nonprofit';

interface Client {
  id: string;
  name: string;
  type: ClientType;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  rating: number;
  since: string;
  status: 'active' | 'inactive' | 'prospect';
  tags: string[];
  lastContact: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'TechCorp Inc.',
    type: 'corporate',
    contactPerson: 'Jennifer Martinez',
    email: 'jennifer@techcorp.com',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
    totalProjects: 12,
    activeProjects: 3,
    totalRevenue: 450000,
    rating: 5,
    since: '2022-01-15',
    status: 'active',
    tags: ['Technology', 'Enterprise', 'Long-term'],
    lastContact: '2024-11-10'
  },
  {
    id: '2',
    name: 'Innovation Labs',
    type: 'corporate',
    contactPerson: 'Michael Chen',
    email: 'michael@innovationlabs.io',
    phone: '+1 (555) 234-5678',
    address: 'Austin, TX',
    totalProjects: 8,
    activeProjects: 2,
    totalRevenue: 320000,
    rating: 5,
    since: '2022-06-20',
    status: 'active',
    tags: ['Startup', 'Innovation', 'R&D'],
    lastContact: '2024-11-12'
  },
  {
    id: '3',
    name: 'Creative Studios Agency',
    type: 'agency',
    contactPerson: 'Sarah Williams',
    email: 'sarah@creativestudios.com',
    phone: '+1 (555) 345-6789',
    address: 'New York, NY',
    totalProjects: 15,
    activeProjects: 4,
    totalRevenue: 580000,
    rating: 4,
    since: '2021-09-10',
    status: 'active',
    tags: ['Marketing', 'Creative', 'Agency'],
    lastContact: '2024-11-08'
  },
  {
    id: '4',
    name: 'Nature Films Ltd',
    type: 'corporate',
    contactPerson: 'David Thompson',
    email: 'david@naturefilms.com',
    phone: '+1 (555) 456-7890',
    address: 'Seattle, WA',
    totalProjects: 6,
    activeProjects: 1,
    totalRevenue: 180000,
    rating: 5,
    since: '2023-03-12',
    status: 'active',
    tags: ['Documentary', 'Environmental', 'Film'],
    lastContact: '2024-11-05'
  },
  {
    id: '5',
    name: 'GreenTech Solutions',
    type: 'corporate',
    contactPerson: 'Lisa Anderson',
    email: 'lisa@greentech.com',
    phone: '+1 (555) 567-8901',
    address: 'Portland, OR',
    totalProjects: 4,
    activeProjects: 0,
    totalRevenue: 125000,
    rating: 4,
    since: '2023-07-18',
    status: 'inactive',
    tags: ['Sustainability', 'Technology'],
    lastContact: '2024-09-20'
  },
  {
    id: '6',
    name: 'BrightFuture Foundation',
    type: 'nonprofit',
    contactPerson: 'James Rodriguez',
    email: 'james@brightfuture.org',
    phone: '+1 (555) 678-9012',
    address: 'Boston, MA',
    totalProjects: 3,
    activeProjects: 0,
    totalRevenue: 45000,
    rating: 5,
    since: '2023-11-05',
    status: 'prospect',
    tags: ['Nonprofit', 'Education', 'Social Impact'],
    lastContact: '2024-10-15'
  }
];

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'prospect'>('all');

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-50 text-green-700 border-green-200',
      inactive: 'bg-gray-50 text-gray-700 border-gray-200',
      prospect: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[status as keyof typeof colors];
  };

  const getClientTypeLabel = (type: ClientType) => {
    const labels = {
      corporate: 'Corporate',
      agency: 'Agency',
      individual: 'Individual',
      nonprofit: 'Nonprofit'
    };
    return labels[type];
  };

  const totalStats = {
    total: mockClients.length,
    active: mockClients.filter(c => c.status === 'active').length,
    totalRevenue: mockClients.reduce((sum, c) => sum + c.totalRevenue, 0),
    avgRating: (mockClients.reduce((sum, c) => sum + c.rating, 0) / mockClients.length).toFixed(1)
  };

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

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
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
            {filteredClients.map((client, index) => (
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
                    <p className="text-sm text-gray-600">{getClientTypeLabel(client.type)}</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Status & Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < client.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} className="flex-shrink-0" />
                    <span className="truncate">{client.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} className="flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span>{client.address}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Projects</p>
                    <p className="text-lg font-semibold text-gray-900">{client.totalProjects}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Revenue</p>
                    <p className="text-lg font-semibold text-gray-900">${(client.totalRevenue / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {client.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {client.tags.length > 2 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      +{client.tags.length - 2}
                    </span>
                  )}
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Projects</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Last Contact</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{getClientTypeLabel(client.type)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{client.contactPerson}</div>
                        <div className="text-xs text-gray-500 mt-1">{client.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{client.totalProjects} total</div>
                        <div className="text-xs text-gray-500 mt-1">{client.activeProjects} active</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${client.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < client.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(client.lastContact).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
