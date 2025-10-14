/**
 * Creative Productions - Project Workspace
 * Detailed project view with tabs: Brief, Tasks, Assets, Reviews, Renders, History
 */

import { Metadata } from 'next';
import ProjectWorkspaceClient from './ProjectWorkspaceClient';

export const metadata: Metadata = {
  title: 'Project Workspace - Creative Productions',
  description: 'Manage project details, tasks, assets, and reviews',
};

export default function ProjectWorkspacePage() {
  return <ProjectWorkspaceClient />;
}
