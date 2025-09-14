const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Performance test configuration
const PERFORMANCE_CONFIG = {
  urls: [
    'http://localhost:3000',
    'http://localhost:3000/real-estate',
    'http://localhost:3000/real-estate/properties',
    'http://localhost:3000/e-commerce',
    'http://localhost:3000/e-commerce/leads',
  ],
  thresholds: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 85,
    lcp: 2500, // ms
    fid: 100,  // ms
    cls: 0.1,
    fcp: 1800, // ms
    ttfb: 800, // ms
  },
  output: {
    format: 'html',
    path: path.join(__dirname, '..', 'reports'),
  },
};

// Lighthouse options
const LIGHTHOUSE_OPTIONS = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'cumulative-layout-shift',
      'total-blocking-time',
      'max-potential-fid',
      'time-to-first-byte',
      'interactive',
      'network-requests',
      'diagnostics',
      'performance-budget',
      'resource-summary',
      'third-party-summary',
      'unused-javascript',
      'unused-css-rules',
      'modern-image-formats',
      'uses-responsive-images',
      'efficient-animated-content',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-rel-preconnect',
      'uses-rel-preload',
      'font-display',
      'unminified-css',
      'unminified-javascript',
      'render-blocking-resources',
      'critical-request-chains',
      'user-timings',
      'bootup-time',
      'mainthread-work-breakdown',
      'dom-size',
    ],
  },
  flags: {
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
  },
};

// Performance budget
const PERFORMANCE_BUDGET = {
  resourceCounts: [
    { resourceType: 'script', budget: 10 },
    { resourceType: 'stylesheet', budget: 8 },
    { resourceType: 'image', budget: 30 },
    { resourceType: 'font', budget: 4 },
  ],
  resourceSizes: [
    { resourceType: 'script', budget: 500 }, // 500KB
    { resourceType: 'stylesheet', budget: 100 }, // 100KB
    { resourceType: 'image', budget: 2000 }, // 2MB
    { resourceType: 'font', budget: 200 }, // 200KB
    { resourceType: 'total', budget: 3000 }, // 3MB total
  ],
  timings: [
    { metric: 'first-contentful-paint', budget: 1800 },
    { metric: 'largest-contentful-paint', budget: 2500 },
    { metric: 'cumulative-layout-shift', budget: 0.1 },
    { metric: 'total-blocking-time', budget: 200 },
    { metric: 'speed-index', budget: 3000 },
  ],
};

