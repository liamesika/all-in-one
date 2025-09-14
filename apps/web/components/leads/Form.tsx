'use client';
import React, { useState, useId } from 'react';
import { useLanguage } from '@/lib/language-context';

type Field =
  | { name: string; label: { he: string; en: string }; required?: boolean; type?: 'text' | 'number' | 'select' | 'textarea'; options?: { he: string[]; en: string[] }; defaultValue?: any };

const fieldsByMode: Record<string, Field[]> = {
  'real-estate': [
    { name: 'clientName', label: { he: 'לקוח', en: 'Client' }, required: true },
    { name: 'phone', label: { he: 'טלפון', en: 'Phone' } },
    { name: 'email', label: { he: 'אימייל', en: 'Email' } },
    { 
      name: 'propertyType', 
      label: { he: 'סוג נכס', en: 'Property Type' }, 
      type: 'select', 
      options: { 
        he: ['דירה','בית','מגרש','מסחרי','אחר'],
        en: ['Apartment','House','Plot','Commercial','Other']
      } 
    },
    { name: 'city', label: { he: 'עיר', en: 'City' } },
    { name: 'budgetMin', label: { he: 'תקציב מ־', en: 'Budget From' }, type: 'number' },
    { name: 'budgetMax', label: { he: 'תקציב עד', en: 'Budget To' }, type: 'number' },
    { 
      name: 'status', 
      label: { he: 'סטטוס', en: 'Status' }, 
      type: 'select', 
      options: { 
        he: ['חדש','נוצר קשר','פגישה','הצעה','עסקה'],
        en: ['NEW','CONTACTED','MEETING','OFFER','DEAL']
      }, 
      defaultValue: 'NEW' 
    },
    { name: 'source', label: { he: 'מקור', en: 'Source' } },
    { name: 'notes', label: { he: 'הערות', en: 'Notes' }, type: 'textarea' },
  ],
  // אפשר להוסיף מצבים נוספים בהמשך (ecommerce וכו')
};

