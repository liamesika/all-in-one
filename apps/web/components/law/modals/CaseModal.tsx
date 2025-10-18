'use client';

/**
 * CaseModal Component
 * Create and edit legal cases
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { BaseModal } from './BaseModal';
import { FormField } from './FormField';
import { UniversalButton } from '@/components/shared';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  caseData?: any; // Existing case for editing
}

export function CaseModal({ isOpen, onClose, onSuccess, caseData }: CaseModalProps) {
  const { language } = useLanguage();
  const isEditing = !!caseData;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    caseType: 'civil' as 'civil' | 'criminal' | 'corporate' | 'family' | 'immigration' | 'other',
    status: 'active' as 'active' | 'pending' | 'closed' | 'archived',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedToId: '',
    filingDate: '',
    nextHearingDate: '',
  });

  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load clients and users for dropdowns
  useEffect(() => {
    if (isOpen) {
      loadClients();
      loadUsers();

      if (caseData) {
        setFormData({
          title: caseData.title || '',
          description: caseData.description || '',
          clientId: caseData.clientId || '',
          caseType: caseData.caseType || 'civil',
          status: caseData.status || 'active',
          priority: caseData.priority || 'medium',
          assignedToId: caseData.assignedToId || '',
          filingDate: caseData.filingDate ? caseData.filingDate.split('T')[0] : '',
          nextHearingDate: caseData.nextHearingDate ? caseData.nextHearingDate.split('T')[0] : '',
        });
      } else {
        // Reset form for new case
        setFormData({
          title: '',
          description: '',
          clientId: '',
          caseType: 'civil',
          status: 'active',
          priority: 'medium',
          assignedToId: '',
          filingDate: '',
          nextHearingDate: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, caseData]);

  const loadClients = async () => {
    try {
      const response = await lawApi.clients.list({ limit: 1000 });
      setClients(response.data || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const loadUsers = async () => {
    // For now, use empty array. In production, fetch from users API
    setUsers([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = language === 'he' ? 'כותרת נדרשת' : 'Title is required';
    }

    if (!formData.clientId) {
      newErrors.clientId = language === 'he' ? 'לקוח נדרש' : 'Client is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        filingDate: formData.filingDate || undefined,
        nextHearingDate: formData.nextHearingDate || undefined,
        assignedToId: formData.assignedToId || undefined,
      };

      if (isEditing) {
        await lawApi.cases.update(caseData.id, submitData);
        toast.success(language === 'he' ? 'התיק עודכן בהצלחה' : 'Case updated successfully');
      } else {
        await lawApi.cases.create(submitData);
        toast.success(language === 'he' ? 'התיק נוצר בהצלחה' : 'Case created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save case:', error);
      toast.error(error.message || (language === 'he' ? 'שגיאה בשמירת התיק' : 'Failed to save case'));
    } finally {
      setLoading(false);
    }
  };

  const caseTypes = {
    civil: language === 'he' ? 'אזרחי' : 'Civil',
    criminal: language === 'he' ? 'פלילי' : 'Criminal',
    corporate: language === 'he' ? 'עסקי' : 'Corporate',
    family: language === 'he' ? 'משפחה' : 'Family',
    immigration: language === 'he' ? 'הגירה' : 'Immigration',
    other: language === 'he' ? 'אחר' : 'Other',
  };

  const statuses = {
    active: language === 'he' ? 'פעיל' : 'Active',
    pending: language === 'he' ? 'ממתין' : 'Pending',
    closed: language === 'he' ? 'סגור' : 'Closed',
    archived: language === 'he' ? 'בארכיון' : 'Archived',
  };

  const priorities = {
    low: language === 'he' ? 'נמוכה' : 'Low',
    medium: language === 'he' ? 'בינונית' : 'Medium',
    high: language === 'he' ? 'גבוהה' : 'High',
    urgent: language === 'he' ? 'דחוף' : 'Urgent',
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing
        ? (language === 'he' ? 'עריכת תיק' : 'Edit Case')
        : (language === 'he' ? 'תיק חדש' : 'New Case')
      }
      description={
        isEditing
          ? (language === 'he' ? 'עדכן את פרטי התיק' : 'Update case details')
          : (language === 'he' ? 'צור תיק משפטי חדש' : 'Create a new legal case')
      }
      size="lg"
      footer={
        <>
          <UniversalButton
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </UniversalButton>
          <UniversalButton
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? (language === 'he' ? 'שומר...' : 'Saving...')
              : isEditing
              ? (language === 'he' ? 'עדכן' : 'Update')
              : (language === 'he' ? 'צור' : 'Create')
            }
          </UniversalButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label={language === 'he' ? 'כותרת' : 'Title'}
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
          placeholder={language === 'he' ? 'הזן כותרת תיק' : 'Enter case title'}
        />

        <FormField
          label={language === 'he' ? 'לקוח' : 'Client'}
          name="clientId"
          type="select"
          value={formData.clientId}
          onChange={handleChange}
          error={errors.clientId}
          required
        >
          <option value="">
            {language === 'he' ? 'בחר לקוח' : 'Select client'}
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === 'he' ? 'סוג תיק' : 'Case Type'}
            name="caseType"
            type="select"
            value={formData.caseType}
            onChange={handleChange}
            required
          >
            {Object.entries(caseTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormField>

          <FormField
            label={language === 'he' ? 'סטטוס' : 'Status'}
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            required
          >
            {Object.entries(statuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === 'he' ? 'עדיפות' : 'Priority'}
            name="priority"
            type="select"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            {Object.entries(priorities).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormField>

          <FormField
            label={language === 'he' ? 'משוייך ל' : 'Assigned To'}
            name="assignedToId"
            type="select"
            value={formData.assignedToId}
            onChange={handleChange}
          >
            <option value="">
              {language === 'he' ? 'לא משוייך' : 'Unassigned'}
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === 'he' ? 'תאריך הגשה' : 'Filing Date'}
            name="filingDate"
            type="date"
            value={formData.filingDate}
            onChange={handleChange}
          />

          <FormField
            label={language === 'he' ? 'דיון הבא' : 'Next Hearing'}
            name="nextHearingDate"
            type="date"
            value={formData.nextHearingDate}
            onChange={handleChange}
          />
        </div>

        <FormField
          label={language === 'he' ? 'תיאור' : 'Description'}
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder={language === 'he' ? 'הזן תיאור התיק' : 'Enter case description'}
        />
      </form>
    </BaseModal>
  );
}
