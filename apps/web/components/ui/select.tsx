'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onValueChange,
            open,
            setOpen,
          });
        }
        return child;
      })}
    </div>
  );
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  value?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function SelectTrigger({
  className,
  children,
  value,
  open,
  setOpen,
}: SelectTriggerProps) {
  return (
    <button
      type="button"
      onClick={() => setOpen?.(!open)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

interface SelectValueProps {
  value?: string;
}

export function SelectValue({ value }: SelectValueProps) {
  return <span>{value}</span>;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  onValueChange?: (value: string) => void;
}

export function SelectContent({
  className,
  children,
  open,
  setOpen,
  onValueChange,
}: SelectContentProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen?.(false)} />
      <div
        className={cn(
          'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg',
          className
        )}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onValueChange,
              setOpen,
            });
          }
          return child;
        })}
      </div>
    </>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  setOpen?: (open: boolean) => void;
}

export function SelectItem({
  value,
  children,
  onValueChange,
  setOpen,
}: SelectItemProps) {
  return (
    <div
      onClick={() => {
        onValueChange?.(value);
        setOpen?.(false);
      }}
      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
    >
      {children}
    </div>
  );
}
