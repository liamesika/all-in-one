'use client';

import React, { useState, useRef, useEffect } from 'react';
// Temporary fallback to avoid framer-motion SSR issues
// TODO: Re-enable after fixing SSR
// import { motion, AnimatePresence } from 'framer-motion';

// Temporary motion fallback
const motion = {
  div: (props: any) => <div {...props} />,
  button: (props: any) => <button {...props} />,
  span: (props: any) => <span {...props} />,
} as any;

const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;
import { MessageCircle, X, Send, Bot, User, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { Button, Input, Card, CardContent, CardHeader, Badge } from '../ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: BotToolCall[];
  toolResults?: BotToolResult[];
  suggestions?: QuickAction[];
  isTyping?: boolean;
}

interface BotToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
}

interface BotToolResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  toolCall: BotToolCall;
}

interface QuickAction {
  text: string;
  action: string;
  params?: Record<string, any>;
  variant?: 'default' | 'destructive' | 'outline';
}

interface AiChatWidgetProps {
  ownerUid: string;
  organizationId?: string;
  className?: string;
}

const CHAT_TRANSLATIONS = {
  he: {
    chatTitle: 'מאמן אישי AI',
    welcomeMessage: 'שלום! איך אני יכול לעזור לך היום?',
    typePlaceholder: 'כתוב הודעה...',
    send: 'שלח',
    quickActions: 'פעולות מהירות',
    confirmAction: 'אשר פעולה',
    cancel: 'בטל',
    confirm: 'אשר',
    actionCompleted: 'הפעולה הושלמה בהצלחה',
    actionFailed: 'הפעולה נכשלה',
    tryAgain: 'נסה שוב',
    connecting: 'מתחבר...',
    offline: 'לא מקוון',
    errorMessage: 'משהו השתבש. אנא נסה שוב.',
    minimizeChat: 'מזער צ׳אט',
    expandChat: 'הרחב צ׳אט',
  },
  en: {
    chatTitle: 'AI Personal Coach',
    welcomeMessage: 'Hello! How can I help you today?',
    typePlaceholder: 'Type a message...',
    send: 'Send',
    quickActions: 'Quick Actions',
    confirmAction: 'Confirm Action',
    cancel: 'Cancel',
    confirm: 'Confirm',
    actionCompleted: 'Action completed successfully',
    actionFailed: 'Action failed',
    tryAgain: 'Try Again',
    connecting: 'Connecting...',
    offline: 'Offline',
    errorMessage: 'Something went wrong. Please try again.',
    minimizeChat: 'Minimize Chat',
    expandChat: 'Expand Chat',
  },
};

