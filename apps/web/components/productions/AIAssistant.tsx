'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  X,
  Send,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Zap,
  Calendar,
  Users,
  FileText
} from 'lucide-react';

interface AISuggestion {
  id: string;
  type: 'optimization' | 'warning' | 'tip' | 'automation';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon: React.ElementType;
  priority: 'high' | 'medium' | 'low';
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: AISuggestion[];
}

interface AIAssistantProps {
  context?: string; // e.g., 'projects', 'tasks', 'reports'
  visible?: boolean;
}

export function AIAssistant({ context = 'general', visible = false }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(visible);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI production assistant. I can help you optimize workflows, suggest automations, and provide insights. What would you like to know?`,
      timestamp: new Date(),
      suggestions: getContextSuggestions(context)
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  function getContextSuggestions(ctx: string): AISuggestion[] {
    const suggestions: Record<string, AISuggestion[]> = {
      projects: [
        {
          id: 'p1',
          type: 'optimization',
          title: 'Optimize Project Timeline',
          description: 'Tech Conference project could save 3 days by parallelizing AV setup and content prep',
          icon: TrendingUp,
          priority: 'high',
          action: {
            label: 'View Plan',
            onClick: () => console.log('Show optimization plan')
          }
        },
        {
          id: 'p2',
          type: 'warning',
          title: 'Budget Alert',
          description: 'Documentary Series is approaching 85% budget usage with 40% completion remaining',
          icon: AlertCircle,
          priority: 'high'
        },
        {
          id: 'p3',
          type: 'automation',
          title: 'Auto-generate Weekly Reports',
          description: 'Set up automated project status reports sent every Monday',
          icon: Zap,
          priority: 'medium',
          action: {
            label: 'Set Up',
            onClick: () => console.log('Configure automation')
          }
        }
      ],
      tasks: [
        {
          id: 't1',
          type: 'tip',
          title: 'Task Dependencies',
          description: 'Consider adding dependencies: "AV Equipment Test" should block "Final Rehearsal"',
          icon: Lightbulb,
          priority: 'medium'
        },
        {
          id: 't2',
          type: 'optimization',
          title: 'Team Workload Balance',
          description: 'David Park has 12 tasks this week. Consider redistributing 3 tasks to available team members',
          icon: Users,
          priority: 'high'
        },
        {
          id: 't3',
          type: 'automation',
          title: 'Auto-assign Tasks',
          description: 'Enable AI to automatically assign tasks based on team availability and expertise',
          icon: Zap,
          priority: 'low',
          action: {
            label: 'Enable',
            onClick: () => console.log('Enable auto-assign')
          }
        }
      ],
      reports: [
        {
          id: 'r1',
          type: 'optimization',
          title: 'Revenue Trend Detected',
          description: 'Q4 revenue is 23% above forecast. Consider scaling marketing efforts to maintain momentum',
          icon: TrendingUp,
          priority: 'high'
        },
        {
          id: 'r2',
          type: 'tip',
          title: 'Export Scheduler',
          description: 'Save time by scheduling automatic weekly report exports to stakeholders',
          icon: Calendar,
          priority: 'medium',
          action: {
            label: 'Schedule',
            onClick: () => console.log('Schedule exports')
          }
        }
      ],
      general: [
        {
          id: 'g1',
          type: 'tip',
          title: 'Quick Actions',
          description: 'Press Ctrl+K to open command palette for quick navigation',
          icon: Lightbulb,
          priority: 'low'
        },
        {
          id: 'g2',
          type: 'optimization',
          title: 'Workflow Optimization',
          description: 'AI detected 3 opportunities to streamline your production workflow',
          icon: TrendingUp,
          priority: 'medium',
          action: {
            label: 'Review',
            onClick: () => console.log('Review optimizations')
          }
        }
      ]
    };

    return suggestions[ctx] || suggestions.general;
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(inputValue, context),
        timestamp: new Date(),
        suggestions: getRelatedSuggestions(inputValue, context)
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (query: string, ctx: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('optimize') || lowerQuery.includes('improve')) {
      return `Based on your ${ctx} data, I've identified several optimization opportunities:\n\n1. Parallel task execution could save 15-20% time\n2. Resource reallocation to balance team workload\n3. Automated status updates to reduce manual overhead\n\nWould you like me to create an action plan for any of these?`;
    }

    if (lowerQuery.includes('automate') || lowerQuery.includes('automation')) {
      return `I can help set up automations for:\n\n• Automatic task assignment based on team capacity\n• Weekly progress reports sent to stakeholders\n• Budget alerts when projects exceed thresholds\n• Deadline reminders 48 hours in advance\n\nWhich automation interests you most?`;
    }

    if (lowerQuery.includes('report') || lowerQuery.includes('analytics')) {
      return `I can generate custom reports showing:\n\n• Project completion trends\n• Team productivity metrics\n• Budget vs. actual analysis\n• Client satisfaction scores\n\nWhat specific insights are you looking for?`;
    }

    return `I understand you're asking about "${query}". Let me help you with that in the context of ${ctx}. Can you provide more details about what you'd like to accomplish?`;
  };

  const getRelatedSuggestions = (query: string, ctx: string): AISuggestion[] => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('automate')) {
      return [
        {
          id: 's1',
          type: 'automation',
          title: 'Smart Task Assignment',
          description: 'Automatically assign tasks based on team expertise and availability',
          icon: Zap,
          priority: 'high',
          action: {
            label: 'Configure',
            onClick: () => console.log('Configure smart assignment')
          }
        },
        {
          id: 's2',
          type: 'automation',
          title: 'Progress Notifications',
          description: 'Send automated updates when milestones are reached',
          icon: CheckCircle2,
          priority: 'medium',
          action: {
            label: 'Enable',
            onClick: () => console.log('Enable notifications')
          }
        }
      ];
    }

    return [];
  };

  const getSuggestionColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'optimization':
        return 'blue';
      case 'warning':
        return 'red';
      case 'tip':
        return 'green';
      case 'automation':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getSuggestionBadgeColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:shadow-xl transition-shadow"
      >
        <Brain size={24} />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
        />
      </motion.button>
    );
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">Click to expand</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[600px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              AI Assistant
              <Sparkles className="text-orange-500" size={14} />
            </h3>
            <p className="text-xs text-gray-500">Powered by advanced AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-white/50 rounded transition-colors"
          >
            <span className="text-gray-600 text-lg">−</span>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/50 rounded transition-colors"
          >
            <X className="text-gray-600" size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map(suggestion => {
                      const Icon = suggestion.icon;
                      const color = getSuggestionColor(suggestion.type);
                      const badgeColor = getSuggestionBadgeColor(suggestion.priority);

                      return (
                        <div
                          key={suggestion.id}
                          className="bg-white rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`text-${color}-600`} size={14} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
                                  {suggestion.priority}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">{suggestion.description}</p>
                            </div>
                          </div>
                          {suggestion.action && (
                            <button
                              onClick={suggestion.action.onClick}
                              className="w-full mt-2 px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                            >
                              {suggestion.action.label}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="animate-spin text-orange-500" size={16} />
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
