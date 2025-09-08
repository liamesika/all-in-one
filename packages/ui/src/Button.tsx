import * as React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string };

export function Button({ label, className = '', ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 focus:outline-none focus:ring ${className}`}
      {...rest}
    >
      {label || rest.children}
    </button>
  );
}
