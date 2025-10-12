'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAdvisorBotProps {
  pageContext: {
    page: 'dashboard' | 'leads' | 'properties' | 'property-detail' | 'lead-detail' | 'ad-generator' | 'comps' | 'open-house' | 'marketing';
    data?: any;
  };
}

export function AIAdvisorBot({ pageContext }: AIAdvisorBotProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('ai-advisor-state');
    if (savedState) {
      try {
        const { isOpen: savedIsOpen, messages: savedMessages } = JSON.parse(savedState);
        setIsOpen(savedIsOpen);
        if (savedMessages && Array.isArray(savedMessages)) {
          setMessages(savedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      } catch (error) {
        console.error('Failed to restore AI Advisor state:', error);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (messages.length > 0 || isOpen) {
      localStorage.setItem('ai-advisor-state', JSON.stringify({
        isOpen,
        messages
      }));
    }
  }, [isOpen, messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting based on page context
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const greeting = getContextualGreeting();
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, pageContext.page]);

  const getContextualGreeting = () => {
    const greetings: Record<string, string> = {
      'dashboard': language === 'he'
        ? 'שלום! אני היועץ הנדל"ני שלך. אני רואה שיש לך 45 לידים חדשים השבוע. האם תרצה שאני אעזור לך לתעדף אותם או להציע פעולות הבאות?'
        : 'Hi! I\'m your Real Estate Advisor. I see you have 45 new leads this week. Would you like me to help prioritize them or suggest next actions?',
      'leads': language === 'he'
        ? 'שלום! נראה שאתה בדף הלידים. אני יכול לעזור לך לנתח, לסנן או לתת המלצות איך לטפל בלידים החמים ביותר.'
        : 'Hi! I see you\'re on the Leads page. I can help you analyze, filter, or recommend how to handle your hottest leads.',
      'properties': language === 'he'
        ? 'שלום! אני כאן לעזור עם הנכסים שלך. רוצה שאציע אילו נכסים לקדם, איך לשפר מודעות, או להשוות מחירים?'
        : 'Hi! I\'m here to help with your properties. Want me to suggest which properties to promote, how to improve ads, or compare prices?',
      'property-detail': language === 'he'
        ? 'שלום! אני רואה שאתה צופה בנכס ספציפי. אני יכול לעזור עם ניתוח שוק, הצעות מחיר, או יצירת חומרי שיווק.'
        : 'Hi! I see you\'re viewing a specific property. I can help with market analysis, pricing suggestions, or creating marketing materials.',
      'ad-generator': language === 'he'
        ? 'שלום! אני מומחה במודעות נדל"ן. אעזור לך ליצור תיאורים מושכים, לבחור תמונות, ולהציע מחירים אטרקטיביים.'
        : 'Hi! I\'m an expert in real estate ads. I\'ll help you create compelling descriptions, choose photos, and suggest attractive prices.',
      'comps': language === 'he'
        ? 'שלום! בוא נעשה ניתוח השוואת מחירים. אני אעזור לך להבין טרנדים, למצוא עסקאות דומות ולתמחר נכון.'
        : 'Hi! Let\'s do a price comparison analysis. I\'ll help you understand trends, find similar deals, and price correctly.',
      'open-house': language === 'he'
        ? 'שלום! אני אעזור לך לתכנן ולנהל את האירוע שלך בצורה מקצועית. מוכן להתחיל?'
        : 'Hi! I\'ll help you plan and manage your open house professionally. Ready to get started?',
      'marketing': language === 'he'
        ? 'שלום! בוא ניצור קמפיין שיווקי מנצח. אני אעזור עם העתקות, תמונות, וטרגוטינג.'
        : 'Hi! Let\'s create a winning marketing campaign. I\'ll help with copy, images, and targeting.'
    };

    return greetings[pageContext.page] || greetings['dashboard'];
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call server-side API route that handles OpenAI
      const response = await fetch('/api/real-estate/ai-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: pageContext,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Advisor error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'he'
          ? 'סליחה, נתקלתי בבעיה. אנא נסה שוב.'
          : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        aria-label={language === 'he' ? 'פתח יועץ AI' : 'Open AI Advisor'}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {language === 'he' ? 'יועץ נדל"ן AI' : 'Real Estate AI Advisor'}
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized
          ? 'bottom-6 right-6 w-80 h-16'
          : 'bottom-6 right-6 w-96 h-[600px]'
      } ${language === 'he' ? 'rtl' : 'ltr'}`}
      style={{ maxHeight: 'calc(100vh - 100px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold text-sm">
            {language === 'he' ? 'יועץ נדל"ן AI' : 'Real Estate AI Advisor'}
          </h3>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-blue-500 p-1 rounded transition-colors"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-500 p-1 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(600px-120px)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'he' ? 'שאל אותי משהו...' : 'Ask me anything...'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
