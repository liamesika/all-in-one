'use client';

import { useState } from 'react';
import { X, Play, ExternalLink, Circle, Clock, CheckCircle2 } from 'lucide-react';
import { UniversalButton } from '@/components/shared';

interface TutorialStep {
  index: number;
  title: string;
  completed: boolean;
}

interface TutorialData {
  id: string;
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  videoUrl?: string;
  steps: Array<{ en: string; he: string }>;
  externalLinks?: Array<{ labelEn: string; labelHe: string; url: string }>;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface TutorialDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorial: TutorialData;
  onUpdateStatus: (tutorialId: string, status: 'not_started' | 'in_progress' | 'completed') => Promise<void>;
  initialLang?: 'en' | 'he';
}

export function TutorialDocumentModal({
  isOpen,
  onClose,
  tutorial,
  onUpdateStatus,
  initialLang = 'en',
}: TutorialDocumentModalProps) {
  const [lang, setLang] = useState<'en' | 'he'>(initialLang);
  const [updating, setUpdating] = useState(false);

  if (!isOpen) return null;

  const handleUpdateStatus = async (status: 'not_started' | 'in_progress' | 'completed') => {
    setUpdating(true);
    try {
      await onUpdateStatus(tutorial.id, status);
    } finally {
      setUpdating(false);
    }
  };

  const title = lang === 'he' ? tutorial.titleHe : tutorial.titleEn;
  const description = lang === 'he' ? tutorial.descriptionHe : tutorial.descriptionEn;
  const steps = tutorial.steps.map((s) => (lang === 'he' ? s.he : s.en));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>

            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  lang === 'en'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('he')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  lang === 'he'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                HE
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>

          {/* Video */}
          {tutorial.videoUrl && (
            <div className="mb-6 rounded-lg overflow-hidden aspect-video bg-gray-100 dark:bg-gray-900">
              <iframe
                src={tutorial.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Steps */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {lang === 'he' ? 'שלבים' : 'Steps'}
            </h3>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2979FF] text-white flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-gray-900 dark:text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* External Links */}
          {tutorial.externalLinks && tutorial.externalLinks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {lang === 'he' ? 'קישורים שימושיים' : 'Useful Links'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {tutorial.externalLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#2979FF] text-white rounded-lg hover:bg-[#1d66d9] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {lang === 'he' ? link.labelHe : link.labelEn}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Progress Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {lang === 'he' ? 'סמן את מצב ההתקדמות:' : 'Mark progress status:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateStatus('not_started')}
                disabled={updating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  tutorial.status === 'not_started'
                    ? 'border-gray-400 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Circle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {lang === 'he' ? 'לא התחיל' : 'Not Started'}
                </span>
              </button>

              <button
                onClick={() => handleUpdateStatus('in_progress')}
                disabled={updating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  tutorial.status === 'in_progress'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {lang === 'he' ? 'בתהליך' : 'In Progress'}
                </span>
              </button>

              <button
                onClick={() => handleUpdateStatus('completed')}
                disabled={updating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  tutorial.status === 'completed'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-400'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {lang === 'he' ? 'הושלם' : 'Completed'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
