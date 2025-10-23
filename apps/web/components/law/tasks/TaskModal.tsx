'use client';

/**
 * TaskModal Component
 * Create/Edit task modal with React Hook Form
 * Manual validation (no zodResolver due to Zod v3 compatibility)
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertCircle,
  Calendar,
  Flag,
  User,
  FileText,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { LawButton } from '@/components/law/shared';
import { useCreateTask, useUpdateTask } from '@/lib/hooks/law/useTasks';
import type {
  Task,
  CreateTaskInput,
  TaskStatus,
  TaskPriority,
} from '@/lib/types/law/task';
import toast from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export function TaskModal({ isOpen, onClose, taskToEdit }: TaskModalProps) {
  const isEditMode = !!taskToEdit;

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskInput>({
    defaultValues: isEditMode && taskToEdit
      ? {
          title: taskToEdit.title,
          description: taskToEdit.description || '',
          status: taskToEdit.status,
          priority: taskToEdit.priority,
          dueDate: taskToEdit.dueDate || '',
          caseId: taskToEdit.caseId || '',
          assigneeId: taskToEdit.assigneeId,
          notes: taskToEdit.notes || '',
        }
      : {
          title: '',
          description: '',
          status: 'todo' as TaskStatus,
          priority: 'medium' as TaskPriority,
          dueDate: '',
          caseId: '',
          assigneeId: '',
          notes: '',
        },
  });

  // Lock body scroll when modal is open
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

  // Reset form when modal opens/closes or taskToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && taskToEdit) {
        reset({
          title: taskToEdit.title,
          description: taskToEdit.description || '',
          status: taskToEdit.status,
          priority: taskToEdit.priority,
          dueDate: taskToEdit.dueDate || '',
          caseId: taskToEdit.caseId || '',
          assigneeId: taskToEdit.assigneeId,
          notes: taskToEdit.notes || '',
        });
      } else {
        reset({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: '',
          caseId: '',
          assigneeId: '',
          notes: '',
        });
      }
    }
  }, [isOpen, isEditMode, taskToEdit, reset]);

  const onSubmit = async (data: CreateTaskInput) => {
    // Manual validation (no zodResolver)
    if (!data.title || data.title.trim().length < 3) {
      setError('title', { message: 'Title must be at least 3 characters' });
      return;
    }

    if (!data.assigneeId) {
      setError('assigneeId', { message: 'Assigned attorney is required' });
      return;
    }

    try {
      if (isEditMode && taskToEdit) {
        await updateMutation.mutateAsync({
          ...data,
          id: taskToEdit.id,
        });
        toast.success('Task updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Task created successfully');
      }

      reset();
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error(
        isEditMode ? 'Failed to update task' : 'Failed to create task'
      );
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const status = watch('status');
  const priority = watch('priority');

  const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
    { value: 'todo', label: 'To Do', color: 'law-text-tertiary' },
    { value: 'in_progress', label: 'In Progress', color: 'law-info' },
    { value: 'review', label: 'Review', color: 'law-accent' },
    { value: 'done', label: 'Done', color: 'law-success' },
    { value: 'cancelled', label: 'Cancelled', color: 'law-error' },
  ];

  const priorityOptions: { value: TaskPriority; label: string; icon: React.ReactNode }[] = [
    { value: 'low', label: 'Low', icon: <Flag size={14} className="text-law-text-tertiary" /> },
    { value: 'medium', label: 'Medium', icon: <Flag size={14} className="text-law-info" /> },
    { value: 'high', label: 'High', icon: <Flag size={14} className="text-law-accent" /> },
    { value: 'urgent', label: 'Urgent', icon: <Flag size={14} className="text-law-error" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <div
              className="bg-white rounded-law-xl shadow-law-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-law-border px-law-6 py-law-4 flex items-center justify-between">
                <div>
                  <h2 className="text-law-xl font-semibold text-law-text-primary">
                    {isEditMode ? 'Edit Task' : 'New Task'}
                  </h2>
                  <p className="text-law-sm text-law-text-secondary mt-1">
                    {isEditMode
                      ? 'Update task details and assignments'
                      : 'Create a new task for your team'}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-law-md hover:bg-law-border transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} className="text-law-text-tertiary" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-law-6 space-y-law-6">
                {/* Basic Information */}
                <div className="space-y-law-4">
                  <h3 className="text-law-base font-semibold text-law-text-primary flex items-center gap-2">
                    <FileText size={18} className="text-law-primary" />
                    Basic Information
                  </h3>

                  {/* Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-law-sm font-medium text-law-text-primary mb-2"
                    >
                      Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      {...register('title')}
                      placeholder="e.g., File motion for summary judgment"
                      className={`w-full px-4 py-3 rounded-law-md border ${
                        errors.title
                          ? 'border-law-error focus:ring-law-error'
                          : 'border-law-border focus:ring-law-primary'
                      } bg-white text-law-text-primary placeholder:text-law-text-tertiary focus:outline-none focus:ring-2 transition-all`}
                    />
                    {errors.title && (
                      <p className="mt-2 text-law-sm text-law-error flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-law-sm font-medium text-law-text-primary mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      {...register('description')}
                      rows={3}
                      placeholder="Provide additional context or instructions..."
                      className="w-full px-4 py-3 rounded-law-md border border-law-border bg-white text-law-text-primary placeholder:text-law-text-tertiary focus:outline-none focus:ring-2 focus:ring-law-primary transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Status & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-law-4">
                  {/* Status */}
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-law-sm font-medium text-law-text-primary mb-2"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      {...register('status')}
                      className="w-full px-4 py-3 rounded-law-md border border-law-border bg-white text-law-text-primary focus:outline-none focus:ring-2 focus:ring-law-primary transition-all"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label
                      htmlFor="priority"
                      className="block text-law-sm font-medium text-law-text-primary mb-2"
                    >
                      Priority
                    </label>
                    <select
                      id="priority"
                      {...register('priority')}
                      className="w-full px-4 py-3 rounded-law-md border border-law-border bg-white text-law-text-primary focus:outline-none focus:ring-2 focus:ring-law-primary transition-all"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assignments */}
                <div className="space-y-law-4">
                  <h3 className="text-law-base font-semibold text-law-text-primary flex items-center gap-2">
                    <User size={18} className="text-law-primary" />
                    Assignments
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-law-4">
                    {/* Assigned Attorney */}
                    <div>
                      <label
                        htmlFor="assigneeId"
                        className="block text-law-sm font-medium text-law-text-primary mb-2"
                      >
                        Assigned Attorney *
                      </label>
                      <select
                        id="assigneeId"
                        {...register('assigneeId')}
                        className={`w-full px-4 py-3 rounded-law-md border ${
                          errors.assigneeId
                            ? 'border-law-error focus:ring-law-error'
                            : 'border-law-border focus:ring-law-primary'
                        } bg-white text-law-text-primary focus:outline-none focus:ring-2 transition-all`}
                      >
                        <option value="">Select attorney...</option>
                        <option value="att-1">Sarah Miller</option>
                        <option value="att-2">James Wilson</option>
                        <option value="att-3">Robert Chen</option>
                        <option value="att-4">Emily Davis</option>
                      </select>
                      {errors.assigneeId && (
                        <p className="mt-2 text-law-sm text-law-error flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.assigneeId.message}
                        </p>
                      )}
                    </div>

                    {/* Case (Optional) */}
                    <div>
                      <label
                        htmlFor="caseId"
                        className="block text-law-sm font-medium text-law-text-primary mb-2"
                      >
                        Related Case
                      </label>
                      <select
                        id="caseId"
                        {...register('caseId')}
                        className="w-full px-4 py-3 rounded-law-md border border-law-border bg-white text-law-text-primary focus:outline-none focus:ring-2 focus:ring-law-primary transition-all"
                      >
                        <option value="">None</option>
                        <option value="case-1">Johnson v. Smith Estate Planning</option>
                        <option value="case-2">Corporate Restructuring - TechCorp</option>
                        <option value="case-3">Martinez Family Law Matter</option>
                        <option value="case-4">Property Dispute - Greenfield LLC</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-law-sm font-medium text-law-text-primary mb-2 flex items-center gap-2"
                  >
                    <Calendar size={16} className="text-law-primary" />
                    Due Date
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    {...register('dueDate')}
                    className="w-full px-4 py-3 rounded-law-md border border-law-border bg-white text-law-text-primary focus:outline-none focus:ring-2 focus:ring-law-primary transition-all"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-law-sm font-medium text-law-text-primary mb-2"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    {...register('notes')}
                    rows={4}
                    placeholder="Add any internal notes or reminders..."
                    className="w-full px-4 py-3 rounded-law-md border border-law-border bg-white text-law-text-primary placeholder:text-law-text-tertiary focus:outline-none focus:ring-2 focus:ring-law-primary transition-all resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-law-4 border-t border-law-border">
                  <LawButton
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </LawButton>
                  <LawButton
                    type="submit"
                    variant="primary"
                    size="md"
                    icon={
                      isSubmitting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle size={16} />
                      )
                    }
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? isEditMode
                        ? 'Updating...'
                        : 'Creating...'
                      : isEditMode
                        ? 'Update Task'
                        : 'Create Task'}
                  </LawButton>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
