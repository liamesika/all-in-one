/**
 * Notification Center - Sprint A2
 * Combines NotificationBell and NotificationDrawer
 * Easy integration into app header
 */

'use client';

import { useState } from 'react';
import { NotificationBell } from './NotificationBell';
import { NotificationDrawer } from './NotificationDrawer';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <NotificationBell onClick={() => setIsOpen(true)} isOpen={isOpen} />
      <NotificationDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
