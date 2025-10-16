import { useEffect, useCallback, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Define all keyboard shortcuts
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'k',
      ctrl: true,
      action: () => setShowCommandPalette(true),
      description: 'Open command palette / Global search',
      category: 'Navigation'
    },
    {
      key: 'n',
      ctrl: true,
      action: () => {
        if (pathname?.includes('/projects')) {
          console.log('Create new project');
          // Trigger create project modal
        } else if (pathname?.includes('/tasks')) {
          console.log('Create new task');
          // Trigger create task modal
        } else if (pathname?.includes('/clients')) {
          console.log('Create new client');
          // Trigger create client modal
        }
      },
      description: 'Create new item (context-aware)',
      category: 'Actions'
    },
    {
      key: 'd',
      ctrl: true,
      action: () => router.push('/dashboard/production/dashboard'),
      description: 'Go to Dashboard',
      category: 'Navigation'
    },
    {
      key: 'p',
      ctrl: true,
      action: () => router.push('/dashboard/production/projects'),
      description: 'Go to Projects',
      category: 'Navigation'
    },
    {
      key: 't',
      ctrl: true,
      action: () => router.push('/dashboard/production/tasks'),
      description: 'Go to Tasks',
      category: 'Navigation'
    },
    {
      key: 'c',
      ctrl: true,
      action: () => router.push('/dashboard/production/company'),
      description: 'Go to Clients',
      category: 'Navigation'
    },
    {
      key: 'r',
      ctrl: true,
      action: () => router.push('/dashboard/production/reports'),
      description: 'Go to Reports',
      category: 'Navigation'
    },
    {
      key: '/',
      ctrl: false,
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      },
      description: 'Focus search input',
      category: 'Navigation'
    },
    {
      key: 'Escape',
      ctrl: false,
      action: () => {
        setShowCommandPalette(false);
        // Close any open modals
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) activeElement.blur();
      },
      description: 'Close modals / Clear focus',
      category: 'Actions'
    },
    {
      key: '?',
      shift: true,
      action: () => {
        console.log('Show keyboard shortcuts help');
        // Show shortcuts modal
      },
      description: 'Show keyboard shortcuts help',
      category: 'Help'
    }
  ];

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs (except for specific cases)
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' ||
                        target.tagName === 'TEXTAREA' ||
                        target.isContentEditable;

    // Allow Escape and Ctrl+K even in input fields
    if (isInputField && event.key !== 'Escape' && !(event.ctrlKey && event.key === 'k')) {
      return;
    }

    shortcuts.forEach(shortcut => {
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault();
        shortcut.action();
      }
    });
  }, [router, pathname, shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return {
    shortcuts,
    showCommandPalette,
    setShowCommandPalette
  };
}
