/**
 * Creative Productions - Templates Page
 * Manage built-in and custom templates
 */

import { Metadata } from 'next';
import TemplatesClient from './TemplatesClient';

export const metadata: Metadata = {
  title: 'Templates - Creative Productions',
  description: 'Manage creative templates for briefs, scripts, and ad copy',
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}
