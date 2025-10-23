/**
 * LawEmptyState - Empty state component
 * Used when no data is available
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LawButton } from './LawButton';
import { FileText, FolderOpen, Users, FileX } from 'lucide-react';

interface LawEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultIcons = {
  cases: <FolderOpen className="w-16 h-16 text-law-secondary" />,
  clients: <Users className="w-16 h-16 text-law-secondary" />,
  documents: <FileText className="w-16 h-16 text-law-secondary" />,
  default: <FileX className="w-16 h-16 text-law-secondary" />,
};

export function LawEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: LawEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-4',
        'text-center',
        className
      )}
    >
      <div className="mb-4">{icon || defaultIcons.default}</div>
      <h3 className="text-law-xl font-semibold text-law-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-law-base text-law-text-secondary max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <LawButton onClick={action.onClick} size="lg">
          {action.label}
        </LawButton>
      )}
    </div>
  );
}

/**
 * Pre-configured empty states
 */
export function NoCasesEmptyState({ onCreateCase }: { onCreateCase: () => void }) {
  return (
    <LawEmptyState
      icon={defaultIcons.cases}
      title="No cases yet"
      description="Get started by creating your first case. Track matters, deadlines, and client communications all in one place."
      action={{
        label: 'Create First Case',
        onClick: onCreateCase,
      }}
    />
  );
}

export function NoClientsEmptyState({ onAddClient }: { onAddClient: () => void }) {
  return (
    <LawEmptyState
      icon={defaultIcons.clients}
      title="No clients yet"
      description="Add your first client to start managing relationships, cases, and communications."
      action={{
        label: 'Add First Client',
        onClick: onAddClient,
      }}
    />
  );
}

export function NoDocumentsEmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <LawEmptyState
      icon={defaultIcons.documents}
      title="No documents uploaded"
      description="Upload contracts, briefs, and case documents to organize your legal files."
      action={{
        label: 'Upload Document',
        onClick: onUpload,
      }}
    />
  );
}