export default function LeadForm({
  mode = 'real-estate',
  onSubmit,
}: {
  mode?: string;
  onSubmit: (payload: Record<string, any>) => Promise<void> | void;
}) {
  const { language } = useLanguage();
  const fields = fieldsByMode[mode] || [];
  const initial = Object.fromEntries(fields.map(f => [f.name, f.defaultValue ?? '']));
  const [values, setValues] = useState<Record<string, any>>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formId = useId();
  const statusId = useId();

  function set(name: string, val: any) {
    setValues((prev) => ({ ...prev, [name]: val }));
  }

  // Form validation
  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && !values[field.name]) {
        newErrors[field.name] = language === 'he' 
          ? `${field.label.he} הוא שדה חובה`
          : `${field.label.en} is required`;
      }
      
      // Email validation
      if (field.name === 'email' && values[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values[field.name])) {
          newErrors[field.name] = language === 'he'
            ? 'כתובת אימייל לא תקינה'
            : 'Please provide a valid email address';
        }
      }
      
      // Phone validation (basic)
      if (field.name === 'phone' && values[field.name]) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!phoneRegex.test(values[field.name])) {
          newErrors[field.name] = language === 'he'
            ? 'מספר טלפון לא תקין'
            : 'Please provide a valid phone number';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    
    // Clear previous errors
    setErrors({});
    
    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.getElementById(`${formId}-${firstErrorField}`);
        errorElement?.focus();
      }
      return;
    }
    
    setSubmitting(true);
    try {
      // המרות בסיסיות
      const payload = { ...values };
      if (payload.budgetMin !== '') payload.budgetMin = Number(payload.budgetMin);
      else payload.budgetMin = null;
      if (payload.budgetMax !== '') payload.budgetMax = Number(payload.budgetMax);
      else payload.budgetMax = null;

      await onSubmit(payload);
      setValues(initial); // איפוס טופס
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle submission errors
    } finally {
      setSubmitting(false);
    }
  }

  const currentLang = language as 'he' | 'en';

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6 border border-gray-300 rounded-lg p-6 bg-white shadow-sm"
      role="form"
      aria-labelledby={`${formId}-title`}
      aria-describedby={submitting ? `${statusId}` : undefined}
      noValidate
    >
      <div className="mb-6">
        <h2 id={`${formId}-title`} className="text-xl font-semibold text-gray-900">
          {language === 'he' ? 'טופס ליד חדש' : 'New Lead Form'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {language === 'he' ? 'מלא את הפרטים הבאים ליצירת ליד חדש' : 'Fill out the following details to create a new lead'}
        </p>
      </div>
      
      {/* Status message for screen readers */}
      <div 
        id={statusId}
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {submitting && (language === 'he' ? 'שומר טופס...' : 'Saving form...')}
        {Object.keys(errors).length > 0 && (
          language === 'he' 
            ? `נמצאו ${Object.keys(errors).length} שגיאות בטופס`
            : `Found ${Object.keys(errors).length} errors in the form`
        )}
      </div>

      <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" disabled={submitting}>
        <legend className="sr-only">
          {language === 'he' ? 'פרטי הליד' : 'Lead Details'}
        </legend>
        
        {fields.map((f) => {
          const fieldId = `${formId}-${f.name}`;
          const errorId = `${fieldId}-error`;
          const hasError = !!errors[f.name];
          const isRequired = !!f.required;
          
          return (
            <div key={f.name} className="flex flex-col gap-2">
              <label 
                htmlFor={fieldId}
                className="text-sm font-semibold text-gray-700 flex items-center gap-1"
              >
                {f.label[currentLang]}
                {isRequired && (
                  <span className="text-red-500" aria-label={language === 'he' ? 'שדה חובה' : 'required field'}>
                    *
                  </span>
                )}
              </label>
              
              {f.type === 'textarea' ? (
                <textarea
                  id={fieldId}
                  name={f.name}
                  className={`
                    min-h-[96px] w-full rounded-md border px-3 py-2 text-sm
                    transition-colors focus-visible:outline-none 
                    focus-visible:ring-2 focus-visible:ring-blue-600 
                    focus-visible:ring-offset-2 disabled:cursor-not-allowed 
                    disabled:opacity-50
                    ${hasError 
                      ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                  `}
                  required={isRequired}
                  aria-required={isRequired}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                  value={values[f.name] ?? ''}
                  onChange={(e) => {
                    set(f.name, e.target.value);
                    if (errors[f.name]) {
                      setErrors(prev => ({ ...prev, [f.name]: '' }));
                    }
                  }}
                  placeholder={language === 'he' ? 'הכנס הערות...' : 'Enter notes...'}
                  rows={3}
                />
              ) : f.type === 'select' ? (
                <select
                  id={fieldId}
                  name={f.name}
                  className={`
                    h-10 w-full rounded-md border px-3 py-2 text-sm
                    transition-colors focus-visible:outline-none 
                    focus-visible:ring-2 focus-visible:ring-blue-600 
                    focus-visible:ring-offset-2 disabled:cursor-not-allowed 
                    disabled:opacity-50
                    ${hasError 
                      ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                  `}
                  required={isRequired}
                  aria-required={isRequired}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                  value={values[f.name] ?? f.defaultValue ?? ''}
                  onChange={(e) => {
                    set(f.name, e.target.value);
                    if (errors[f.name]) {
                      setErrors(prev => ({ ...prev, [f.name]: '' }));
                    }
                  }}
                >
                  <option value="">
                    {isRequired 
                      ? (language === 'he' ? 'בחר אפשרות...' : 'Choose an option...') 
                      : (language === 'he' ? 'לא חובה' : 'Optional')
                    }
                  </option>
                  {(f.options?.[currentLang] || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={fieldId}
                  name={f.name}
                  type={f.type === 'number' ? 'number' : f.name === 'email' ? 'email' : f.name === 'phone' ? 'tel' : 'text'}
                  inputMode={f.type === 'number' ? 'numeric' : f.name === 'phone' ? 'tel' : 'text'}
                  className={`
                    h-10 w-full rounded-md border px-3 py-2 text-sm
                    transition-colors focus-visible:outline-none 
                    focus-visible:ring-2 focus-visible:ring-blue-600 
                    focus-visible:ring-offset-2 disabled:cursor-not-allowed 
                    disabled:opacity-50
                    ${hasError 
                      ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                  `}
                  required={isRequired}
                  aria-required={isRequired}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                  value={values[f.name] ?? ''}
                  onChange={(e) => {
                    set(f.name, e.target.value);
                    if (errors[f.name]) {
                      setErrors(prev => ({ ...prev, [f.name]: '' }));
                    }
                  }}
                  placeholder={
                    f.name === 'email' 
                      ? (language === 'he' ? 'example@domain.com' : 'example@domain.com')
                      : f.name === 'phone' 
                        ? (language === 'he' ? '050-1234567' : '050-1234567')
                        : f.name === 'city'
                          ? (language === 'he' ? 'תל אביב' : 'Tel Aviv')
                          : `${language === 'he' ? 'הכנס' : 'Enter'} ${f.label[currentLang].toLowerCase()}...`
                  }
                  {...(f.type === 'number' && {
                    min: f.name.includes('budget') ? 0 : undefined,
                    step: f.name.includes('budget') ? 1000 : 1
                  })}
                />
              )}
              
              {hasError && (
                <div 
                  id={errorId}
                  className="flex items-center gap-1 text-sm text-red-600"
                  role="alert"
                  aria-live="polite"
                >
                  <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors[f.name]}
                </div>
              )}
            </div>
          );
        })}
      </fieldset>

      <div className="flex gap-3 justify-start pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={submitting}
          className="
            inline-flex items-center justify-center gap-2 rounded-md 
            bg-blue-600 px-6 py-3 text-sm font-semibold text-white 
            transition-colors hover:bg-blue-700 focus-visible:outline-none 
            focus-visible:ring-2 focus-visible:ring-blue-600 
            focus-visible:ring-offset-2 disabled:cursor-not-allowed 
            disabled:opacity-50 disabled:hover:bg-blue-600
            min-h-[44px] min-w-[120px]
          "
          aria-describedby={submitting ? statusId : undefined}
        >
          {submitting && (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {submitting ? (language === 'he' ? 'שומר…' : 'Saving…') : (language === 'he' ? 'שמור ליד' : 'Save Lead')}
        </button>
        
        <button
          type="button"
          disabled={submitting}
          onClick={() => {
            setValues(initial);
            setErrors({});
          }}
          className="
            inline-flex items-center justify-center rounded-md 
            border border-gray-300 bg-white px-6 py-3 text-sm font-semibold 
            text-gray-700 transition-colors hover:bg-gray-50 
            focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-gray-500 focus-visible:ring-offset-2 
            disabled:cursor-not-allowed disabled:opacity-50
            min-h-[44px]
          "
        >
          {language === 'he' ? 'איפוס' : 'Reset'}
        </button>
      </div>
    </form>
  );
}
