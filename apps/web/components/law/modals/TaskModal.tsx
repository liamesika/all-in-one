'use client';

/**
 * TaskModal Component
 * Create and edit tasks
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { BaseModal } from './BaseModal';
import { FormField } from './FormField';
import { UniversalButton } from '@/components/shared';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskData?: any; // Existing task for editing
  caseId?: string; // Pre-fill case if provided
}

export function TaskModal({ isOpen, onClose, onSuccess, taskData, caseId }: TaskModalProps) {
  const { language } = useLanguage();
  const isEditing = !!taskData;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled',
    dueDate: '',
    caseId: caseId || '',
    assignedToId: '',
    boardColumn: 'todo' as 'todo' | 'in_progress' | 'review' | 'done',
  });

  const [cases, setCases] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCases();
      loadUsers();

      if (taskData) {
        setFormData({
          title: taskData.title || '',
          description: taskData.description || '',
          priority: taskData.priority || 'medium',
          status: taskData.status || 'todo',
          dueDate: taskData.dueDate ? taskData.dueDate.split('T')[0] : '',
          caseId: taskData.caseId || caseId || '',
          assignedToId: taskData.assignedToId || '',
          boardColumn: taskData.boardColumn || 'todo',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          status: 'todo',
          dueDate: '',
          caseId: caseId || '',
          assignedToId: '',
          boardColumn: 'todo',
        });
      }
      setErrors({});
    }
  }, [isOpen, taskData, caseId]);

  const loadCases = async () => {
    try {
      const response = await lawApi.cases.list({ limit: 1000 });
      setCases(response.data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const loadUsers = async () => {
    setUsers([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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
        dueDate: formData.dueDate || undefined,
        caseId: formData.caseId || undefined,
        assignedToId: formData.assignedToId || undefined,
      };

      if (isEditing) {
        await lawApi.tasks.update(taskData.id, submitData);
        toast.success(language === 'he' ? 'המשימה עודכנה בהצלחה' : 'Task updated successfully');
      } else {
        await lawApi.tasks.create(submitData);
        toast.success(language === 'he' ? 'המשימה נוצרה בהצלחה' : 'Task created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save task:', error);
      toast.error(error.message || (language === 'he' ? 'שגיאה בשמירת המשימה' : 'Failed to save task'));
    } finally {
      setLoading(false);
    }
  };

  const priorities = {
    low: language === 'he' ? 'נמוכה' : 'Low',
    medium: language === 'he' ? 'בינונית' : 'Medium',
    high: language === 'he' ? 'גבוהה' : 'High',
    urgent: language === 'he' ? 'דחוף' : 'Urgent',
  };

  const statuses = {
    todo: language === 'he' ? 'לביצוע' : 'To Do',
    in_progress: language === 'he' ? 'בביצוע' : 'In Progress',
    review: language === 'he' ? 'בבדיקה' : 'Review',
    completed: language === 'he' ? 'הושלם' : 'Completed',
    cancelled: language === 'he' ? 'בוטל' : 'Cancelled',
  };

  const boardColumns = {
    todo: language === 'he' ? 'לביצוע' : 'To Do',
    in_progress: language === 'he' ? 'בביצוע' : 'In Progress',
    review: language === 'he' ? 'בבדיקה' : 'Review',
    done: language === 'he' ? 'הושלם' : 'Done',
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing
        ? (language === 'he' ? 'עריכת משימה' : 'Edit Task')
        : (language === 'he' ? 'משימה חדשה' : 'New Task')
      }
      description={
        isEditing
          ? (language === 'he' ? 'עדכן את פרטי המשימה' : 'Update task details')
          : (language === 'he' ? 'צור משימה חדשה' : 'Create a new task')
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
          placeholder={language === 'he' ? 'הזן כותרת משימה' : 'Enter task title'}
        />

        <FormField
          label={language === 'he' ? 'תיאור' : 'Description'}
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder={language === 'he' ? 'הזן תיאור המשימה' : 'Enter task description'}
        />

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
            label={language === 'he' ? 'תאריך יעד' : 'Due Date'}
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
          />

          <FormField
            label={language === 'he' ? 'עמודת לוח' : 'Board Column'}
            name="boardColumn"
            type="select"
            value={formData.boardColumn}
            onChange={handleChange}
          >
            {Object.entries(boardColumns).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormField>
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
      </form>
    </BaseModal>
  );
}