async function runLighthouse(url, options) {
  const chrome = await chromeLauncher.launch({ chromeFlags: options.flags.chromeFlags });
  
  try {
    const runnerResult = await lighthouse(url, {
      ...options.flags,
      port: chrome.port,
    }, {
      ...options,
      budgets: [PERFORMANCE_BUDGET],
    });

    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function analyzeResults(results, url) {
  const { lhr, report } = results;
  const scores = lhr.categories;
  const audits = lhr.audits;
  
  // Core Web Vitals
  const coreWebVitals = {
    lcp: audits['largest-contentful-paint']?.numericValue || 0,
    fid: audits['max-potential-fid']?.numericValue || 0,
    cls: audits['cumulative-layout-shift']?.numericValue || 0,
    fcp: audits['first-contentful-paint']?.numericValue || 0,
    ttfb: audits['server-response-time']?.numericValue || 0,
  };

  // Performance metrics
  const performanceMetrics = {
    performance: Math.round(scores.performance.score * 100),
    accessibility: Math.round(scores.accessibility.score * 100),
    bestPractices: Math.round(scores['best-practices'].score * 100),
    seo: Math.round(scores.seo.score * 100),
    speedIndex: audits['speed-index']?.numericValue || 0,
    interactive: audits['interactive']?.numericValue || 0,
    totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
  };

  // Resource analysis
  const resourceSummary = audits['resource-summary']?.details?.items || [];
  const networkRequests = audits['network-requests']?.details?.items || [];
  
  // Opportunities for improvement
  const opportunities = [
    'unused-javascript',
    'unused-css-rules',
    'render-blocking-resources',
    'unminified-javascript',
    'unminified-css',
    'modern-image-formats',
    'uses-optimized-images',
    'uses-text-compression',
  ].map(auditId => {
    const audit = audits[auditId];
    return audit ? {
      id: auditId,
      title: audit.title,
      score: audit.score,
      numericValue: audit.numericValue,
      displayValue: audit.displayValue,
      description: audit.description,
    } : null;
  }).filter(Boolean);

  return {
    url,
    scores: performanceMetrics,
    coreWebVitals,
    resourceSummary,
    networkRequests: networkRequests.length,
    opportunities,
    report,
  };
}

function validateThresholds(results) {
  const issues = [];
  const { scores, coreWebVitals } = results;
  
  // Check score thresholds
  Object.entries(PERFORMANCE_CONFIG.thresholds).forEach(([metric, threshold]) => {
    if (scores[metric] !== undefined && scores[metric] < threshold) {
      issues.push({
        type: 'score',
        metric,
        actual: scores[metric],
        threshold,
        severity: scores[metric] < threshold * 0.8 ? 'high' : 'medium',
      });
    }
  });

  // Check Core Web Vitals
  Object.entries(coreWebVitals).forEach(([metric, value]) => {
    const threshold = PERFORMANCE_CONFIG.thresholds[metric];
    if (threshold && value > threshold) {
      issues.push({
        type: 'webvital',
        metric,
        actual: value,
        threshold,
        severity: value > threshold * 1.5 ? 'high' : 'medium',
      });
    }
  });

  return issues;
}

function generateReport(allResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalUrls: allResults.length,
      avgPerformanceScore: Math.round(
        allResults.reduce((sum, r) => sum + r.scores.performance, 0) / allResults.length
      ),
      avgLCP: Math.round(
        allResults.reduce((sum, r) => sum + r.coreWebVitals.lcp, 0) / allResults.length
      ),
      avgCLS: +(
        allResults.reduce((sum, r) => sum + r.coreWebVitals.cls, 0) / allResults.length
      ).toFixed(3),
      passedThresholds: 0,
      failedThresholds: 0,
    },
    results: [],
    recommendations: [],
  };

  allResults.forEach(result => {
    const issues = validateThresholds(result);
    const passed = issues.length === 0;
    
    if (passed) {
      report.summary.passedThresholds++;
    } else {
      report.summary.failedThresholds++;
    }

    report.results.push({
      ...result,
      issues,
      passed,
    });

    // Collect recommendations
    result.opportunities
      .filter(opp => opp.score < 0.9)
      .forEach(opp => {
        if (!report.recommendations.find(r => r.id === opp.id)) {
          report.recommendations.push({
            id: opp.id,
            title: opp.title,
            description: opp.description,
            impact: opp.score < 0.5 ? 'high' : opp.score < 0.8 ? 'medium' : 'low',
            urls: [result.url],
          });
        } else {
          const existing = report.recommendations.find(r => r.id === opp.id);
          existing.urls.push(result.url);
        }
      });
  });

  return report;
}

