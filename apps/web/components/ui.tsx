'use client';
// components/ui.tsx
export const Card = ({className='', ...p}: any) =>
  <div className={`rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] ${className}`} {...p} />;

export const Button = ({ href, children, className='', ...props }: any) =>
  href
    ? <a href={href} className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium bg-white text-black hover:opacity-90 ${className}`}>{children}</a>
    : <button className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium bg-white text-black hover:opacity-90 ${className}`} {...props}>{children}</button>;

export const SubtleButton = ({href, children, className='', ...props}: any) =>
  href
    ? <a href={href} className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm border border-white/15 hover:bg-white/5 ${className}`}>{children}</a>
    : <button className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm border border-white/15 hover:bg-white/5 ${className}`} {...props}>{children}</button>;