export default function AiChatWidget({ ownerUid, organizationId, className }: AiChatWidgetProps) {
  const { language } = useLanguage();
  const dir = language === 'he' ? 'rtl' : 'ltr';
  const t = CHAT_TRANSLATIONS[language];

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('online');
  const [pendingAction, setPendingAction] = useState<QuickAction | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen, ownerUid]);

  const loadChatHistory = async () => {
    if (!ownerUid) {
      console.warn('Cannot load chat: ownerUid is required');
      setConnectionStatus('offline');
      return;
    }

    try {
      setConnectionStatus('connecting');

      // Generate session ID if not exists
      if (!sessionId) {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
      }

      // Load welcome message
      const response = await fetch('/api/ai-coach/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': ownerUid,
        },
        body: JSON.stringify({
          organizationId: ownerUid,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const welcomeResponse = await response.json();

      const welcomeMessage: ChatMessage = {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: welcomeResponse.message,
        timestamp: new Date().toISOString(),
        toolCalls: welcomeResponse.toolCalls,
        toolResults: welcomeResponse.toolResults,
        suggestions: welcomeResponse.suggestions,
      };

      setMessages([welcomeMessage]);
      setConnectionStatus('online');
    } catch (error) {
      console.error('Failed to load chat:', error);
      setConnectionStatus('offline');

      // Fallback welcome message
      const fallbackMessage: ChatMessage = {
        id: `fallback_${Date.now()}`,
        role: 'assistant',
        content: t.welcomeMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages([fallbackMessage]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: `typing_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isTyping: true,
    };

    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': ownerUid,
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const botResponse = await response.json();

      // Remove typing indicator and add real response
      setMessages(prev => {
        const withoutTyping = prev.filter(m => !m.isTyping);

        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: botResponse.message,
          timestamp: new Date().toISOString(),
          toolCalls: botResponse.toolCalls,
          toolResults: botResponse.toolResults,
          suggestions: botResponse.suggestions,
        };

        return [...withoutTyping, assistantMessage];
      });

      setConnectionStatus('online');
    } catch (error) {
      console.error('Failed to send message:', error);
      setConnectionStatus('offline');

      // Remove typing indicator and add error message
      setMessages(prev => {
        const withoutTyping = prev.filter(m => !m.isTyping);

        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: t.errorMessage,
          timestamp: new Date().toISOString(),
        };

        return [...withoutTyping, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuickAction = async (action: QuickAction) => {
    setPendingAction(action);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/ai-coach/tools/${pendingAction.action}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': ownerUid,
        },
        body: JSON.stringify({
          parameters: pendingAction.params || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      // Add result message
      const resultMessage: ChatMessage = {
        id: `result_${Date.now()}`,
        role: 'assistant',
        content: result.success ? result.message : `${t.actionFailed}: ${result.error || result.message}`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, resultMessage]);
      setPendingAction(null);

    } catch (error) {
      console.error('Failed to execute action:', error);

      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `${t.actionFailed}: ${t.errorMessage}`,
        timestamp: new Date().toISOString(),
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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString(language === 'he' ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    const isRTL = dir === 'rtl';

    return (
      <div
        key={message.id}
        className={`flex ${isRTL ? (isUser ? 'justify-start' : 'justify-end') : (isUser ? 'justify-end' : 'justify-start')} mb-4`}
      >
        <div className={`flex max-w-[80%] ${isRTL ? (isUser ? 'flex-row' : 'flex-row-reverse') : (isUser ? 'flex-row-reverse' : 'flex-row')} gap-2`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-gray-500'}`}>
            {isUser ? (
              <User size={16} className="text-white" />
            ) : (
              <Bot size={16} className="text-white" />
            )}
          </div>

          <div className={`flex flex-col ${isRTL ? (isUser ? 'items-start' : 'items-end') : (isUser ? 'items-end' : 'items-start')}`}>
            <div
              className={`px-4 py-2 rounded-lg ${
                isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
              } ${isRTL ? 'text-right' : 'text-left'}`}
              dir={dir}
            >
              {message.isTyping ? (
                <div className="flex items-center gap-1">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">{t.connecting}</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>

            <div className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {formatTimestamp(message.timestamp)}
            </div>

            {/* Tool Results */}
            {message.toolResults && message.toolResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.toolResults.map((result, index) => (
                  <div key={index} className={`flex items-center gap-2 text-xs ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    {result.success ? (
                      <CheckCircle size={12} className="text-green-500" />
                    ) : (
                      <XCircle size={12} className="text-red-500" />
                    )}
                    <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.message}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.quickActions}
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant={suggestion.variant || 'outline'}
                      size="sm"
                      onClick={() => executeQuickAction(suggestion)}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      {suggestion.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="ai-chat-toggle"
        className={`fixed bottom-4 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${
          dir === 'rtl' ? 'left-4' : 'right-4'
        } w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 z-50`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        title={t.chatTitle}
      >
        <MessageCircle size={24} />
        {connectionStatus === 'offline' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        )}
      </motion.button>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed bottom-4 ${
              dir === 'rtl' ? 'left-4' : 'right-4'
            } w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 ${className}`}
            dir={dir}
          >
            {/* Header */}
            <CardHeader className={`flex flex-row items-center justify-between py-3 px-4 border-b border-gray-200 dark:border-gray-700 ${
              dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                <Bot size={20} className="text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t.chatTitle}</h3>
                <Badge variant={connectionStatus === 'online' ? 'default' : 'destructive'} className="text-xs">
                  {connectionStatus === 'online' ? '●' : connectionStatus === 'connecting' ? '...' : '○'}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
                title={t.minimizeChat}
              >
                <X size={16} />
              </Button>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className={`flex gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.typePlaceholder}
                  disabled={isLoading || connectionStatus !== 'online'}
                  className={`flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                  dir={dir}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading || connectionStatus !== 'online'}
                  size="sm"
                  className="px-3"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {pendingAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setPendingAction(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4"
              dir={dir}
            >
              <h3 className={`text-lg font-semibold mb-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {t.confirmAction}
              </h3>
              <p className={`text-gray-600 dark:text-gray-400 mb-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {pendingAction.text}
              </p>
              <div className={`flex gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                <Button
                  onClick={confirmAction}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : t.confirm}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPendingAction(null)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}