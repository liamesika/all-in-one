/**
 * Creative Productions - Overview Page
 * Dashboard with stats, filters, and recent activity
 */

import { Metadata } from 'next';
import ProductionsOverviewClient from './ProductionsOverviewClient';

export const metadata: Metadata = {
  title: 'Productions - Effinity',
  description: 'Creative production and video asset management',
};

export default function ProductionsOverviewPage() {
  return <ProductionsOverviewClient />;
}
