'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { motion } from 'framer-motion';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' }
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {themes.map(({ value, icon: Icon, label }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={'relative px-3 py-2 rounded-md text-sm font-medium transition-colors ' + (theme === value ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200')}
          whileTap={{ scale: 0.95 }}
          aria-label={'Switch to ' + label + ' theme'}
        >
          {theme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-[#2979FF] rounded-md"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <Icon className="w-4 h-4 relative z-10" />
        </motion.button>
      ))}
    </div>
  );
}
