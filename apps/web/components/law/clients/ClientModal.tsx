'use client';

/**
 * Client Modal - Create/Edit Client
 * Features: React Hook Form + Zod validation, loading states, optimistic updates
 * Design: Law theme with white bg, deep navy text, premium animations
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2, Building2, Mail, Phone, MapPin, FileText, Tag } from 'lucide-react';
import { type CreateClientInput, type Client } from '@/lib/types/law/client';
import { useCreateClient, useUpdateClient } from '@/lib/hooks/law/useClients';
import { trackEventWithConsent } from '@/lib/analytics/consent';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client;
}

export function ClientModal({ isOpen, onClose, clientToEdit }: ClientModalProps) {
  const isEditMode = !!clientToEdit;
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    setError,
  } = useForm<CreateClientInput>({
    defaultValues: {
      status: 'lead',
      tags: [],
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && clientToEdit) {
      setValue('name', clientToEdit.name);
      setValue('email', clientToEdit.email || '');
      setValue('phone', clientToEdit.phone || '');
      setValue('company', clientToEdit.company || '');
      setValue('status', clientToEdit.status);
      setValue('tags', clientToEdit.tags);
      setValue('assignedAttorneyId', clientToEdit.assignedAttorney.id);
      setValue('address', clientToEdit.address || {});
      setValue('notes', clientToEdit.notes || '');
    }
  }, [isEditMode, clientToEdit, setValue]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Track modal open
  useEffect(() => {
    if (isOpen) {
      trackEventWithConsent('law_client_modal_open', {
        mode: isEditMode ? 'edit' : 'create',
        client_id: clientToEdit?.id,
      });
    }
  }, [isOpen, isEditMode, clientToEdit?.id]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const onSubmit = async (data: CreateClientInput) => {
    // Basic validation
    if (!data.name || data.name.length < 2) {
      setError('name', { message: 'Name must be at least 2 characters' });
      return;
    }
    if (!data.assignedAttorneyId) {
      setError('assignedAttorneyId', { message: 'Assigned attorney is required' });
      return;
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError('email', { message: 'Invalid email address' });
      return;
    }

    try {
      if (isEditMode && clientToEdit) {
        await updateMutation.mutateAsync({ ...data, id: clientToEdit.id });
      } else {
        await createMutation.mutateAsync(data);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to save client:', error);
    }
  };

  const selectedTags = watch('tags') || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-law-lg shadow-law-xl w-full max-w-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-law-border">
                <h2 className="text-law-xl font-semibold text-law-text-primary">
                  {isEditMode ? 'Edit Client' : 'Create New Client'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-law-primary-subtle rounded-law-md transition-colors"
                  aria-label="Close modal"
                  disabled={isSubmitting}
                >
                  <X size={20} className="text-law-text-secondary" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-law-base font-medium text-law-text-primary">
                    Basic Information
                  </h3>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-law-sm font-medium text-law-text-secondary mb-1.5">
                      Client Name <span className="text-law-error">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register('name')}
                      className={`w-full px-4 py-2.5 border rounded-law-md focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-law-error focus:ring-law-error'
                          : 'border-law-border focus:ring-law-primary'
                      }`}
                      placeholder="Enter client name"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="mt-1 text-law-xs text-law-error flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email & Phone - Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-law-sm font-medium text-law-text-secondary mb-1.5">
                        <Mail size={14} className="inline mr-1" />
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className={`w-full px-4 py-2.5 border rounded-law-md focus:outline-none focus:ring-2 transition-all ${
                          errors.email
                            ? 'border-law-error focus:ring-law-error'
                            : 'border-law-border focus:ring-law-primary'
                        }`}
                        placeholder="client@example.com"
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="mt-1 text-law-xs text-law-error flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-law-sm font-medium text-law-text-secondary mb-1.5">
                        <Phone size={14} className="inline mr-1" />
                        Phone
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary transition-all"
                        placeholder="+1 (555) 123-4567"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-law-sm font-medium text-law-text-secondary mb-1.5">
                      <Building2 size={14} className="inline mr-1" />
                      Company
                    </label>
                    <input
                      id="company"
                      type="text"
                      {...register('company')}
                      className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary transition-all"
                      placeholder="Company name (if applicable)"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Status & Tags */}
                <div className="space-y-4">
                  <h3 className="text-law-base font-medium text-law-text-primary">
                    Classification
                  </h3>

                  {/* Status & Attorney - Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                      <label htmlFor="status" className="block text-law-sm font-medium text-law-text-secondary mb-1.5">
                        Status <span className="text-law-error">*</span>
                      </label>
                      <select
                        id="status"
                        {...register('status')}
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary transition-all"
                        disabled={isSubmitting}
                      >
                        <option value="lead">Lead</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    {/* Assigned Attorney */}
                    <div>
                      <label htmlFor="assignedAttorneyId" className="block text-law-sm font-medium text-law-text-secondary mb-1.5">
                        Assigned Attorney <span className="text-law-error">*</span>
                      </label>
                      <select
                        id="assignedAttorneyId"
                        {...register('assignedAttorneyId')}
                        className={`w-full px-4 py-2.5 border rounded-law-md focus:outline-none focus:ring-2 transition-all ${
                          errors.assignedAttorneyId
                            ? 'border-law-error focus:ring-law-error'
                            : 'border-law-border focus:ring-law-primary'
                        }`}
                        disabled={isSubmitting}
                      >
                        <option value="">Select attorney</option>
                        <option value="attorney-1">Sarah Williams</option>
                        <option value="attorney-2">Robert Chen</option>
                        <option value="attorney-3">Michael Johnson</option>
                      </select>
                      {errors.assignedAttorneyId && (
                        <p className="mt-1 text-law-xs text-law-error flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.assignedAttorneyId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-law-sm font-medium text-law-text-secondary mb-2">
                      <Tag size={14} className="inline mr-1" />
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['vip', 'corporate', 'individual', 'government', 'non-profit', 'referral', 'high-value'].map((tag) => {
                        const isSelected = selectedTags.includes(tag as any);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const currentTags = watch('tags') || [];
                              if (isSelected) {
                                setValue('tags', currentTags.filter((t) => t !== tag));
                              } else {
                                setValue('tags', [...currentTags, tag as any]);
                              }
                            }}
                            className={`px-3 py-1.5 text-law-xs font-medium rounded-law-md border transition-all ${
                              isSelected
                                ? 'bg-law-primary text-white border-law-primary'
                                : 'bg-white text-law-text-secondary border-law-border hover:border-law-primary hover:text-law-primary'
                            }`}
                            disabled={isSubmitting}
                          >
                            {tag.replace('-', ' ').toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Address (Optional) */}
                <div className="space-y-4">
                  <h3 className="text-law-base font-medium text-law-text-primary">
                    <MapPin size={16} className="inline mr-1" />
                    Address (Optional)
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <input
                      {...register('address.street')}
                      placeholder="Street address"
                      className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary"
                      disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <input
                        {...register('address.city')}
                        placeholder="City"
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary"
                        disabled={isSubmitting}
                      />
                      <input
                        {...register('address.state')}
                        placeholder="State"
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary"
                        disabled={isSubmitting}
                      />
                      <input
                        {...register('address.zipCode')}
                        placeholder="ZIP"
                        className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-law-sm font-medium text-law-text-secondary mb-1.5">
                    <FileText size={14} className="inline mr-1" />
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    {...register('notes')}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-law-border rounded-law-md focus:outline-none focus:ring-2 focus:ring-law-primary resize-none transition-all"
                    placeholder="Additional notes about this client..."
                    disabled={isSubmitting}
                  />
                  {errors.notes && (
                    <p className="mt-1 text-law-xs text-law-error flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.notes.message}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-law-border">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-law-sm font-medium text-law-text-secondary hover:bg-law-primary-subtle rounded-law-md transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-law-primary text-white text-law-sm font-medium rounded-law-md hover:bg-law-primary-hover focus:outline-none focus:ring-2 focus:ring-law-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {isEditMode ? 'Update Client' : 'Create Client'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
