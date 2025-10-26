'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layout,
  ChevronRight,
  Save,
  Download,
  GripVertical,
  Plus,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  UniversalCard,
  CardHeader,
  CardBody,
  UniversalButton,
} from '@/components/shared';
import { RealEstateHeader } from '@/components/dashboard/RealEstateHeader';
import { useLang } from '@/components/i18n/LangProvider';
import { auth } from '@/lib/firebase';

interface LayoutSection {
  id: string;
  type: string;
  name: string;
  settings: Record<string, any>;
  order: number;
}

interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  sections: LayoutSection[];
}

const PRESETS: LayoutPreset[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean and minimal homepage with focus on products',
    sections: [
      { id: 's1', type: 'hero', name: 'Hero Banner', settings: { height: 'tall' }, order: 0 },
      { id: 's2', type: 'featured', name: 'Featured Products', settings: { columns: 4 }, order: 1 },
      { id: 's3', type: 'collections', name: 'Collections Grid', settings: { layout: 'grid' }, order: 2 },
      { id: 's4', type: 'testimonials', name: 'Testimonials', settings: { style: 'cards' }, order: 3 },
    ],
  },
  {
    id: 'bold-promotional',
    name: 'Bold Promotional',
    description: 'Eye-catching design perfect for sales and promotions',
    sections: [
      { id: 's1', type: 'announcement', name: 'Announcement Bar', settings: { sticky: true }, order: 0 },
      { id: 's2', type: 'hero', name: 'Full-Width Hero', settings: { height: 'full' }, order: 1 },
      { id: 's3', type: 'countdown', name: 'Sale Countdown', settings: {}, order: 2 },
      { id: 's4', type: 'featured', name: 'Hot Deals', settings: { columns: 3 }, order: 3 },
      { id: 's5', type: 'cta', name: 'Call to Action', settings: { style: 'split' }, order: 4 },
    ],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Content-rich layout for storytelling and brand building',
    sections: [
      { id: 's1', type: 'hero', name: 'Hero with Text', settings: { overlay: true }, order: 0 },
      { id: 's2', type: 'about', name: 'About Section', settings: { layout: 'side-by-side' }, order: 1 },
      { id: 's3', type: 'blog', name: 'Blog Posts', settings: { count: 3 }, order: 2 },
      { id: 's4', type: 'featured', name: 'Featured Products', settings: { columns: 4 }, order: 3 },
      { id: 's5', type: 'instagram', name: 'Instagram Feed', settings: { count: 6 }, order: 4 },
    ],
  },
];

export function LayoutBlueprintClient() {
  const router = useRouter();
  const { lang } = useLang();

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [sections, setSections] = useState<LayoutSection[]>([]);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/ecommerce/layout', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.layout && data.layout.sections) {
            setSections(data.layout.sections);
            setSelectedPreset(data.layout.presetId || null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch layout:', error);
      }
    };

    fetchLayout();
  }, []);

  const handleLoadPreset = (preset: LayoutPreset) => {
    setSections(preset.sections);
    setSelectedPreset(preset.id);
  };

  const handleSaveLayout = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/ecommerce/layout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presetId: selectedPreset,
          sections,
        }),
      });

      if (response.ok) {
        console.log('Layout saved successfully');
      }
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  };

  const handleExportJSON = () => {
    const data = {
      presetId: selectedPreset,
      sections,
      exportedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-blueprint-${Date.now()}.json`;
    a.click();
  };

  const handleDragStart = (sectionId: string) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedSection || draggedSection === targetId) return;

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex(s => s.id === draggedSection);
    const targetIndex = newSections.findIndex(s => s.id === targetId);

    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);

    // Update order
    newSections.forEach((section, index) => {
      section.order = index;
    });

    setSections(newSections);
    setDraggedSection(null);
  };

  const handleDeleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })));
  };

  const getSectionIcon = (type: string) => {
    const icons: Record<string, string> = {
      hero: '🎨',
      featured: '⭐',
      collections: '📁',
      testimonials: '💬',
      announcement: '📢',
      countdown: '⏰',
      cta: '🎯',
      about: '👥',
      blog: '📝',
      instagram: '📸',
    };
    return icons[type] || '📦';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      <RealEstateHeader />

      <div className="pt-20 pb-16 max-w-full mx-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2979FF] mb-4 transition-colors"
          >
            <ChevronRight className={`w-5 h-5 ${lang === 'he' ? '' : 'rotate-180'}`} />
            <span>{lang === 'he' ? 'חזרה' : 'Back'}</span>
          </button>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Layout className="w-8 h-8 text-[#2979FF]" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {lang === 'he' ? 'תכנון עיצוב' : 'Layout Blueprint'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {lang === 'he'
                    ? 'עצב את דף הבית של החנות שלך'
                    : 'Design your store homepage layout'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <UniversalButton
                onClick={() => setPreviewMode(!previewMode)}
                variant="secondary"
                size="sm"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? (lang === 'he' ? 'עריכה' : 'Edit') : lang === 'he' ? 'תצוגה מקדימה' : 'Preview'}
              </UniversalButton>
              <UniversalButton onClick={handleSaveLayout} variant="secondary">
                <Save className="w-4 h-4" />
                {lang === 'he' ? 'שמור' : 'Save'}
              </UniversalButton>
              <UniversalButton onClick={handleExportJSON} variant="secondary">
                <Download className="w-4 h-4" />
                JSON
              </UniversalButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Panel - Presets */}
            <div className="lg:col-span-1">
              <UniversalCard variant="elevated" className="sticky top-24">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {lang === 'he' ? 'תבניות' : 'Presets'}
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handleLoadPreset(preset)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedPreset === preset.id
                            ? 'border-[#2979FF] bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {preset.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {preset.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {preset.sections.length}{' '}
                          {lang === 'he' ? 'חלקים' : 'sections'}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardBody>
              </UniversalCard>
            </div>

            {/* Right Panel - Layout Builder */}
            <div className="lg:col-span-3">
              {previewMode ? (
                <UniversalCard variant="elevated">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lang === 'he' ? 'תצוגה מקדימה' : 'Preview'}
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {sections.map(section => (
                        <div
                          key={section.id}
                          className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center"
                        >
                          <div className="text-4xl mb-2">{getSectionIcon(section.type)}</div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {section.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {section.type}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </UniversalCard>
              ) : (
                <UniversalCard variant="elevated">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {lang === 'he' ? 'סידור חלקים' : 'Section Order'}
                      </h3>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {lang === 'he'
                          ? 'גרור ושחרר לשינוי סדר'
                          : 'Drag and drop to reorder'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {sections.length === 0 ? (
                      <div className="text-center py-12">
                        <Layout className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {lang === 'he' ? 'אין חלקים עדיין' : 'No sections yet'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {lang === 'he'
                            ? 'בחר תבנית כדי להתחיל'
                            : 'Select a preset to get started'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sections
                          .sort((a, b) => a.order - b.order)
                          .map((section, index) => (
                            <div
                              key={section.id}
                              draggable
                              onDragStart={() => handleDragStart(section.id)}
                              onDragOver={handleDragOver}
                              onDrop={() => handleDrop(section.id)}
                              className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-move"
                            >
                              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-2xl">{getSectionIcon(section.type)}</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      #{index + 1}
                                    </span>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {section.name}
                                    </h4>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {section.type}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteSection(section.id)}
                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardBody>
                </UniversalCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
