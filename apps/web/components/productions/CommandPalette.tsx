'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search,
  FolderKanban,
  CheckSquare,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Zap,
  Clock,
  ArrowRight,
  Command
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
  keywords?: string[];
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const quickActions: QuickAction[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'View overview and analytics',
      icon: BarChart3,
      action: () => {
        router.push('/dashboard/production/dashboard');
        onClose();
      },
      category: 'Navigation',
      keywords: ['home', 'overview', 'stats']
    },
    {
      id: 'projects',
      title: 'Projects',
      subtitle: 'Manage all production projects',
      icon: FolderKanban,
      action: () => {
        router.push('/dashboard/production/projects');
        onClose();
      },
      category: 'Navigation',
      keywords: ['project', 'manage']
    },
    {
      id: 'tasks',
      title: 'Tasks',
      subtitle: 'View and manage tasks',
      icon: CheckSquare,
      action: () => {
        router.push('/dashboard/production/tasks');
        onClose();
      },
      category: 'Navigation',
      keywords: ['todo', 'task', 'work']
    },
    {
      id: 'clients',
      title: 'Clients',
      subtitle: 'Manage client relationships',
      icon: Users,
      action: () => {
        router.push('/dashboard/production/company');
        onClose();
      },
      category: 'Navigation',
      keywords: ['client', 'customer', 'contact']
    },
    {
      id: 'calendar',
      title: 'Calendar',
      subtitle: 'View timeline and schedule',
      icon: Calendar,
      action: () => {
        router.push('/dashboard/production/calendar');
        onClose();
      },
      category: 'Navigation',
      keywords: ['schedule', 'timeline', 'events']
    },
    {
      id: 'reports',
      title: 'Reports',
      subtitle: 'Analytics and insights',
      icon: FileText,
      action: () => {
        router.push('/dashboard/production/reports');
        onClose();
      },
      category: 'Navigation',
      keywords: ['analytics', 'data', 'insights']
    },
    {
      id: 'automation',
      title: 'Automation',
      subtitle: 'Manage workflows',
      icon: Zap,
      action: () => {
        router.push('/dashboard/production/automation');
        onClose();
      },
      category: 'Navigation',
      keywords: ['workflow', 'automate']
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Configure your workspace',
      icon: Settings,
      action: () => {
        router.push('/dashboard/production/settings');
        onClose();
      },
      category: 'Navigation',
      keywords: ['config', 'preferences']
    },
    {
      id: 'new-project',
      title: 'Create New Project',
      subtitle: 'Start a new production project',
      icon: FolderKanban,
      action: () => {
        console.log('Create new project');
        onClose();
      },
      category: 'Actions',
      keywords: ['new', 'create', 'add']
    },
    {
      id: 'new-task',
      title: 'Create New Task',
      subtitle: 'Add a task to your workflow',
      icon: CheckSquare,
      action: () => {
        console.log('Create new task');
        onClose();
      },
      category: 'Actions',
      keywords: ['new', 'create', 'add', 'todo']
    },
    {
      id: 'new-client',
      title: 'Add New Client',
      subtitle: 'Create a client profile',
      icon: Users,
      action: () => {
        console.log('Create new client');
        onClose();
      },
      category: 'Actions',
      keywords: ['new', 'create', 'add', 'contact']
    }
  ];

  const filteredActions = quickActions.filter(action => {
    const query = searchQuery.toLowerCase();
    return (
      action.title.toLowerCase().includes(query) ||
      action.subtitle?.toLowerCase().includes(query) ||
      action.category.toLowerCase().includes(query) ||
      action.keywords?.some(keyword => keyword.includes(query))
    );
  });

  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredActions, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
                <Search className="text-gray-400" size={20} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for projects, tasks, or actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-900 placeholder-gray-500"
                />
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                  <Command size={12} />
                  <span>K</span>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {Object.keys(groupedActions).length > 0 ? (
                  <div className="py-2">
                    {Object.entries(groupedActions).map(([category, actions]) => (
                      <div key={category} className="mb-4 last:mb-0">
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {category}
                        </div>
                        {actions.map((action, index) => {
                          const globalIndex = filteredActions.indexOf(action);
                          const isSelected = globalIndex === selectedIndex;
                          const Icon = action.icon;

                          return (
                            <button
                              key={action.id}
                              onClick={action.action}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                                isSelected
                                  ? 'bg-orange-50 border-l-2 border-orange-500'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-orange-100' : 'bg-gray-100'
                              }`}>
                                <Icon className={isSelected ? 'text-orange-600' : 'text-gray-600'} size={20} />
                              </div>
                              <div className="flex-1 text-left">
                                <div className={`font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                                  {action.title}
                                </div>
                                {action.subtitle && (
                                  <div className="text-sm text-gray-500">{action.subtitle}</div>
                                )}
                              </div>
                              <ArrowRight className={isSelected ? 'text-orange-600' : 'text-gray-400'} size={16} />
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Search className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-gray-500">No results found</p>
                    <p className="text-sm text-gray-400 mt-1">Try searching for something else</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↓</kbd>
                      <span className="ml-1">Navigate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Enter</kbd>
                      <span className="ml-1">Select</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Esc</kbd>
                      <span className="ml-1">Close</span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {filteredActions.length} {filteredActions.length === 1 ? 'result' : 'results'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
