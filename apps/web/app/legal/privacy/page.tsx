// app/legal/privacy/page.tsx
import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Effinity Privacy Policy - GDPR-compliant data protection and privacy terms',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="January 15, 2025">
      <h2 id="introduction">1. Introduction</h2>
      <p>
        Welcome to <strong>Effinity</strong>, a multi-vertical SaaS platform owned and operated by{' '}
        <strong>Lia Mesika</strong>. This Privacy Policy explains how we collect, use, disclose, and protect your
        personal information when you use our platform.
      </p>
      <p>
        Effinity provides business management tools across four verticals: <strong>Real Estate</strong>,{' '}
        <strong>Productions</strong>, <strong>E-Commerce</strong>, and <strong>Law</strong>. We are committed to
        protecting your privacy and complying with applicable data protection laws, including the General Data
        Protection Regulation (GDPR) and Israeli Privacy Protection Law.
      </p>
      <p>
        <strong>Contact Information</strong>:
      </p>
      <ul>
        <li><strong>Owner</strong>: Lia Mesika</li>
        <li><strong>Platform</strong>: Effinity</li>
        <li><strong>Email</strong>: support@effinity.co.il</li>
        <li><strong>Website</strong>: https://effinity.co.il</li>
        <li><strong>Legal Jurisdiction</strong>: State of Israel</li>
      </ul>

      <h2 id="information-we-collect">2. Information We Collect</h2>
      
      <h3 id="user-provided-information">2.1 Information You Provide to Us</h3>
      <p>When you use Effinity, you may provide us with:</p>
      <ul>
        <li><strong>Account Registration</strong>: Name, email address, phone number, profile photo</li>
        <li><strong>Business Data</strong>: Organization name, business type, vertical selection (Real Estate, Productions, E-Commerce, Law)</li>
        <li><strong>Content You Upload</strong>: Properties, projects, leads, clients, campaigns, documents, photos, videos</li>
        <li><strong>Communication Data</strong>: Messages sent through the platform, support requests</li>
        <li><strong>Payment Information</strong>: Processed securely by third-party providers (Stripe) - we do not store full credit card details</li>
      </ul>

      <h3 id="automatic-information">2.2 Information We Collect Automatically</h3>
      <p>When you access Effinity, we automatically collect:</p>
      <ul>
        <li><strong>Usage Data</strong>: Pages visited, features used, time spent on platform, interaction patterns</li>
        <li><strong>Device Information</strong>: IP address, browser type, device type, operating system</li>
        <li><strong>Location Data</strong>: Approximate geographic location based on IP address (not precise GPS)</li>
        <li><strong>Analytics Data</strong>: Google Analytics 4 (GA4) tracks page views, user flow, conversion events</li>
        <li><strong>Error Logs</strong>: Sentry.io captures error reports, performance metrics, crash data</li>
      </ul>

      <h3 id="third-party-information">2.3 Information from Third-Party Services</h3>
      <p>We integrate with third-party services that may provide information:</p>
      <ul>
        <li><strong>Firebase Authentication</strong>: User authentication data (email, UID)</li>
        <li><strong>Social Media Integrations</strong>: Meta, Google, TikTok, LinkedIn campaign data (with your explicit consent)</li>
        <li><strong>OpenAI API</strong>: Processes your inputs to generate AI-powered insights (not used for training OpenAI models)</li>
      </ul>

      <h2 id="how-we-use-information">3. How We Use Your Information</h2>
      <p>We use your information to:</p>
      
      <h3 id="provide-service">3.1 Provide and Improve the Service</h3>
      <ul>
        <li>Create and manage your account</li>
        <li>Deliver platform features (property management, lead tracking, project management)</li>
        <li>Generate AI-powered insights and recommendations</li>
        <li>Optimize performance and fix bugs</li>
      </ul>

      <h3 id="communicate">3.2 Communicate with You</h3>
      <ul>
        <li>Send service updates, feature announcements, and security alerts</li>
        <li>Respond to your support requests</li>
        <li>Send marketing communications (with your consent, opt-out available)</li>
      </ul>

      <h3 id="security-compliance">3.3 Security and Compliance</h3>
      <ul>
        <li>Detect and prevent fraud, abuse, and security threats</li>
        <li>Comply with legal obligations and regulatory requirements</li>
        <li>Enforce our Terms of Use and other policies</li>
      </ul>

      <h3 id="analytics">3.4 Analytics and Research</h3>
      <ul>
        <li>Analyze usage patterns to improve user experience</li>
        <li>Conduct aggregated, anonymized research</li>
        <li>Track platform performance and reliability</li>
      </ul>

      <h2 id="data-storage">4. Data Storage and Security</h2>
      
      <h3 id="storage-location">4.1 Where We Store Your Data</h3>
      <p>Your data is stored using the following infrastructure:</p>
      <ul>
        <li><strong>PostgreSQL Database</strong>: Hosted on Neon (EU servers) with encryption at rest</li>
        <li><strong>Firebase</strong>: User authentication and real-time storage (Google Cloud infrastructure)</li>
        <li><strong>AWS S3</strong>: File uploads (photos, videos, documents) with encryption</li>
        <li><strong>Sentry.io</strong>: Error logs and performance monitoring (EU/US servers)</li>
        <li><strong>Google Analytics 4</strong>: Analytics data (Google Cloud infrastructure)</li>
      </ul>

      <h3 id="security-measures">4.2 Security Measures</h3>
      <p>We implement industry-standard security measures:</p>
      <ul>
        <li><strong>Encryption</strong>: HTTPS/TLS for data in transit, AES-256 for data at rest</li>
        <li><strong>Access Control</strong>: Role-based permissions, strict data isolation between organizations</li>
        <li><strong>Authentication</strong>: Firebase Authentication with secure token management</li>
        <li><strong>Monitoring</strong>: Real-time security monitoring via Sentry and server logs</li>
        <li><strong>Backups</strong>: Regular automated backups with 30-day retention</li>
      </ul>

      <h2 id="data-ownership">5. Data Ownership and Rights</h2>
      
      <h3 id="your-content">5.1 Your Content</h3>
      <p>
        <strong>You retain full ownership</strong> of all content you upload to Effinity, including properties,
        projects, leads, clients, campaigns, photos, videos, and documents.
      </p>

      <h3 id="effinity-rights">5.2 Effinity's Rights</h3>
      <p>
        <strong>Effinity retains ownership</strong> of system-generated data and AI-powered insights, including:
      </p>
      <ul>
        <li>Platform analytics and usage statistics</li>
        <li>AI-generated recommendations and property descriptions</li>
        <li>Aggregated, anonymized data derived from user activity</li>
        <li>System logs, error reports, and performance metrics</li>
      </ul>

      <h3 id="license-grant">5.3 License Grant</h3>
      <p>
        By using Effinity, you grant us a <strong>non-exclusive, worldwide, royalty-free license</strong> to use your
        content solely for the purpose of providing the service (storage, display, AI processing, backup).
      </p>

      <h2 id="cookies-tracking">6. Cookies and Tracking Technologies</h2>
      <p>Effinity uses cookies and similar technologies to:</p>

      <h3 id="cookie-types">6.1 Types of Cookies</h3>
      <table>
        <thead>
          <tr>
            <th>Cookie Type</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Essential Cookies</strong></td>
            <td>Authentication, session management, security</td>
            <td>Session / 30 days</td>
          </tr>
          <tr>
            <td><strong>Preference Cookies</strong></td>
            <td>Language selection, theme, user preferences</td>
            <td>1 year</td>
          </tr>
          <tr>
            <td><strong>Analytics Cookies</strong></td>
            <td>Google Analytics 4 (GA4) - usage tracking</td>
            <td>2 years</td>
          </tr>
          <tr>
            <td><strong>Performance Cookies</strong></td>
            <td>Sentry error tracking, performance monitoring</td>
            <td>Session</td>
          </tr>
        </tbody>
      </table>

      <h3 id="cookie-control">6.2 Cookie Control</h3>
      <p>You can control cookies through your browser settings. Note that disabling essential cookies may impact platform functionality.</p>

      <h2 id="data-sharing">7. Data Sharing and Disclosure</h2>
      
      <h3 id="no-selling">7.1 We Do Not Sell Your Data</h3>
      <p>
        <strong>Effinity does not sell, rent, or trade your personal data to third parties.</strong>
      </p>

      <h3 id="service-providers">7.2 Service Providers</h3>
      <p>We share data with trusted service providers who help us operate the platform:</p>
      <ul>
        <li><strong>Firebase</strong>: Authentication and storage</li>
        <li><strong>AWS</strong>: File storage (S3)</li>
        <li><strong>OpenAI</strong>: AI-powered features (your data is not used to train models)</li>
        <li><strong>Sentry</strong>: Error tracking and performance monitoring</li>
        <li><strong>Google Analytics</strong>: Usage analytics</li>
        <li><strong>Stripe</strong>: Payment processing (PCI-DSS compliant)</li>
      </ul>

      <h3 id="legal-disclosure">7.3 Legal Disclosure</h3>
      <p>We may disclose your information if required by law or to:</p>
      <ul>
        <li>Comply with legal processes (court orders, subpoenas)</li>
        <li>Protect our rights, property, or safety</li>
        <li>Investigate fraud or security incidents</li>
      </ul>

      <h2 id="your-rights">8. Your Rights (GDPR Compliance)</h2>
      <p>Under GDPR and Israeli Privacy Protection Law, you have the following rights:</p>

      <h3 id="right-access">8.1 Right to Access</h3>
      <p>Request a copy of all personal data we hold about you.</p>

      <h3 id="right-portability">8.2 Right to Data Portability</h3>
      <p>Export your data in a structured, machine-readable format (JSON, CSV).</p>

      <h3 id="right-correction">8.3 Right to Correction</h3>
      <p>Update or correct inaccurate personal information.</p>

      <h3 id="right-deletion">8.4 Right to Deletion ("Right to be Forgotten")</h3>
      <p>Request deletion of your account and personal data (retained for 90 days for legal compliance).</p>

      <h3 id="right-restriction">8.5 Right to Restriction</h3>
      <p>Limit how we process your data in certain circumstances.</p>

      <h3 id="right-objection">8.6 Right to Object</h3>
      <p>Object to data processing for marketing or analytics purposes.</p>

      <h3 id="exercise-rights">8.7 How to Exercise Your Rights</h3>
      <p>
        Email us at <strong>support@effinity.co.il</strong> with your request. We will respond within{' '}
        <strong>30 days</strong>.
      </p>

      <h2 id="data-retention">9. Data Retention</h2>
      <p>We retain your data for as long as necessary to provide the service:</p>
      <ul>
        <li><strong>Active Accounts</strong>: Data retained while account is active</li>
        <li><strong>Deleted Accounts</strong>: Data deleted within 90 days (unless required for legal compliance)</li>
        <li><strong>Backups</strong>: Backup data retained for 30 days after deletion</li>
        <li><strong>Legal Compliance</strong>: Some data may be retained longer to comply with legal obligations (e.g., payment records for tax purposes)</li>
      </ul>

      <h2 id="international-transfers">10. International Data Transfers</h2>
      <p>
        Effinity is based in Israel. If you access the platform from outside Israel, your data may be transferred to
        and processed in Israel, the EU, or the US (via service providers). We ensure appropriate safeguards are in
        place through:
      </p>
      <ul>
        <li>GDPR-compliant Data Processing Agreements (DPAs)</li>
        <li>Standard Contractual Clauses (SCCs) with service providers</li>
        <li>Encryption and security measures</li>
      </ul>

      <h2 id="children-privacy">11. Children's Privacy</h2>
      <p>
        Effinity is a <strong>B2B (business-to-business) platform</strong> intended for users aged <strong>18 and
        over</strong>. We do not knowingly collect personal information from children. If you believe a child has
        provided information to us, please contact <strong>support@effinity.co.il</strong> immediately.
      </p>

      <h2 id="changes-policy">12. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be effective upon posting the revised policy
        on this page, with the "Last Updated" date revised. For material changes, we will notify you via email (if you
        have an active account) or through a prominent notice on the platform.
      </p>

      <h2 id="contact">13. Contact Us</h2>
      <p>If you have questions or concerns about this Privacy Policy:</p>
      <ul>
        <li><strong>Email</strong>: support@effinity.co.il</li>
        <li><strong>Owner</strong>: Lia Mesika</li>
        <li><strong>Website</strong>: https://effinity.co.il</li>
      </ul>
      <p>
        <strong>Legal Jurisdiction</strong>: This Privacy Policy is governed by the laws of the <strong>State of
        Israel</strong>.
      </p>

      <hr />
      <p className="text-center text-sm text-gray-600 mt-8">
        <strong>© 2025 Effinity. All rights reserved.</strong>
        <br />
        Proprietary system developed by Lia Mesika.
      </p>
    </LegalLayout>
  );
}
