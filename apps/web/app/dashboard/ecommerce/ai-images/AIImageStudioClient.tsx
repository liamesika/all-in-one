'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wand2,
  ChevronRight,
  Loader2,
  Download,
  Image as ImageIcon,
  Sparkles,
  Grid3x3,
  Settings,
  CheckCircle2,
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

interface ImagePreset {
  id: string;
  labelEn: string;
  labelHe: string;
  promptEn: string;
  promptHe: string;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

const IMAGE_PRESETS: ImagePreset[] = [
  {
    id: 'product-photo',
    labelEn: 'Product Photo',
    labelHe: 'תמונת מוצר',
    promptEn: 'Professional product photography on white background, studio lighting, high quality',
    promptHe: 'צילום מוצר מקצועי על רקע לבן, תאורת סטודיו, איכות גבוהה',
  },
  {
    id: 'lifestyle',
    labelEn: 'Lifestyle Shot',
    labelHe: 'תמונת אורח חיים',
    promptEn: 'Lifestyle product photography, natural setting, warm lighting, authentic feeling',
    promptHe: 'צילום מוצר באווירה יומיומית, תפאורה טבעית, תאורה חמה, תחושה אותנטית',
  },
  {
    id: 'banner',
    labelEn: 'Hero Banner',
    labelHe: 'באנר ראשי',
    promptEn: 'Website hero banner, modern design, eye-catching composition, promotional style',
    promptHe: 'באנר ראשי לאתר, עיצוב מודרני, קומפוזיציה בולטת, סגנון פרסומי',
  },
  {
    id: 'ad-creative',
    labelEn: 'Ad Creative',
    labelHe: 'קריאייטיב פרסומי',
    promptEn: 'Social media ad creative, vibrant colors, attention-grabbing, commercial photography',
    promptHe: 'קריאייטיב פרסומי לרשתות חברתיות, צבעים עזים, מושך תשומת לב, צילום מסחרי',
  },
];

export function AIImageStudioClient() {
  const router = useRouter();
  const { lang } = useLang();
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [batchCount, setBatchCount] = useState(1);
  const [outputFormat, setOutputFormat] = useState<'webp' | 'jpeg'>('webp');
  const [size, setSize] = useState<'1024x1024' | '1024x1792' | '1792x1024'>('1024x1024');
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/ecommerce/ai-images/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data.images);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    fetchHistory();
  }, []);

  const handlePresetSelect = (preset: ImagePreset) => {
    setSelectedPreset(preset.id);
    setCustomPrompt(lang === 'he' ? preset.promptHe : preset.promptEn);
  };

  const handleGenerate = async () => {
    if (!customPrompt) return;

    setGenerating(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/ecommerce/ai-images/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: customPrompt,
          count: batchCount,
          size,
          format: outputFormat,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImages(data.images);
        setHistory(prev => [...data.images, ...prev]);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, imageId: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `ai-image-${imageId}.${outputFormat}`;
    a.click();
  };

  const handleDownloadAll = () => {
    generatedImages.forEach((img, index) => {
      setTimeout(() => {
        handleDownload(img.url, img.id);
      }, index * 200);
    });
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

          <div className="flex items-center gap-3 mb-8">
            <Wand2 className="w-8 h-8 text-[#2979FF]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {lang === 'he' ? 'סטודיו AI לתמונות' : 'AI Image Studio'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {lang === 'he'
                  ? 'צור תמונות מקצועיות עם בינה מלאכותית'
                  : 'Generate professional images with AI'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Settings */}
            <div className="lg:col-span-1">
              <UniversalCard variant="elevated" className="sticky top-24">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#2979FF]" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lang === 'he' ? 'הגדרות' : 'Settings'}
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    {/* Presets */}
                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'תבניות מוכנות' : 'Presets'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {IMAGE_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetSelect(preset)}
                            className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                              selectedPreset === preset.id
                                ? 'border-[#2979FF] bg-blue-50 dark:bg-blue-900/20 text-[#2979FF]'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {lang === 'he' ? preset.labelHe : preset.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Prompt */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'תיאור התמונה' : 'Image Description'}
                      </label>
                      <textarea
                        value={customPrompt}
                        onChange={e => setCustomPrompt(e.target.value)}
                        placeholder={
                          lang === 'he'
                            ? 'תאר את התמונה שתרצה ליצור...'
                            : 'Describe the image you want to create...'
                        }
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      />
                    </div>

                    {/* Batch Count */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'מספר תמונות' : 'Number of Images'}
                      </label>
                      <select
                        value={batchCount}
                        onChange={e => setBatchCount(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={4}>4</option>
                        <option value={8}>8</option>
                      </select>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'גודל' : 'Size'}
                      </label>
                      <select
                        value={size}
                        onChange={e => setSize(e.target.value as any)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="1024x1024">1024x1024 (Square)</option>
                        <option value="1024x1792">1024x1792 (Portrait)</option>
                        <option value="1792x1024">1792x1024 (Landscape)</option>
                      </select>
                    </div>

                    {/* Format */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {lang === 'he' ? 'פורמט' : 'Format'}
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOutputFormat('webp')}
                          className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                            outputFormat === 'webp'
                              ? 'border-[#2979FF] bg-blue-50 dark:bg-blue-900/20 text-[#2979FF]'
                              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          WebP
                        </button>
                        <button
                          onClick={() => setOutputFormat('jpeg')}
                          className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                            outputFormat === 'jpeg'
                              ? 'border-[#2979FF] bg-blue-50 dark:bg-blue-900/20 text-[#2979FF]'
                              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          JPEG
                        </button>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <UniversalButton
                      onClick={handleGenerate}
                      disabled={!customPrompt || generating}
                      className="w-full"
                      size="lg"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {lang === 'he' ? 'מייצר...' : 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {lang === 'he' ? 'צור תמונות' : 'Generate Images'}
                        </>
                      )}
                    </UniversalButton>
                  </div>
                </CardBody>
              </UniversalCard>
            </div>

            {/* Right Panel - Results */}
            <div className="lg:col-span-2">
              {/* Current Generation */}
              {generatedImages.length > 0 && (
                <UniversalCard variant="elevated" className="mb-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {lang === 'he' ? 'תוצאות' : 'Results'}
                        </h3>
                      </div>
                      <UniversalButton onClick={handleDownloadAll} variant="secondary" size="sm">
                        <Download className="w-4 h-4" />
                        {lang === 'he' ? 'הורד הכל' : 'Download All'}
                      </UniversalButton>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {generatedImages.map(image => (
                        <div
                          key={image.id}
                          className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square"
                        >
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <UniversalButton
                              onClick={() => handleDownload(image.url, image.id)}
                              size="sm"
                            >
                              <Download className="w-4 h-4" />
                              {lang === 'he' ? 'הורד' : 'Download'}
                            </UniversalButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </UniversalCard>
              )}

              {/* Empty State */}
              {generatedImages.length === 0 && !generating && (
                <UniversalCard variant="elevated">
                  <CardBody>
                    <div className="text-center py-12">
                      <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {lang === 'he' ? 'אין תמונות עדיין' : 'No images yet'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {lang === 'he'
                          ? 'בחר תבנית או כתוב תיאור וצור תמונות'
                          : 'Select a preset or write a description to generate images'}
                      </p>
                    </div>
                  </CardBody>
                </UniversalCard>
              )}

              {/* History */}
              {history.length > 0 && (
                <UniversalCard variant="elevated" className="mt-8">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Grid3x3 className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {lang === 'he' ? 'היסטוריה' : 'History'}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {history.slice(0, 12).map(image => (
                        <div
                          key={image.id}
                          className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square cursor-pointer"
                          onClick={() => handleDownload(image.url, image.id)}
                        >
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Download className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
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
