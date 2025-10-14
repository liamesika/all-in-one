/**
 * Creative Productions - Reviews Inbox
 * Side-by-side preview with approval workflow
 */

import { Metadata } from 'next';
import ReviewsInboxClient from './ReviewsInboxClient';

export const metadata: Metadata = {
  title: 'Reviews - Creative Productions',
  description: 'Review and approve creative assets',
};

export default function ReviewsInboxPage() {
  return <ReviewsInboxClient />;
}
