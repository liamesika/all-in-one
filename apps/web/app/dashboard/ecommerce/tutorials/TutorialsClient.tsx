'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Play,
  ExternalLink,
  BookOpen,
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

interface TutorialStep {
  index: number;
  title: string;
  completed: boolean;
  timestamp?: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  imageUrl?: string;
  externalLinks?: Array<{ label: string; url: string }>;
  stepIndex: number;
  totalSteps: number;
  completed: boolean;
  steps: TutorialStep[];
}

const TUTORIALS_DATA = [
  {
    id: 'account-setup',
    titleEn: 'Create Your Shopify Account',
    titleHe: 'יצירת חשבון Shopify',
    descriptionEn: 'Learn how to sign up and set up your Shopify store',
    descriptionHe: 'למד כיצד להירשם ולהגדיר את חנות ה-Shopify שלך',
    videoUrl: 'https://www.youtube.com/embed/example1',
    steps: [
      { en: 'Visit Shopify.com and click "Start free trial"', he: 'היכנס ל-Shopify.com ולחץ על "התחל תקופת ניסיון"' },
      { en: 'Enter your email address', he: 'הזן את כתובת האימייל שלך' },
      { en: 'Create a strong password', he: 'צור סיסמה חזקה' },
      { en: 'Choose your store name', he: 'בחר שם לחנות' },
      { en: 'Complete the initial setup wizard', he: 'השלם את אשף ההתקנה הראשוני' },
    ],
    externalLinks: [
      { labelEn: 'Shopify Signup', labelHe: 'הרשמה ל-Shopify', url: 'https://www.shopify.com/free-trial' },
    ],
  },
  {
    id: 'store-settings',
    titleEn: 'Configure Store Settings',
    titleHe: 'הגדרת הגדרות החנות',
    descriptionEn: 'Set up your store details, currency, and shipping',
    descriptionHe: 'הגדר את פרטי החנות, מטבע ומשלוחים',
    steps: [
      { en: 'Navigate to Settings > General', he: 'נווט להגדרות > כללי' },
      { en: 'Add store address and contact information', he: 'הוסף כתובת חנות ופרטי קשר' },
      { en: 'Set your currency and timezone', he: 'הגדר מטבע ואזור זמן' },
      { en: 'Configure tax settings', he: 'הגדר הגדרות מס' },
      { en: 'Set up payment providers', he: 'הגדר ספקי תשלום' },
    ],
    externalLinks: [
      { labelEn: 'Shopify Settings Guide', labelHe: 'מדריך הגדרות Shopify', url: 'https://help.shopify.com/manual/intro-to-shopify/initial-setup' },
    ],
  },
  {
    id: 'adding-products',
    titleEn: 'Adding Your First Products',
    titleHe: 'הוספת המוצרים הראשונים',
    descriptionEn: 'Learn how to add products with descriptions and images',
    descriptionHe: 'למד כיצד להוסיף מוצרים עם תיאורים ותמונות',
    videoUrl: 'https://www.youtube.com/embed/example2',
    steps: [
      { en: 'Go to Products > Add product', he: 'עבור למוצרים > הוסף מוצר' },
      { en: 'Enter product title and description', he: 'הזן כותרת ותיאור מוצר' },
      { en: 'Upload product images (recommended: 2048x2048px)', he: 'העלה תמונות מוצר (מומלץ: 2048x2048px)' },
      { en: 'Set price and compare-at price', he: 'הגדר מחיר ומחיר להשוואה' },
      { en: 'Add inventory quantity', he: 'הוסף כמות במלאי' },
      { en: 'Save and publish', he: 'שמור ופרסם' },
    ],
  },
  {
    id: 'collections',
    titleEn: 'Organizing with Collections',
    titleHe: 'ארגון עם קולקציות',
    descriptionEn: 'Create collections to categorize your products',
    descriptionHe: 'צור קולקציות כדי לסווג את המוצרים שלך',
    steps: [
      { en: 'Navigate to Products > Collections', he: 'נווט למוצרים > קולקציות' },
      { en: 'Click "Create collection"', he: 'לחץ על "צור קולקציה"' },
      { en: 'Choose manual or automated collection', he: 'בחר קולקציה ידנית או אוטומטית' },
      { en: 'Set collection conditions or add products manually', he: 'הגדר תנאי קולקציה או הוסף מוצרים ידנית' },
      { en: 'Add collection image and description', he: 'הוסף תמונה ותיאור לקולקציה' },
    ],
  },
  {
    id: 'theme-setup',
    titleEn: 'Choosing and Customizing Your Theme',
    titleHe: 'בחירה והתאמה אישית של ערכת העיצוב',
    descriptionEn: 'Select a theme and customize your store design',
    descriptionHe: 'בחר ערכת עיצוב והתאם אישית את עיצוב החנות',
    steps: [
      { en: 'Go to Online Store > Themes', he: 'עבור לחנות מקוונת > ערכות עיצוב' },
      { en: 'Browse free and paid themes', he: 'עיין בערכות עיצוב חינמיות ובתשלום' },
      { en: 'Click "Customize" on your active theme', he: 'לחץ על "התאם אישית" בערכת העיצוב הפעילה' },
      { en: 'Edit colors, fonts, and layout', he: 'ערוך צבעים, גופנים ופריסה' },
      { en: 'Add your logo and brand colors', he: 'הוסף לוגו וצבעי מותג' },
      { en: 'Preview and save changes', he: 'תצוגה מקדימה ושמור שינויים' },
    ],
    externalLinks: [
      { labelEn: 'Shopify Theme Store', labelHe: 'חנות ערכות עיצוב Shopify', url: 'https://themes.shopify.com/' },
    ],
  },
  {
    id: 'niche-selection',
    titleEn: 'Selecting Your Niche',
    titleHe: 'בחירת הנישה שלך',
    descriptionEn: 'Find a profitable niche for your store',
    descriptionHe: 'מצא נישה רווחית לחנות שלך',
    steps: [
      { en: 'Research market trends and demand', he: 'חקור מגמות שוק וביקוש' },
      { en: 'Identify target audience pain points', he: 'זהה נקודות כאב של קהל היעד' },
      { en: 'Analyze competition level', he: 'נתח רמת תחרות' },
      { en: 'Validate niche profitability', he: 'אמת רווחיות נישה' },
      { en: 'Choose products that solve problems', he: 'בחר מוצרים שפותרים בעיות' },
    ],
  },
  {
    id: 'product-photos',
    titleEn: 'Product Photography Best Practices',
    titleHe: 'שיטות עבודה מומלצות לצילום מוצרים',
    descriptionEn: 'Learn how to take and optimize product photos',
    descriptionHe: 'למד כיצד לצלם ולמטב תמונות מוצר',
    videoUrl: 'https://www.youtube.com/embed/example3',
    steps: [
      { en: 'Use natural lighting or softbox', he: 'השתמש בתאורה טבעית או בסופטבוקס' },
      { en: 'Shoot from multiple angles (at least 5)', he: 'צלם ממספר זוויות (לפחות 5)' },
      { en: 'Use plain white or neutral background', he: 'השתמש ברקע לבן רגיל או נייטרלי' },
      { en: 'Show scale with props or lifestyle shots', he: 'הצג קנה מידה עם אביזרים או צילומי סגנון חיים' },
      { en: 'Edit and compress images before upload', he: 'ערוך ודחוס תמונות לפני העלאה' },
    ],
  },
  {
    id: 'image-compression',
    titleEn: 'Compressing Images for Web',
    titleHe: 'דחיסת תמונות לאינטרנט',
    descriptionEn: 'Optimize images for fast loading times',
    descriptionHe: 'מטב תמונות לזמני טעינה מהירים',
    steps: [
      { en: 'Use tools like TinyPNG or Squoosh', he: 'השתמש בכלים כמו TinyPNG או Squoosh' },
      { en: 'Target 200KB or less per image', he: 'כוון ל-200KB או פחות לכל תמונה' },
      { en: 'Convert to WebP format when possible', he: 'המר לפורמט WebP כשאפשר' },
      { en: 'Maintain aspect ratio during resize', he: 'שמור על יחס גובה-רוחב במהלך שינוי גודל' },
      { en: 'Test loading speed after upload', he: 'בדוק מהירות טעינה לאחר העלאה' },
    ],
    externalLinks: [
      { labelEn: 'TinyPNG', labelHe: 'TinyPNG', url: 'https://tinypng.com/' },
      { labelEn: 'Squoosh', labelHe: 'Squoosh', url: 'https://squoosh.app/' },
    ],
  },
  {
    id: 'homepage-layout',
    titleEn: 'Designing Your Homepage Layout',
    titleHe: 'עיצוב פריסת דף הבית',
    descriptionEn: 'Structure your homepage for maximum conversions',
    descriptionHe: 'בנה את דף הבית למקסימום המרות',
    steps: [
      { en: 'Add hero banner with clear value proposition', he: 'הוסף באנר גיבור עם הצעת ערך ברורה' },
      { en: 'Feature bestselling products', he: 'הצג מוצרים רבי מכר' },
      { en: 'Include trust badges and testimonials', he: 'כלול תגי אמון וחוות דעת' },
      { en: 'Add collection highlights', he: 'הוסף הדגשות קולקציה' },
      { en: 'Place clear call-to-action buttons', he: 'מקם כפתורי קריאה לפעולה ברורים' },
      { en: 'End with email signup or special offer', he: 'סיים בהרשמה לאימייל או הצעה מיוחדת' },
    ],
  },
  {
    id: 'navigation-menus',
    titleEn: 'Setting Up Navigation Menus',
    titleHe: 'הגדרת תפריטי ניווט',
    descriptionEn: 'Create intuitive navigation for your store',
    descriptionHe: 'צור ניווט אינטואיטיבי לחנות שלך',
    steps: [
      { en: 'Go to Online Store > Navigation', he: 'עבור לחנות מקוונת > ניווט' },
      { en: 'Edit main menu and add collections', he: 'ערוך תפריט ראשי והוסף קולקציות' },
      { en: 'Create nested submenus (max 2 levels)', he: 'צור תפריטי משנה מקוננים (מקסימום 2 רמות)' },
      { en: 'Add important pages (About, Contact, FAQ)', he: 'הוסף דפים חשובים (אודות, צור קשר, שאלות נפוצות)' },
      { en: 'Test menu on mobile devices', he: 'בדוק תפריט במכשירים ניידים' },
    ],
  },
];

