'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import {
  Users,
  Plus,
  Edit,
  Trash,
  Search,
  UserCheck,
  UserX,
  Briefcase,
  Target,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface EmployeeStats {
  leads: number;
  clients: number;
  tasks: number;
  meetings: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'MANAGER' | 'AGENT' | 'ASSISTANT';
  status: 'ACTIVE' | 'INACTIVE';
  userId: string | null;
  createdAt: string;
  _count?: {
    assignedTasks: number;
    createdTasks: number;
  };
}

export default function EmployeesPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'AGENT' as 'MANAGER' | 'AGENT' | 'ASSISTANT',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const t = language === 'he' ? {
    title: 'ניהול עובדים',
    addEmployee: 'הוסף עובד',
    search: 'חיפוש עובדים...',
    name: 'שם',
    email: 'אימייל',
    phone: 'טלפון',
    role: 'תפקיד',
    status: 'סטטוס',
    actions: 'פעולות',
    active: 'פעיל',
    inactive: 'לא פעיל',
    manager: 'מנהל',
    agent: 'סוכן',
    assistant: 'עוזר',
    stats: 'סטטיסטיקות',
    leads: 'לידים',
    clients: 'לקוחות',
    tasks: 'משימות',
    meetings: 'פגישות',
    save: 'שמור',
    cancel: 'ביטול',
    edit: 'ערוך',
    delete: 'מחק',
    deactivate: 'השבת',
    activate: 'הפעל',
    confirmDelete: 'האם אתה בטוח שברצונך למחוק עובד זה?',
    employeeAdded: 'עובד נוסף בהצלחה',
    employeeUpdated: 'עובד עודכן בהצלחה',
    employeeDeleted: 'עובד נמחק בהצלחה',
    error: 'שגיאה'
  } : {
    title: 'Employees Management',
    addEmployee: 'Add Employee',
    search: 'Search employees...',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    inactive: 'Inactive',
    manager: 'Manager',
    agent: 'Agent',
    assistant: 'Assistant',
    stats: 'Statistics',
    leads: 'Leads',
    clients: 'Clients',
    tasks: 'Tasks',
    meetings: 'Meetings',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    deactivate: 'Deactivate',
    activate: 'Activate',
    confirmDelete: 'Are you sure you want to delete this employee?',
    employeeAdded: 'Employee added successfully',
    employeeUpdated: 'Employee updated successfully',
    employeeDeleted: 'Employee deleted successfully',
    error: 'Error'
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/real-estate/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await user?.getIdToken();
      const url = showEditModal && selectedEmployee
        ? '/api/real-estate/agents'
        : '/api/real-estate/agents';

      const method = showEditModal ? 'PATCH' : 'POST';
      const body = showEditModal && selectedEmployee
        ? { id: selectedEmployee.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchEmployees();
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save employee:', error);
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/real-estate/agents?id=${employeeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchEmployees();
      }
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/real-estate/agents', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: employee.id,
          status: employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        })
      });

      if (response.ok) {
        fetchEmployees();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role,
      status: employee.status
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'AGENT',
      status: 'ACTIVE'
    });
    setSelectedEmployee(null);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'MANAGER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'AGENT': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ASSISTANT': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{employees.length} {language === 'he' ? 'עובדים במערכת' : 'employees in system'}</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-[#2979FF] text-white rounded-lg hover:bg-[#1E5FCC] transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.addEmployee}
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1a2942] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#2979FF] focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white dark:bg-[#1a2942] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2979FF] to-[#1E5FCC] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(employee.role)}`}>
                      {t[employee.role.toLowerCase() as keyof typeof t]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  {employee.status === 'ACTIVE' ? (
                    <UserCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <UserX className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</p>
                {employee.phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{employee.phone}</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 dark:bg-[#0E1A2B] rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.tasks}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {employee._count?.assignedTasks || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.meetings}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">0</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(employee)}
                  className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                >
                  <Edit className="w-4 h-4 inline mr-1" />
                  {t.edit}
                </button>
                <button
                  onClick={() => handleToggleStatus(employee)}
                  className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    employee.status === 'ACTIVE'
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                  }`}
                >
                  {employee.status === 'ACTIVE' ? t.deactivate : t.activate}
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{language === 'he' ? 'לא נמצאו עובדים' : 'No employees found'}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a2942] rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {showEditModal ? t.edit : t.addEmployee}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.name}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#0E1A2B] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#2979FF] text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.email}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#0E1A2B] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#2979FF] text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.phone}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#0E1A2B] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#2979FF] text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.role}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#0E1A2B] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#2979FF] text-gray-900 dark:text-white"
                >
                  <option value="AGENT">{t.agent}</option>
                  <option value="MANAGER">{t.manager}</option>
                  <option value="ASSISTANT">{t.assistant}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.status}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white dark:bg-[#0E1A2B] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#2979FF] text-gray-900 dark:text-white"
                >
                  <option value="ACTIVE">{t.active}</option>
                  <option value="INACTIVE">{t.inactive}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#2979FF] text-white rounded-lg hover:bg-[#1E5FCC] transition-colors"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