function saveReport(report, format = 'json') {
  const reportsDir = PERFORMANCE_CONFIG.output.path;
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  if (format === 'json') {
    const jsonPath = path.join(reportsDir, `performance-report-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`Performance report saved to: ${jsonPath}`);
  }

  // Save HTML reports for each URL
  report.results.forEach((result, index) => {
    if (result.report) {
      const htmlPath = path.join(reportsDir, `lighthouse-${timestamp}-${index}.html`);
      fs.writeFileSync(htmlPath, result.report);
    }
  });

  // Generate summary HTML
  const summaryHtml = generateSummaryHtml(report);
  const summaryPath = path.join(reportsDir, `performance-summary-${timestamp}.html`);
  fs.writeFileSync(summaryPath, summaryHtml);
  console.log(`Performance summary saved to: ${summaryPath}`);
}

function generateSummaryHtml(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; border-radius: 6px; min-width: 120px; text-align: center; }
        .metric.good { background: #d4edda; color: #155724; }
        .metric.warning { background: #fff3cd; color: #856404; }
        .metric.error { background: #f8d7da; color: #721c24; }
        .result { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .result.passed { border-color: #28a745; }
        .result.failed { border-color: #dc3545; }
        .issue { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .issue.high { background: #f8d7da; }
        .issue.medium { background: #fff3cd; }
        .recommendations { margin-top: 30px; }
        .recommendation { padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; background: #f8f9ff; }
    </style>
</head>
<body>
    <h1>Performance Test Report</h1>
    <p>Generated: ${report.timestamp}</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="metric ${report.summary.avgPerformanceScore >= 90 ? 'good' : report.summary.avgPerformanceScore >= 70 ? 'warning' : 'error'}">
            <div>Avg Performance</div>
            <div><strong>${report.summary.avgPerformanceScore}</strong></div>
        </div>
        <div class="metric ${report.summary.avgLCP <= 2500 ? 'good' : report.summary.avgLCP <= 4000 ? 'warning' : 'error'}">
            <div>Avg LCP</div>
            <div><strong>${report.summary.avgLCP}ms</strong></div>
        </div>
        <div class="metric ${report.summary.avgCLS <= 0.1 ? 'good' : report.summary.avgCLS <= 0.25 ? 'warning' : 'error'}">
            <div>Avg CLS</div>
            <div><strong>${report.summary.avgCLS}</strong></div>
        </div>
        <div class="metric ${report.summary.passedThresholds === report.summary.totalUrls ? 'good' : 'warning'}">
            <div>Passed Tests</div>
            <div><strong>${report.summary.passedThresholds}/${report.summary.totalUrls}</strong></div>
        </div>
    </div>

    <h2>Results by URL</h2>
    ${report.results.map(result => `
        <div class="result ${result.passed ? 'passed' : 'failed'}">
            <h3>${result.url}</h3>
            <p><strong>Performance:</strong> ${result.scores.performance}/100</p>
            <p><strong>LCP:</strong> ${result.coreWebVitals.lcp}ms | <strong>CLS:</strong> ${result.coreWebVitals.cls} | <strong>FCP:</strong> ${result.coreWebVitals.fcp}ms</p>
            
            ${result.issues.length > 0 ? `
                <h4>Issues:</h4>
                ${result.issues.map(issue => `
                    <div class="issue ${issue.severity}">
                        <strong>${issue.metric}:</strong> ${issue.actual} (threshold: ${issue.threshold})
                    </div>
                `).join('')}
            ` : '<p style="color: green;">✓ All thresholds passed</p>'}
        </div>
    `).join('')}

    <div class="recommendations">
        <h2>Recommendations</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
                <p><strong>Impact:</strong> ${rec.impact} | <strong>Affected URLs:</strong> ${rec.urls.length}</p>
            </div>
        `).join('')}
    </div>
</body>
</html>
  `;
}

async function main() {
  console.log('Starting performance tests...');
  console.log(`Testing ${PERFORMANCE_CONFIG.urls.length} URLs`);
  
  const allResults = [];
  
  for (const url of PERFORMANCE_CONFIG.urls) {
    console.log(`Testing: ${url}`);
    
    try {
      const lighthouseResult = await runLighthouse(url, LIGHTHOUSE_OPTIONS);
      const analysis = analyzeResults(lighthouseResult, url);
      allResults.push(analysis);
      
      console.log(`✓ ${url} - Performance: ${analysis.scores.performance}/100`);
    } catch (error) {
      console.error(`✗ Failed to test ${url}:`, error.message);
      allResults.push({
        url,
        error: error.message,
        scores: { performance: 0 },
        coreWebVitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
        issues: [{ type: 'error', message: error.message, severity: 'high' }],
      });
    }
  }
  
  const report = generateReport(allResults);
  saveReport(report);
  
  console.log('\n=== PERFORMANCE REPORT SUMMARY ===');
  console.log(`Average Performance Score: ${report.summary.avgPerformanceScore}/100`);
  console.log(`Average LCP: ${report.summary.avgLCP}ms`);
  console.log(`Average CLS: ${report.summary.avgCLS}`);
  console.log(`Tests Passed: ${report.summary.passedThresholds}/${report.summary.totalUrls}`);
  
  if (report.summary.failedThresholds > 0) {
    console.log('\n⚠️  Performance issues detected. Check the full report for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All performance thresholds passed!');
  }
}

// Run the performance tests
if (require.main === module) {
  main().catch(error => {
    console.error('Performance testing failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runLighthouse,
  analyzeResults,
  validateThresholds,
  generateReport,
  saveReport,
  PERFORMANCE_CONFIG,
};