export function TutorialsClient() {
  const router = useRouter();
  const { lang } = useLang();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/ecommerce/tutorials', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTutorials(data.tutorials);
        } else {
          // Initialize with defaults
          const initialTutorials = TUTORIALS_DATA.map(t => ({
            id: t.id,
            title: lang === 'he' ? t.titleHe : t.titleEn,
            description: lang === 'he' ? t.descriptionHe : t.descriptionEn,
            videoUrl: t.videoUrl,
            imageUrl: t.imageUrl,
            externalLinks: t.externalLinks?.map(l => ({
              label: lang === 'he' ? l.labelHe : l.labelEn,
              url: l.url,
            })),
            stepIndex: 0,
            totalSteps: t.steps.length,
            completed: false,
            steps: t.steps.map((s, i) => ({
              index: i,
              title: lang === 'he' ? s.he : s.en,
              completed: false,
            })),
          }));
          setTutorials(initialTutorials);
        }
      } catch (error) {
        console.error('Failed to fetch tutorials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, [lang]);

  const handleToggleStep = async (tutorialId: string, stepIndex: number) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/ecommerce/tutorials/progress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutorialId,
          stepIndex,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTutorials(prev =>
          prev.map(t =>
            t.id === tutorialId
              ? {
                  ...t,
                  stepIndex: data.stepIndex,
                  completed: data.completed,
                  steps: t.steps.map((s, i) => ({
                    ...s,
                    completed: i <= stepIndex,
                  })),
                }
              : t
          )
        );
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const completedCount = tutorials.filter(t => t.completed).length;
  const progressPercent = tutorials.length > 0 ? Math.round((completedCount / tutorials.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1A2B]">
      <RealEstateHeader />

      <div className="pt-20 pb-16 max-w-full mx-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#2979FF] mb-4 transition-colors"
            >
              <ChevronRight className={`w-5 h-5 ${lang === 'he' ? '' : 'rotate-180'}`} />
              <span>{lang === 'he' ? 'חזרה' : 'Back'}</span>
            </button>

            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-8 h-8 text-[#2979FF]" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {lang === 'he' ? 'הדרכות Shopify' : 'Shopify Tutorials'}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {lang === 'he'
                ? 'מדריכים שלב אחר שלב לבניית חנות מצליחה'
                : 'Step-by-step guides to building a successful store'}
            </p>
          </div>

          {/* Progress Overview */}
          <UniversalCard variant="elevated" className="mb-8">
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {lang === 'he' ? 'התקדמות כוללת' : 'Overall Progress'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {completedCount} / {tutorials.length} {lang === 'he' ? 'הושלמו' : 'completed'}
                  </p>
                </div>
                <div className="text-3xl font-bold text-[#2979FF]">{progressPercent}%</div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-[#2979FF] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardBody>
          </UniversalCard>

          {/* Tutorials List */}
          <div className="space-y-4">
            {tutorials.map((tutorial) => (
              <UniversalCard
                key={tutorial.id}
                variant="elevated"
                className="transition-all duration-300 hover:shadow-lg"
              >
                <CardBody>
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === tutorial.id ? null : tutorial.id)}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`mt-1 ${tutorial.completed ? 'text-green-500' : 'text-gray-400'}`}>
                        {tutorial.completed ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {tutorial.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {tutorial.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            {tutorial.stepIndex + 1} / {tutorial.totalSteps} {lang === 'he' ? 'שלבים' : 'steps'}
                          </span>
                          {tutorial.videoUrl && (
                            <span className="flex items-center gap-1 text-[#2979FF]">
                              <Play className="w-4 h-4" />
                              {lang === 'he' ? 'וידאו' : 'Video'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedId === tutorial.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {expandedId === tutorial.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      {tutorial.videoUrl && (
                        <div className="mb-6 rounded-lg overflow-hidden aspect-video">
                          <iframe
                            src={tutorial.videoUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}

                      <div className="space-y-3 mb-6">
                        {tutorial.steps.map((step) => (
                          <div
                            key={step.index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={() => handleToggleStep(tutorial.id, step.index)}
                          >
                            <div className={`mt-0.5 ${step.completed ? 'text-green-500' : 'text-gray-400'}`}>
                              {step.completed ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-sm ${
                                  step.completed
                                    ? 'text-gray-500 line-through'
                                    : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                {step.title}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {tutorial.externalLinks && tutorial.externalLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tutorial.externalLinks.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2979FF] text-white rounded-lg hover:bg-[#1d66d9] transition-colors text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </UniversalCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
