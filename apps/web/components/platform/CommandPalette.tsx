'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, Transition, Combobox } from '@headlessui/react';
import {
  Search,
  FileText,
  Users,
  Building2,
  CheckSquare,
  FolderKanban,
  Home,
  BarChart3,
  Settings,
  Calendar,
  Film,
  Briefcase,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Command types
type CommandType = 'navigation' | 'project' | 'property' | 'client' | 'task' | 'lead';

interface Command {
  id: string;
  name: string;
  description?: string;
  icon: React.ElementType;
  type: CommandType;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch cross-vertical search data
  const { data: searchResults } = useQuery({
    queryKey: ['command-palette-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      // TODO: Implement actual API call to unified search endpoint
      // For now, return empty array
      return [];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Static navigation commands
  const navigationCommands: Command[] = [
    {
      id: 'nav-home',
      name: 'Home',
      description: 'Go to homepage',
      icon: Home,
      type: 'navigation',
      action: () => router.push('/'),
      keywords: ['home', 'dashboard', 'main']
    },
    {
      id: 'nav-productions',
      name: 'Productions',
      description: 'Productions vertical dashboard',
      icon: Film,
      type: 'navigation',
      action: () => router.push('/dashboard/productions'),
      keywords: ['productions', 'projects', 'creative']
    },
    {
      id: 'nav-projects',
      name: 'All Projects',
      description: 'View all production projects',
      icon: FolderKanban,
      type: 'navigation',
      action: () => router.push('/dashboard/productions/projects'),
      keywords: ['projects', 'productions']
    },
    {
      id: 'nav-tasks',
      name: 'Tasks',
      description: 'View all tasks',
      icon: CheckSquare,
      type: 'navigation',
      action: () => router.push('/dashboard/production/tasks'),
      keywords: ['tasks', 'todo', 'assignments']
    },
    {
      id: 'nav-reports',
      name: 'Reports & Analytics',
      description: 'View reports and analytics',
      icon: BarChart3,
      type: 'navigation',
      action: () => router.push('/dashboard/production/reports'),
      keywords: ['reports', 'analytics', 'stats', 'metrics']
    },
    {
      id: 'nav-clients',
      name: 'Clients',
      description: 'Manage clients',
      icon: Users,
      type: 'navigation',
      action: () => router.push('/dashboard/production/company'),
      keywords: ['clients', 'customers', 'companies']
    },
    {
      id: 'nav-real-estate',
      name: 'Real Estate',
      description: 'Real estate vertical dashboard',
      icon: Building2,
      type: 'navigation',
      action: () => router.push('/dashboard/real-estate/dashboard'),
      keywords: ['real estate', 'properties', 'listings']
    },
    {
      id: 'nav-properties',
      name: 'Properties',
      description: 'View all properties',
      icon: MapPin,
      type: 'navigation',
      action: () => router.push('/dashboard/real-estate/properties'),
      keywords: ['properties', 'real estate', 'listings']
    },
    {
      id: 'nav-leads',
      name: 'Leads',
      description: 'Manage leads',
      icon: TrendingUp,
      type: 'navigation',
      action: () => router.push('/dashboard/real-estate/leads'),
      keywords: ['leads', 'prospects', 'contacts']
    },
    {
      id: 'nav-campaigns',
      name: 'Campaigns',
      description: 'Marketing campaigns',
      icon: Briefcase,
      type: 'navigation',
      action: () => router.push('/dashboard/real-estate/campaigns'),
      keywords: ['campaigns', 'marketing', 'ads']
    }
  ];

  // Filter commands based on query
  const filteredCommands = query === ''
    ? navigationCommands.slice(0, 8) // Show top 8 by default
    : navigationCommands.filter((command) => {
        const searchTerm = query.toLowerCase();
        return (
          command.name.toLowerCase().includes(searchTerm) ||
          command.description?.toLowerCase().includes(searchTerm) ||
          command.keywords?.some(k => k.includes(searchTerm))
        );
      });

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const handleSelect = useCallback((command: Command) => {
    command.action();
    handleClose();
  }, [handleClose]);

  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={() => setQuery('')}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/25 dark:bg-gray-900/75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-2xl transform rounded-xl bg-white dark:bg-[#0E1A2B] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all">
              <Combobox onChange={(command: Command) => handleSelect(command)}>
                {/* Search input */}
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <Combobox.Input
                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                    placeholder="Search projects, properties, clients, tasks..."
                    onChange={(event) => setQuery(event.target.value)}
                    value={query}
                  />
                </div>

                {/* Results */}
                {(filteredCommands.length > 0 || searchResults?.length) && (
                  <Combobox.Options
                    static
                    className="max-h-96 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800 dark:text-gray-200"
                  >
                    {/* Navigation commands */}
                    {filteredCommands.length > 0 && (
                      <div className="px-2">
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                          Quick Navigation
                        </div>
                        {filteredCommands.map((command) => (
                          <Combobox.Option
                            key={command.id}
                            value={command}
                            className={({ active }) =>
                              `flex cursor-pointer select-none items-center rounded-md px-3 py-2 ${
                                active
                                  ? 'bg-[#2979FF]/10 text-[#2979FF]'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`
                            }
                          >
                            {({ active }) => (
                              <>
                                <command.icon
                                  className={`h-5 w-5 flex-shrink-0 ${
                                    active ? 'text-[#2979FF]' : 'text-gray-400'
                                  }`}
                                  aria-hidden="true"
                                />
                                <div className="ml-3 flex-auto truncate">
                                  <div className="font-medium">{command.name}</div>
                                  {command.description && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {command.description}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                      </div>
                    )}

                    {/* Search results from API */}
                    {searchResults && searchResults.length > 0 && (
                      <div className="px-2 mt-2">
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                          Search Results
                        </div>
                        {/* TODO: Render search results */}
                      </div>
                    )}
                  </Combobox.Options>
                )}

                {/* Empty state */}
                {query !== '' && filteredCommands.length === 0 && !searchResults?.length && (
                  <div className="py-14 px-6 text-center text-sm sm:px-14">
                    <Search className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                    <p className="mt-4 font-semibold text-gray-900 dark:text-white">No results found</p>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      No projects, properties, clients, or tasks match your search.
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex flex-wrap items-center bg-gray-50 dark:bg-[#1A2F4B] px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800">
                  <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white dark:bg-[#0E1A2B] font-semibold sm:mx-2 border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    ↑
                  </kbd>
                  <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white dark:bg-[#0E1A2B] font-semibold sm:mx-2 border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    ↓
                  </kbd>
                  <span className="sm:hidden">to navigate</span>
                  <span className="hidden sm:inline">to navigate,</span>
                  <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white dark:bg-[#0E1A2B] font-semibold sm:mx-2 border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    ↵
                  </kbd>
                  <span className="sm:hidden">to select</span>
                  <span className="hidden sm:inline">to select,</span>
                  <kbd className="mx-1 flex h-5 px-2 items-center justify-center rounded border bg-white dark:bg-[#0E1A2B] font-semibold sm:mx-2 border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    ESC
                  </kbd>
                  to close
                </div>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
