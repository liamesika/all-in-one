'use client';

/**
 * InvoiceModal Component
 * Create and edit invoices with line items
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { BaseModal } from './BaseModal';
import { FormField } from './FormField';
import { UniversalButton } from '@/components/shared';
import { lawApi } from '@/lib/api/law';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceData?: any; // Existing invoice for editing
}

export function InvoiceModal({ isOpen, onClose, onSuccess, invoiceData }: InvoiceModalProps) {
  const { language } = useLanguage();
  const isEditing = !!invoiceData;

  const [formData, setFormData] = useState({
    clientName: '',
    caseId: '',
    dueDate: '',
    currency: 'ILS',
    description: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  const [cases, setCases] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCases();
      loadClients();

      if (invoiceData) {
        setFormData({
          clientName: invoiceData.clientName || '',
          caseId: invoiceData.caseId || '',
          dueDate: invoiceData.dueDate ? invoiceData.dueDate.split('T')[0] : '',
          currency: invoiceData.currency || 'ILS',
          description: invoiceData.description || '',
        });

        // In a real implementation, parse line items from invoice data
        setLineItems([{ description: '', quantity: 1, unitPrice: invoiceData.amount || 0 }]);
      } else {
        setFormData({
          clientName: '',
          caseId: '',
          dueDate: '',
          currency: 'ILS',
          description: '',
        });
        setLineItems([{ description: '', quantity: 1, unitPrice: 0 }]);
      }
      setErrors({});
    }
  }, [isOpen, invoiceData]);

  const loadCases = async () => {
    try {
      const response = await lawApi.cases.list({ limit: 1000 });
      setCases(response.data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const loadClients = async () => {
    try {
      const response = await lawApi.clients.list({ limit: 1000 });
      setClients(response.data || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
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

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: field === 'description' ? value : parseFloat(value.toString()) || 0,
    };
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = language === 'he' ? 'שם לקוח נדרש' : 'Client name is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = language === 'he' ? 'תאריך יעד נדרש' : 'Due date is required';
    }

    if (lineItems.every(item => !item.description.trim())) {
      newErrors.lineItems = language === 'he' ? 'יש להוסיף לפחות פריט אחד' : 'At least one line item is required';
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
      const totalAmount = calculateTotal();

      const submitData = {
        clientName: formData.clientName,
        caseId: formData.caseId || undefined,
        amount: totalAmount,
        totalAmount: totalAmount,
        currency: formData.currency,
        description: formData.description || undefined,
        dueDate: formData.dueDate,
      };

      if (isEditing) {
        await lawApi.invoices.update(invoiceData.id, submitData);
        toast.success(language === 'he' ? 'החשבונית עודכנה בהצלחה' : 'Invoice updated successfully');
      } else {
        await lawApi.invoices.create(submitData);
        toast.success(language === 'he' ? 'החשבונית נוצרה בהצלחה' : 'Invoice created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save invoice:', error);
      toast.error(error.message || (language === 'he' ? 'שגיאה בשמירת החשבונית' : 'Failed to save invoice'));
    } finally {
      setLoading(false);
    }
  };

  const currencies = {
    ILS: '₪',
    USD: '$',
    EUR: '€',
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing
        ? (language === 'he' ? 'עריכת חשבונית' : 'Edit Invoice')
        : (language === 'he' ? 'חשבונית חדשה' : 'New Invoice')
      }
      description={
        isEditing
          ? (language === 'he' ? 'עדכן את פרטי החשבונית' : 'Update invoice details')
          : (language === 'he' ? 'צור חשבונית חדשה' : 'Create a new invoice')
      }
      size="xl"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === 'he' ? 'לקוח' : 'Client'}
            name="clientName"
            type="select"
            value={formData.clientName}
            onChange={handleChange}
            error={errors.clientName}
            required
          >
            <option value="">
              {language === 'he' ? 'בחר לקוח' : 'Select client'}
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.name}>
                {client.name}
              </option>
            ))}
          </FormField>

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={language === 'he' ? 'תאריך יעד' : 'Due Date'}
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
            required
          />

          <FormField
            label={language === 'he' ? 'מטבע' : 'Currency'}
            name="currency"
            type="select"
            value={formData.currency}
            onChange={handleChange}
            required
          >
            {Object.entries(currencies).map(([code, symbol]) => (
              <option key={code} value={code}>
                {code} ({symbol})
              </option>
            ))}
          </FormField>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'he' ? 'פריטים' : 'Line Items'}
              <span className="text-red-500 dark:text-red-400 ml-1">*</span>
            </label>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-1 text-sm text-[#2979FF] hover:text-[#1e5bb8]"
            >
              <Plus className="w-4 h-4" />
              {language === 'he' ? 'הוסף פריט' : 'Add Item'}
            </button>
          </div>

          {errors.lineItems && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.lineItems}</p>
          )}

          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={language === 'he' ? 'תיאור' : 'Description'}
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    placeholder={language === 'he' ? 'כמות' : 'Qty'}
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    placeholder={language === 'he' ? 'מחיר' : 'Price'}
                    value={item.unitPrice}
                    onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="w-32 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-right">
                  {(item.quantity * item.unitPrice).toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  disabled={lineItems.length === 1}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'he' ? 'סה"כ:' : 'Total:'}
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {currencies[formData.currency as keyof typeof currencies]}{calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        <FormField
          label={language === 'he' ? 'הערות' : 'Notes'}
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder={language === 'he' ? 'הערות נוספות' : 'Additional notes'}
        />
      </form>
    </BaseModal>
  );
}
