'use client';

/**
 * EventModal Component
 * Create and edit calendar events
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { BaseModal } from './BaseModal';
import { FormField } from './FormField';
import { UniversalButton } from '@/components/shared';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventData?: any; // Existing event for editing
  caseId?: string; // Pre-fill case if provided
  prefilledDate?: string; // Pre-fill date if provided
}

export function EventModal({ isOpen, onClose, onSuccess, eventData, caseId, prefilledDate }: EventModalProps) {
  const { language } = useLanguage();
  const isEditing = !!eventData;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'meeting' as 'hearing' | 'meeting' | 'deadline' | 'submission' | 'consultation',
    eventDate: '',
    duration: 60,
    location: '',
    caseId: caseId || '',
    isAllDay: false,
  });

  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCases();

      if (eventData) {
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          eventType: eventData.eventType || 'meeting',
          eventDate: eventData.eventDate ? eventData.eventDate.slice(0, 16) : '',
          duration: eventData.duration || 60,
          location: eventData.location || '',
          caseId: eventData.caseId || caseId || '',
          isAllDay: false,
        });
      } else {
        const defaultDate = prefilledDate || new Date().toISOString().slice(0, 16);
        setFormData({
          title: '',
          description: '',
          eventType: 'meeting',
          eventDate: defaultDate,
          duration: 60,
          location: '',
          caseId: caseId || '',
          isAllDay: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, eventData, caseId, prefilledDate]);

  const loadCases = async () => {
    try {
      const response = await lawApi.cases.list({ limit: 1000 });
      setCases(response.data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'duration' ? parseInt(value) || 0 : value }));
    }

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

    if (!formData.eventDate) {
      newErrors.eventDate = language === 'he' ? 'תאריך נדרש' : 'Date is required';
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
        title: formData.title,
        description: formData.description || undefined,
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        duration: formData.duration,
        location: formData.location || undefined,
        caseId: formData.caseId || undefined,
      };

      if (isEditing) {
        await lawApi.events.update(eventData.id, submitData);
        toast.success(language === 'he' ? 'האירוע עודכן בהצלחה' : 'Event updated successfully');
      } else {
        await lawApi.events.create(submitData);
        toast.success(language === 'he' ? 'האירוע נוצר בהצלחה' : 'Event created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save event:', error);
      toast.error(error.message || (language === 'he' ? 'שגיאה בשמירת האירוע' : 'Failed to save event'));
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = {
    hearing: language === 'he' ? 'דיון' : 'Hearing',
    meeting: language === 'he' ? 'פגישה' : 'Meeting',
    deadline: language === 'he' ? 'מועד אחרון' : 'Deadline',
    submission: language === 'he' ? 'הגשה' : 'Submission',
    consultation: language === 'he' ? 'ייעוץ' : 'Consultation',
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing
        ? (language === 'he' ? 'עריכת אירוע' : 'Edit Event')
        : (language === 'he' ? 'אירוע חדש' : 'New Event')
      }
      description={
        isEditing
          ? (language === 'he' ? 'עדכן את פרטי האירוע' : 'Update event details')
          : (language === 'he' ? 'צור אירוע חדש ביומן' : 'Create a new calendar event')
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
          placeholder={language === 'he' ? 'הזן כותרת אירוע' : 'Enter event title'}
        />

        <FormField
          label={language === 'he' ? 'תיאור' : 'Description'}
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder={language === 'he' ? 'הזן תיאור האירוע' : 'Enter event description'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === 'he' ? 'סוג אירוע' : 'Event Type'}
            name="eventType"
            type="select"
            value={formData.eventType}
            onChange={handleChange}
            required
          >
            {Object.entries(eventTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormField>

          <FormField
            label={language === 'he' ? 'תאריך ושעה' : 'Date & Time'}
            name="eventDate"
            type="datetime-local"
            value={formData.eventDate}
            onChange={handleChange}
            error={errors.eventDate}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === 'he' ? 'משך (דקות)' : 'Duration (minutes)'}
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            min={15}
            max={1440}
            step={15}
          />

          <FormField
            label={language === 'he' ? 'מיקום' : 'Location'}
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder={language === 'he' ? 'בית משפט, משרד, וכו\'' : 'Court, Office, etc.'}
          />
        </div>

        <FormField
          label={language === 'he' ? 'תיק' : 'Case'}
          name="caseId"
          type="select"
          value={formData.caseId}
          onChange={handleChange}
        >
          <option value="">
            {language === 'he' ? 'לא משוייך לתיק' : 'Not linked to case'}
          </option>
          {cases.map((case_) => (
            <option key={case_.id} value={case_.id}>
              {case_.caseNumber} - {case_.title}
            </option>
          ))}
        </FormField>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isAllDay"
            name="isAllDay"
            checked={formData.isAllDay}
            onChange={handleChange}
            className="w-4 h-4 text-[#2979FF] border-gray-300 rounded focus:ring-[#2979FF]"
          />
          <label htmlFor="isAllDay" className="text-sm text-gray-700 dark:text-gray-300">
            {language === 'he' ? 'אירוע יום שלם' : 'All-day event'}
          </label>
        </div>
      </form>
    </BaseModal>
  );
}
