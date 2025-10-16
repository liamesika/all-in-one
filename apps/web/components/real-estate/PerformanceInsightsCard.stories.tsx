import type { Meta, StoryObj } from '@storybook/react';
import { PerformanceInsightsCard } from './PerformanceInsightsCard';

const meta: Meta<typeof PerformanceInsightsCard> = {
  title: 'Real Estate/PerformanceInsightsCard',
  component: PerformanceInsightsCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PerformanceInsightsCard>;

export const Default: Story = {
  args: {
    metrics: {
      conversionRate: 12.5,
      avgResponseTime: 3.2,
      activeLeads: 47,
      monthlyRevenue: 2450000,
    },
  },
};

export const HighPerformance: Story = {
  args: {
    metrics: {
      conversionRate: 25.8,
      avgResponseTime: 1.5,
      activeLeads: 89,
      monthlyRevenue: 5200000,
    },
  },
};

export const LowPerformance: Story = {
  args: {
    metrics: {
      conversionRate: 3.2,
      avgResponseTime: 8.7,
      activeLeads: 12,
      monthlyRevenue: 450000,
    },
  },
};

export const DarkMode: Story = {
  args: {
    metrics: {
      conversionRate: 15.3,
      avgResponseTime: 2.8,
      activeLeads: 54,
      monthlyRevenue: 3100000,
    },
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
