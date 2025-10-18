'use client';

import { useLanguage } from '@/lib/language-context';
import { UniversalCard } from '@/components/shared/UniversalCard';
import { User, Briefcase } from 'lucide-react';

const mockTeam = [
  { id: '1', name: 'John Smith', role: 'Partner', activeCases: 12, availability: 'available' },
  { id: '2', name: 'Sarah Johnson', role: 'Associate', activeCases: 8, availability: 'busy' },
  { id: '3', name: 'Michael Brown', role: 'Paralegal', activeCases: 15, availability: 'available' },
];

export default function LawTeamPage() {
  const { language } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {language === 'he' ? 'צוות' : 'Team'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTeam.map((member) => (
          <UniversalCard key={member.id} hoverable>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2979FF]/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#2979FF]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'he' ? 'תיקים פעילים' : 'Active Cases'}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{member.activeCases}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${member.availability === 'available' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{member.availability}</span>
              </div>
            </div>
          </UniversalCard>
        ))}
      </div>
    </div>
  );
}
