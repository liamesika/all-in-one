import * as React from 'react';

export function Card({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 ${className}`}>{children}</div>;
}
