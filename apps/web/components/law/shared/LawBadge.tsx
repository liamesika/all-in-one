/**
 * LawBadge - Status badge component with Law theme
 * Used for case status, priorities, and other categorical data
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { caseStatusColors, priorityColors, invoiceStatusColors } from '@/lib/themes/law-theme-config';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type CaseStatus = 'active' | 'pending' | 'closed' | 'archived';
type Priority = 'high' | 'medium' | 'low';
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

interface LawBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  caseStatus?: CaseStatus;
  priority?: Priority;
  invoiceStatus?: InvoiceStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-law-success-bg text-law-success border-law-success-border',
  warning: 'bg-law-warning-bg text-law-warning border-law-warning-border',
  error: 'bg-law-error-bg text-law-error border-law-error-border',
  info: 'bg-law-info-bg text-law-info border-law-info-border',
  neutral: 'bg-gray-100 text-gray-700 border-gray-300',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-law-xs',
  md: 'px-3 py-1 text-law-sm',
  lg: 'px-4 py-1.5 text-law-base',
};

export function LawBadge({
  children,
  variant,
  caseStatus,
  priority,
  invoiceStatus,
  size = 'md',
  className,
  icon,
}: LawBadgeProps) {
  // Determine variant based on status type
  let computedVariant = variant;
  let colorClasses = '';

  if (caseStatus) {
    const colors = caseStatusColors[caseStatus];
    colorClasses = `${colors.bg} ${colors.text} ${colors.border}`;
  } else if (priority) {
    const colors = priorityColors[priority];
    colorClasses = `${colors.bg} ${colors.text} ${colors.border}`;
  } else if (invoiceStatus) {
    const colors = invoiceStatusColors[invoiceStatus];
    colorClasses = `${colors.bg} ${colors.text} ${colors.border}`;
  } else if (computedVariant) {
    colorClasses = variantClasses[computedVariant];
  }

  return (
    <span
      className={cn(
        'law-badge',
        'inline-flex items-center gap-1',
        'font-semibold',
        'border',
        'rounded-law-sm',
        'whitespace-nowrap',
        sizeClasses[size],
        colorClasses,
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

/**
 * Helper components for common badge types
 */
export function CaseStatusBadge({ status, size = 'md' }: { status: CaseStatus; size?: 'sm' | 'md' | 'lg' }) {
  const labels: Record<CaseStatus, string> = {
    active: 'Active',
    pending: 'Pending',
    closed: 'Closed',
    archived: 'Archived',
  };

  return (
    <LawBadge caseStatus={status} size={size}>
      {labels[status]}
    </LawBadge>
  );
}

export function PriorityBadge({ priority, size = 'md' }: { priority: Priority; size?: 'sm' | 'md' | 'lg' }) {
  const labels: Record<Priority, string> = {
    high: 'High Priority',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <LawBadge priority={priority} size={size}>
      {labels[priority]}
    </LawBadge>
  );
}

export function InvoiceStatusBadge({ status, size = 'md' }: { status: InvoiceStatus; size?: 'sm' | 'md' | 'lg' }) {
  const labels: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
  };

  return (
    <LawBadge invoiceStatus={status} size={size}>
      {labels[status]}
    </LawBadge>
  );
}
