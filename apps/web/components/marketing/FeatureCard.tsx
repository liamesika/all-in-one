'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}

export function FeatureCard({ icon: Icon, title, description, href }: FeatureCardProps) {
  const CardContent = (
    <>
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors duration-300">
        <Icon size={24} className="text-blue-700 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-base font-normal text-gray-600 leading-relaxed">{description}</p>
      {href && (
        <div className="mt-4 inline-flex items-center text-sm font-semibold text-blue-700 group-hover:text-blue-800">
          Learn more →
        </div>
      )}
    </>
  );

  const baseClasses =
    'group p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1';

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {CardContent}
      </Link>
    );
  }

  return <div className={baseClasses}>{CardContent}</div>;
}
