export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify GA4 event tracking
 *
 * This endpoint returns HTML with GA4 test events that can be verified in DebugView
 *
 * Usage:
 * - Navigate to /api/test/ga4 in browser
 * - Open GA4 DebugView: https://analytics.google.com/analytics/web/#/a{account-id}/p{property-id}/reports/realtime/debugview
 * - Click buttons to trigger test events
 * - Verify events appear in DebugView
 */
export async function GET(request: NextRequest) {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  if (!measurementId) {
    return NextResponse.json({
      error: 'GA4 Measurement ID not configured',
      hint: 'Set NEXT_PUBLIC_GA4_MEASUREMENT_ID environment variable',
    }, { status: 500 });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GA4 Event Testing - Effinity</title>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_path: window.location.pathname,
      debug_mode: true // Enable debug mode for testing
    });

    // Test event functions
    function sendProjectCreateEvent() {
      gtag('event', 'project_create', {
        event_category: 'productions',
        event_label: 'test_project',
        value: 1,
        project_name: 'Test Project from GA4 Testing',
        project_type: 'production',
        timestamp: new Date().toISOString()
      });
      updateLog('✅ Sent: project_create event');
    }

    function sendTaskCompleteEvent() {
      gtag('event', 'task_complete', {
        event_category: 'productions',
        event_label: 'test_task',
        value: 1,
        task_id: 'test-task-123',
        task_status: 'completed',
        timestamp: new Date().toISOString()
      });
      updateLog('✅ Sent: task_complete event');
    }

    function sendFileUploadEvent() {
      gtag('event', 'file_upload', {
        event_category: 'productions',
        event_label: 'test_file',
        file_type: 'image/png',
        file_size: 1024000,
        upload_method: 'signed_url',
        timestamp: new Date().toISOString()
      });
      updateLog('✅ Sent: file_upload event');
    }

    function sendReportViewEvent() {
      gtag('event', 'report_view', {
        event_category: 'productions',
        event_label: 'test_report',
        report_type: 'projects_overview',
        date_range: '30_days',
        timestamp: new Date().toISOString()
      });
      updateLog('✅ Sent: report_view event');
    }

    function sendCustomEvent() {
      const eventName = document.getElementById('customEventName').value;
      gtag('event', eventName, {
        event_category: 'test',
        event_label: 'custom_test',
        timestamp: new Date().toISOString()
      });
      updateLog(\`✅ Sent: \${eventName} event\`);
    }

    function updateLog(message) {
      const log = document.getElementById('eventLog');
      const timestamp = new Date().toLocaleTimeString();
      log.innerHTML += \`<div>[\${timestamp}] \${message}</div>\`;
      log.scrollTop = log.scrollHeight;
    }

    // Send page_view on load
    window.addEventListener('load', () => {
      updateLog('✅ Page loaded - page_view event sent automatically');
      updateLog('📊 Check GA4 DebugView for real-time events');
    });
  </script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      color: #667eea;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }
    .subtitle {
      color: #666;
      margin-bottom: 2rem;
      font-size: 0.9rem;
    }
    .measurement-id {
      background: #f0f4ff;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      font-family: 'Monaco', monospace;
      font-size: 0.9rem;
      color: #667eea;
    }
    .section {
      margin-bottom: 2rem;
    }
    .section-title {
      font-size: 1.1rem;
      color: #333;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    .button-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
    .custom-event {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    input {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    #eventLog {
      background: #1e1e1e;
      color: #00ff00;
      padding: 1rem;
      border-radius: 8px;
      font-family: 'Monaco', monospace;
      font-size: 0.85rem;
      height: 200px;
      overflow-y: auto;
      line-height: 1.6;
    }
    #eventLog div {
      margin-bottom: 0.25rem;
    }
    .instructions {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 2rem;
    }
    .instructions h3 {
      color: #856404;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }
    .instructions ol {
      margin-left: 1.5rem;
      color: #856404;
    }
    .instructions li {
      margin-bottom: 0.5rem;
    }
    .instructions a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    .instructions a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 GA4 Event Testing</h1>
    <p class="subtitle">Effinity Platform - Phase 9 UAT</p>

    <div class="measurement-id">
      <strong>Measurement ID:</strong> ${measurementId}
    </div>

    <div class="instructions">
      <h3>📋 How to Verify Events in GA4 DebugView:</h3>
      <ol>
        <li>Open <a href="https://analytics.google.com/analytics/web/" target="_blank">Google Analytics</a></li>
        <li>Navigate to: <strong>Reports → Realtime → DebugView</strong></li>
        <li>Click the buttons below to trigger test events</li>
        <li>Verify events appear in DebugView within ~5 seconds</li>
        <li>Check event parameters and values match expected data</li>
      </ol>
    </div>

    <div class="section">
      <div class="section-title">🎬 Productions Vertical Events</div>
      <div class="button-grid">
        <button onclick="sendProjectCreateEvent()">
          📁 Project Create
        </button>
        <button onclick="sendTaskCompleteEvent()">
          ✅ Task Complete
        </button>
        <button onclick="sendFileUploadEvent()">
          📤 File Upload
        </button>
        <button onclick="sendReportViewEvent()">
          📊 Report View
        </button>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🧪 Custom Event Testing</div>
      <div class="custom-event">
        <input
          type="text"
          id="customEventName"
          placeholder="Enter custom event name..."
          value="custom_test_event"
        />
        <button onclick="sendCustomEvent()" style="flex: 0 0 150px;">
          Send Event
        </button>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📝 Event Log</div>
      <div id="eventLog">
        <div>🚀 GA4 Testing Interface Ready</div>
        <div>📊 Measurement ID: ${measurementId}</div>
        <div>⏳ Waiting for events...</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
