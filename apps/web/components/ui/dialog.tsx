'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">{children}</div>
    </div>
  );
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogContent({ className, children }: DialogContentProps) {
  return (
    <div
      className={cn(
        'relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogTitle({ className, children }: DialogTitleProps) {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>;
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogDescription({ className, children }: DialogDescriptionProps) {
  return <p className={cn('text-sm text-gray-500 mt-1', className)}>{children}</p>;
}

interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div className={cn('mt-6 flex justify-end gap-2', className)}>
      {children}
    </div>
  );
}
