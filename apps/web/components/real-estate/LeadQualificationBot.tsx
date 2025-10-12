'use client';

import { useState } from 'react';
import { Bot, Loader2, CheckCircle2, AlertCircle, Flame, Snowflake, Sun } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface LeadQualificationBotProps {
  lead: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    message?: string;
    qualificationStatus?: string;
  };
  onClose?: () => void;
  onQualified?: (qualification: any) => void;
}

interface QualificationResult {
  status: 'HOT' | 'WARM' | 'COLD';
  score: number;
  reasoning: string;
  nextSteps: string[];
  buyerProfile: {
    budget?: string;
    timeline?: string;
    motivation?: string;
    readiness?: string;
  };
}

export function LeadQualificationBot({ lead, onClose, onQualified }: LeadQualificationBotProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState<'initial' | 'questions' | 'processing' | 'result'>('initial');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [qualification, setQualification] = useState<QualificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const questions = [
    {
      id: 'budget',
      question: language === 'he' ? 'מה תקציב הרכישה?' : 'What is your purchase budget?',
      placeholder: language === 'he' ? 'לדוגמה: 2-3 מיליון ש״ח' : 'e.g., $500k-$700k',
    },
    {
      id: 'timeline',
      question: language === 'he' ? 'מתי מתכננים לרכוש?' : 'When are you planning to buy?',
      placeholder: language === 'he' ? 'לדוגמה: תוך 3 חודשים' : 'e.g., Within 3 months',
    },
    {
      id: 'motivation',
      question: language === 'he' ? 'מה מניע את הרכישה?' : 'What motivates this purchase?',
      placeholder: language === 'he' ? 'לדוגמה: משפחה גדלה, השקעה' : 'e.g., Growing family, investment',
    },
    {
      id: 'preapproval',
      question: language === 'he' ? 'האם יש אישור עקרוני למשכנתא?' : 'Do you have mortgage pre-approval?',
      placeholder: language === 'he' ? 'כן/לא/בתהליך' : 'Yes/No/In process',
    },
    {
      id: 'currentSituation',
      question: language === 'he' ? 'מה המצב הנוכחי שלך?' : 'What is your current situation?',
      placeholder: language === 'he' ? 'לדוגמה: שוכר, בעלים מוכר' : 'e.g., Renting, owner selling',
    },
  ];

  const startQualification = () => {
    setStep('questions');
    setCurrentQuestion(0);
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: answer }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      processQualification();
    }
  };

  const processQualification = async () => {
    setStep('processing');
    setError(null);

    try {
      const response = await fetch('/api/real-estate/qualify-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          leadInfo: {
            name: lead.fullName,
            email: lead.email,
            phone: lead.phone,
            initialMessage: lead.message,
          },
          answers,
        }),
      });

      if (!response.ok) throw new Error('Qualification failed');

      const result = await response.json();
      setQualification(result);
      setStep('result');

      if (onQualified) {
        onQualified(result);
      }
    } catch (err) {
      console.error('Qualification error:', err);
      setError(language === 'he' ? 'שגיאה בסיווג ליד' : 'Failed to qualify lead');
      setStep('result');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HOT':
        return <Flame className="w-8 h-8 text-red-500" />;
      case 'WARM':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'COLD':
        return <Snowflake className="w-8 h-8 text-blue-400" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      HOT: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: language === 'he' ? 'ליד חם' : 'Hot Lead',
      },
      WARM: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: language === 'he' ? 'ליד פושר' : 'Warm Lead',
      },
      COLD: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: language === 'he' ? 'ליד קר' : 'Cold Lead',
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.COLD;
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        {getStatusIcon(status)}
        {badge.label}
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {language === 'he' ? 'בוט סיווג לידים' : 'Lead Qualification Bot'}
              </h2>
              <p className="text-sm text-white/80">
                {language === 'he' ? 'AI מסווג את הליד בשבילך' : 'AI classifies your lead for you'}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
        {/* Initial State */}
        {step === 'initial' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-indigo-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {language === 'he' ? 'בוא נסווג את הליד' : "Let's Qualify This Lead"}
            </h3>

            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {language === 'he'
                ? 'AI ישאל 5 שאלות קצרות כדי לסווג את הליד כחם/פושר/קר ולהמליץ על צעדים הבאים'
                : 'AI will ask 5 quick questions to classify the lead as hot/warm/cold and recommend next steps'}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-right">
              <h4 className="font-semibold text-gray-900 mb-2">{lead.fullName}</h4>
              {lead.email && <p className="text-sm text-gray-600">{lead.email}</p>}
              {lead.phone && <p className="text-sm text-gray-600">{lead.phone}</p>}
              {lead.message && (
                <p className="text-sm text-gray-600 mt-2 italic">&quot;{lead.message}&quot;</p>
              )}
            </div>

            <button
              onClick={startQualification}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              {language === 'he' ? 'התחל סיווג' : 'Start Qualification'}
            </button>
          </div>
        )}

        {/* Questions State */}
        {step === 'questions' && (
          <div className="py-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {language === 'he' ? 'התקדמות' : 'Progress'}
                </span>
                <span className="text-sm font-medium text-indigo-600">
                  {currentQuestion + 1} / {questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {questions[currentQuestion].question}
              </h3>
              <textarea
                placeholder={questions[currentQuestion].placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    const value = (e.target as HTMLTextAreaElement).value.trim();
                    if (value) handleAnswer(value);
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              {currentQuestion > 0 && (
                <button
                  onClick={() => setCurrentQuestion(prev => prev - 1)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {language === 'he' ? 'חזרה' : 'Back'}
                </button>
              )}
              <button
                onClick={() => {
                  const textarea = document.querySelector('textarea');
                  const value = textarea?.value.trim();
                  if (value) handleAnswer(value);
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                {currentQuestion === questions.length - 1
                  ? (language === 'he' ? 'סיים וסווג' : 'Finish & Classify')
                  : (language === 'he' ? 'הבא' : 'Next')}
              </button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {step === 'processing' && (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">
              {language === 'he' ? 'AI מנתח את הליד...' : 'AI is analyzing the lead...'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {language === 'he' ? 'זה לוקח בערך 5 שניות' : 'This takes about 5 seconds'}
            </p>
          </div>
        )}

        {/* Result State */}
        {step === 'result' && (
          <div className="py-6">
            {error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {language === 'he' ? 'שגיאה' : 'Error'}
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => setStep('initial')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {language === 'he' ? 'נסה שוב' : 'Try Again'}
                </button>
              </div>
            ) : qualification ? (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === 'he' ? 'סיווג הושלם!' : 'Qualification Complete!'}
                  </h3>
                  <div className="flex justify-center">
                    {getStatusBadge(qualification.status)}
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">
                      {language === 'he' ? 'ציון:' : 'Score:'}{' '}
                      <span className="font-bold text-indigo-600">{qualification.score}/100</span>
                    </span>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {language === 'he' ? 'ניתוח AI:' : 'AI Analysis:'}
                  </h4>
                  <p className="text-gray-700 text-sm">{qualification.reasoning}</p>
                </div>

                {/* Buyer Profile */}
                {qualification.buyerProfile && Object.keys(qualification.buyerProfile).length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {language === 'he' ? 'פרופיל קונה:' : 'Buyer Profile:'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {qualification.buyerProfile.budget && (
                        <div>
                          <span className="text-gray-600">{language === 'he' ? 'תקציב:' : 'Budget:'}</span>
                          <p className="font-medium text-gray-900">{qualification.buyerProfile.budget}</p>
                        </div>
                      )}
                      {qualification.buyerProfile.timeline && (
                        <div>
                          <span className="text-gray-600">{language === 'he' ? 'לוח זמנים:' : 'Timeline:'}</span>
                          <p className="font-medium text-gray-900">{qualification.buyerProfile.timeline}</p>
                        </div>
                      )}
                      {qualification.buyerProfile.motivation && (
                        <div>
                          <span className="text-gray-600">{language === 'he' ? 'מוטיבציה:' : 'Motivation:'}</span>
                          <p className="font-medium text-gray-900">{qualification.buyerProfile.motivation}</p>
                        </div>
                      )}
                      {qualification.buyerProfile.readiness && (
                        <div>
                          <span className="text-gray-600">{language === 'he' ? 'מוכנות:' : 'Readiness:'}</span>
                          <p className="font-medium text-gray-900">{qualification.buyerProfile.readiness}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {language === 'he' ? 'צעדים הבאים מומלצים:' : 'Recommended Next Steps:'}
                  </h4>
                  <ul className="space-y-2">
                    {qualification.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setStep('initial');
                      setAnswers({});
                      setCurrentQuestion(0);
                      setQualification(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    {language === 'he' ? 'סווג מחדש' : 'Re-qualify'}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    {language === 'he' ? 'סיום' : 'Done'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
