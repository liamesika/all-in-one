import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PerformanceInsightsCard } from '../../components/real-estate/PerformanceInsightsCard';

expect.extend(toHaveNoViolations);

describe('Real Estate Accessibility Tests', () => {
  test('PerformanceInsightsCard has no accessibility violations', async () => {
    const { container } = render(
      <PerformanceInsightsCard
        metrics={{
          conversionRate: 15.3,
          avgResponseTime: 2.8,
          activeLeads: 54,
          monthlyRevenue: 3100000,
        }}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('PerformanceInsightsCard with dark mode has no violations', async () => {
    const { container } = render(
      <div className="dark">
        <PerformanceInsightsCard
          metrics={{
            conversionRate: 15.3,
            avgResponseTime: 2.8,
            activeLeads: 54,
            monthlyRevenue: 3100000,
          }}
        />
      </div>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
