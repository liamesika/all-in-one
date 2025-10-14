/**
 * Creative Productions - Assets Library
 * Grid/list view with filters, search, and bulk actions
 */

import { Metadata } from 'next';
import AssetsLibraryClient from './AssetsLibraryClient';

export const metadata: Metadata = {
  title: 'Assets Library - Creative Productions',
  description: 'Browse and manage creative assets',
};

export default function AssetsLibraryPage() {
  return <AssetsLibraryClient />;
}
