'use client';

/**
 * Case Create/Edit Modal
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Optimistic updates via React Query
 * - Full keyboard accessibility
 * - Loading states and error handling
 * - Premium animations
 */

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Briefcase,
  Users,
  Calendar,
  AlertCircle,
  Loader2,
  Save,
  ArrowRight,
} from 'lucide-react';
import { LawButton } from '@/components/law/shared';
import { createCaseSchema, type CreateCaseInput, type Case } from '@/lib/types/law/case';
import { useCreateCase, useUpdateCase } from '@/lib/hooks/law/useCases';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseToEdit?: Case | null;
}

export function CaseModal({ isOpen, onClose, caseToEdit }: CaseModalProps) {
  const isEditMode = !!caseToEdit;
  const createMutation = useCreateCase();
  const updateMutation = useUpdateCase();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CreateCaseInput>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      status: 'pending',
      priority: 'medium',
      type: 'litigation',
      filingDate: new Date().toISOString().split('T')[0],
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (caseToEdit && isOpen) {
      setValue('title', caseToEdit.title);
      setValue('description', caseToEdit.description || '');
      setValue('type', caseToEdit.type);
      setValue('status', caseToEdit.status);
      setValue('priority', caseToEdit.priority);
      setValue('clientId', caseToEdit.client.id);
      setValue('clientName', caseToEdit.client.name);
      setValue('clientEmail', caseToEdit.client.email || '');
      setValue('clientPhone', caseToEdit.client.phone || '');
      setValue('clientCompany', caseToEdit.client.company || '');
      setValue('opposingParty', caseToEdit.opposingParty || '');
      setValue('assignedAttorneyId', caseToEdit.assignedAttorney.id);
      setValue('filingDate', caseToEdit.filingDate);
      setValue('nextHearingDate', caseToEdit.nextHearingDate || '');
      setValue('billingRate', caseToEdit.billingRate);
      setValue('estimatedValue', caseToEdit.estimatedValue);
    }
  }, [caseToEdit, isOpen, setValue]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const onSubmit = async (data: CreateCaseInput) => {
    try {
      if (isEditMode && caseToEdit) {
        await updateMutation.mutateAsync({ ...data, id: caseToEdit.id });
      } else {
        await createMutation.mutateAsync(data);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to save case:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-law-xl shadow-law-xl max-w-3xl w-full my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-law-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-law-lg bg-law-info-bg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-law-info" />
                  </div>
                  <div>
                    <h2 className="text-law-xl font-semibold text-law-text-primary">
                      {isEditMode ? 'Edit Case' : 'Create New Case'}
                    </h2>
                    <p className="text-law-sm text-law-text-secondary">
                      {isEditMode ? 'Update case details' : 'Add a new legal matter to your practice'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-law-primary-subtle rounded-law-md transition-colors disabled:opacity-50"
                  aria-label="Close"
                >
                  <X size={20} className="text-law-text-secondary" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Case Information */}
                <div className="space-y-4">
                  <h3 className="text-law-base font-semibold text-law-text-primary flex items-center gap-2">
                    <Briefcase size={16} />
                    Case Information
                  </h3>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                      Case Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      {...register('title')}
                      className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                      placeholder="e.g., Johnson v. Smith Estate Planning"
                    />
                    {errors.title && (
                      <p className="mt-1 text-law-xs text-law-error flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                      className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all resize-none"
                      placeholder="Brief description of the case..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-law-xs text-law-error flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Type, Status, Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Type *
                      </label>
                      <select
                        id="type"
                        {...register('type')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                      >
                        <option value="litigation">Litigation</option>
                        <option value="corporate">Corporate</option>
                        <option value="family">Family</option>
                        <option value="criminal">Criminal</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="intellectual_property">IP</option>
                        <option value="employment">Employment</option>
                        <option value="immigration">Immigration</option>
                        <option value="tax">Tax</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Status *
                      </label>
                      <select
                        id="status"
                        {...register('status')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Priority *
                      </label>
                      <select
                        id="priority"
                        {...register('priority')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-law-base font-semibold text-law-text-primary flex items-center gap-2">
                    <Users size={16} />
                    Client Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="clientName" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Client Name *
                      </label>
                      <input
                        id="clientName"
                        type="text"
                        {...register('clientName')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                      {errors.clientName && (
                        <p className="mt-1 text-law-xs text-law-error flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.clientName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="clientEmail" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Client Email
                      </label>
                      <input
                        id="clientEmail"
                        type="email"
                        {...register('clientEmail')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                      {errors.clientEmail && (
                        <p className="mt-1 text-law-xs text-law-error flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.clientEmail.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="clientPhone" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Client Phone
                      </label>
                      <input
                        id="clientPhone"
                        type="tel"
                        {...register('clientPhone')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label htmlFor="clientCompany" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Company
                      </label>
                      <input
                        id="clientCompany"
                        type="text"
                        {...register('clientCompany')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                        placeholder="ACME Corp"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="opposingParty" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                      Opposing Party
                    </label>
                    <input
                      id="opposingParty"
                      type="text"
                      {...register('opposingParty')}
                      className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                      placeholder="Jane Smith"
                    />
                  </div>
                </div>

                {/* Assignment & Dates */}
                <div className="space-y-4">
                  <h3 className="text-law-base font-semibold text-law-text-primary flex items-center gap-2">
                    <Calendar size={16} />
                    Assignment & Dates
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="assignedAttorneyId" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Assigned Attorney *
                      </label>
                      <select
                        id="assignedAttorneyId"
                        {...register('assignedAttorneyId')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                      >
                        <option value="">Select attorney...</option>
                        <option value="att-1">Sarah Miller</option>
                        <option value="att-2">James Wilson</option>
                        <option value="att-3">Robert Chen</option>
                      </select>
                      {errors.assignedAttorneyId && (
                        <p className="mt-1 text-law-xs text-law-error flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.assignedAttorneyId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="filingDate" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Filing Date *
                      </label>
                      <input
                        id="filingDate"
                        type="date"
                        {...register('filingDate')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                      />
                      {errors.filingDate && (
                        <p className="mt-1 text-law-xs text-law-error flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.filingDate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="nextHearingDate" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Next Hearing Date
                      </label>
                      <input
                        id="nextHearingDate"
                        type="date"
                        {...register('nextHearingDate')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="billingRate" className="block text-law-sm font-medium text-law-text-secondary mb-1">
                        Billing Rate (€/hour)
                      </label>
                      <input
                        id="billingRate"
                        type="number"
                        step="0.01"
                        {...register('billingRate', { valueAsNumber: true })}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary focus:border-transparent transition-all"
                        placeholder="250.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Hidden fields for client ID (would be populated from client selector) */}
                <input type="hidden" {...register('clientId')} value="client-temp-id" />

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-law-border">
                  <LawButton
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </LawButton>
                  <LawButton
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    icon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : isEditMode ? <Save size={16} /> : <ArrowRight size={16} />}
                    iconPosition="right"
                    className="flex-1"
                  >
                    {isSubmitting ? 'Saving...' : isEditMode ? 'Update Case' : 'Create Case'}
                  </LawButton>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
