import { NewLawDashboard } from './NewLawDashboard';
import type { DashboardData } from './NewLawDashboard';

export const dynamic = 'force-dynamic';

// Mock data for prototype - will be replaced with API call
const getMockData = (): DashboardData => ({
  kpis: {
    activeCases: 23,
    clients: 45,
    billableHours: 128.5,
    revenue: 89250,
  },
  recentCases: [
    {
      id: '1',
      title: 'Johnson v. Smith Estate Planning',
      client: 'Michael Johnson',
      status: 'active' as const,
      attorney: 'Sarah Miller',
      lastUpdated: '2 hours ago',
    },
    {
      id: '2',
      title: 'Corporate Restructuring - TechCorp Inc.',
      client: 'TechCorp Inc.',
      status: 'pending' as const,
      attorney: 'James Wilson',
      lastUpdated: '5 hours ago',
    },
    {
      id: '3',
      title: 'Martinez Family Law Matter',
      client: 'Elena Martinez',
      status: 'active' as const,
      attorney: 'Sarah Miller',
      lastUpdated: '1 day ago',
    },
    {
      id: '4',
      title: 'Property Dispute - Greenfield LLC',
      client: 'Greenfield LLC',
      status: 'closed' as const,
      attorney: 'Robert Chen',
      lastUpdated: '2 days ago',
    },
    {
      id: '5',
      title: 'Employment Contract Review',
      client: 'David Thompson',
      status: 'pending' as const,
      attorney: 'James Wilson',
      lastUpdated: '3 days ago',
    },
  ],
  upcomingTasks: [
    {
      id: '1',
      title: 'File motion for summary judgment - Johnson case',
      dueDate: 'Today',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Client meeting - TechCorp restructuring',
      dueDate: 'Tomorrow',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: '3',
      title: 'Review contract amendments',
      dueDate: 'Dec 24',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: '4',
      title: 'Prepare deposition questions',
      dueDate: 'Dec 26',
      priority: 'medium' as const,
      completed: true,
    },
    {
      id: '5',
      title: 'Research case law for Martinez matter',
      dueDate: 'Dec 28',
      priority: 'low' as const,
      completed: false,
    },
  ],
});

export default function LawDashboardPage() {
  const data = getMockData();

  return <NewLawDashboard initialData={data} />;
}