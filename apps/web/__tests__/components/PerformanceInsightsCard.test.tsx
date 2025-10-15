import { render, screen } from '@testing-library/react';
import { PerformanceInsightsCard } from '@/components/real-estate/PerformanceInsightsCard';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

describe('PerformanceInsightsCard', () => {
  it('renders all metrics', () => {
    render(<PerformanceInsightsCard />);
    
    expect(screen.getByText('Performance Insights')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
    expect(screen.getByText('Active Leads')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('displays metric values', () => {
    render(<PerformanceInsightsCard />);
    
    expect(screen.getByText('18.5%')).toBeInTheDocument();
    expect(screen.getByText('2.4h')).toBeInTheDocument();
    expect(screen.getByText('147')).toBeInTheDocument();
  });

  it('shows trend indicators', () => {
    render(<PerformanceInsightsCard />);
    
    const trendValues = screen.getAllByText(/\d+\.\d+%/);
    expect(trendValues.length).toBeGreaterThan(0);
  });
});
