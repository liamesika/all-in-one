'use client';

/**
 * ClientModal Component
 * Create and edit clients
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { BaseModal } from './BaseModal';
import { FormField } from './FormField';
import { UniversalButton } from '@/components/shared';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientData?: any; // Existing client for editing
}

export function ClientModal({ isOpen, onClose, onSuccess, clientData }: ClientModalProps) {
  const { language } = useLanguage();
  const isEditing = !!clientData;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: '',
    clientType: 'individual' as 'individual' | 'corporate',
    tags: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (clientData) {
        setFormData({
          name: clientData.name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          company: clientData.company || '',
          address: clientData.address || '',
          city: clientData.city || '',
          country: clientData.country || '',
          clientType: clientData.clientType || 'individual',
          tags: Array.isArray(clientData.tags) ? clientData.tags.join(', ') : '',
          notes: clientData.notes || '',
        });
      } else {
        // Reset form for new client
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          address: '',
          city: '',
          country: '',
          clientType: 'individual',
          tags: '',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, clientData]);

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

    if (!formData.name.trim()) {
      newErrors.name = language === 'he' ? 'שם נדרש' : 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = language === 'he' ? 'אימייל נדרש' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'he' ? 'אימייל לא תקין' : 'Invalid email';
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
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        clientType: formData.clientType,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        notes: formData.notes || undefined,
      };

      if (isEditing) {
        await lawApi.clients.update(clientData.id, submitData);
        toast.success(language === 'he' ? 'הלקוח עודכן בהצלחה' : 'Client updated successfully');
      } else {
        await lawApi.clients.create(submitData);
        toast.success(language === 'he' ? 'הלקוח נוצר בהצלחה' : 'Client created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save client:', error);
      toast.error(error.message || (language === 'he' ? 'שגיאה בשמירת הלקוח' : 'Failed to save client'));
    } finally {
      setLoading(false);
    }
  };

  const clientTypes = {
    individual: language === 'he' ? 'פרטי' : 'Individual',
    corporate: language === 'he' ? 'תאגיד' : 'Corporate',
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing
        ? (language === 'he' ? 'עריכת לקוח' : 'Edit Client')
        : (language === 'he' ? 'לקוח חדש' : 'New Client')
      }
      description={
        isEditing
          ? (language === 'he' ? 'עדכן את פרטי הלקוח' : 'Update client details')
          : (language === 'he' ? 'צור לקוח חדש' : 'Create a new client')
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
          label={language === 'he' ? 'שם' : 'Name'}
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder={language === 'he' ? 'הזן שם לקוח' : 'Enter client name'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === 'he' ? 'אימייל' : 'Email'}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="client@example.com"
          />

          <FormField
            label={language === 'he' ? 'טלפון' : 'Phone'}
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+972-50-123-4567"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === 'he' ? 'סוג לקוח' : 'Client Type'}
            name="clientType"
            type="select"
            value={formData.clientType}
            onChange={handleChange}
            required
          >
            {Object.entries(clientTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormField>

          <FormField
            label={language === 'he' ? 'חברה' : 'Company'}
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder={language === 'he' ? 'שם החברה' : 'Company name'}
          />
        </div>

        <FormField
          label={language === 'he' ? 'כתובת' : 'Address'}
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder={language === 'he' ? 'רחוב 123' : '123 Main Street'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === 'he' ? 'עיר' : 'City'}
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder={language === 'he' ? 'תל אביב' : 'Tel Aviv'}
          />

          <FormField
            label={language === 'he' ? 'מדינה' : 'Country'}
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder={language === 'he' ? 'ישראל' : 'Israel'}
          />
        </div>

        <FormField
          label={language === 'he' ? 'תגיות' : 'Tags'}
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder={language === 'he' ? 'vip, עסקי, חוזרים (מופרד בפסיקים)' : 'vip, corporate, returning (comma-separated)'}
        />

        <FormField
          label={language === 'he' ? 'הערות' : 'Notes'}
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder={language === 'he' ? 'הערות נוספות על הלקוח' : 'Additional notes about the client'}
        />
      </form>
    </BaseModal>
  );
}
