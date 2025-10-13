'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            open,
            setOpen,
          });
        }
        return child;
      })}
    </div>
  );
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function DropdownMenuTrigger({
  asChild,
  children,
  open,
  setOpen,
}: DropdownMenuTriggerProps) {
  const child = React.Children.only(children) as React.ReactElement;

  if (asChild) {
    return React.cloneElement(child, {
      onClick: () => setOpen?.(!open),
    });
  }

  return (
    <button type="button" onClick={() => setOpen?.(!open)}>
      {children}
    </button>
  );
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function DropdownMenuContent({
  children,
  align = 'start',
  className,
  open,
  setOpen,
}: DropdownMenuContentProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen?.(false)} />
      <div
        className={cn(
          'absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg',
          align === 'end' ? 'right-0' : 'left-0',
          className
        )}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              setOpen,
            });
          }
          return child;
        })}
      </div>
    </>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  setOpen?: (open: boolean) => void;
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  disabled,
  setOpen,
}: DropdownMenuItemProps) {
  return (
    <div
      onClick={() => {
        if (!disabled) {
          onClick?.();
          setOpen?.(false);
        }
      }}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      {children}
    </div>
  );
}
