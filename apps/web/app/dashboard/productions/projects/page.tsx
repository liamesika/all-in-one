/**
 * Creative Productions - Projects Board
 * Kanban view with drag-and-drop
 */

import { Metadata } from 'next';
import ProjectsBoardClient from './ProjectsBoardClient';

export const metadata: Metadata = {
  title: 'Projects - Creative Productions',
  description: 'Manage creative production projects in Kanban view',
};

export default function ProjectsBoardPage() {
  return <ProjectsBoardClient />;
}
