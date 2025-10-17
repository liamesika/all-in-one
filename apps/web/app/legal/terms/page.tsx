// app/legal/terms/page.tsx
import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Effinity Terms of Use - Legal framework for platform use, liability, and user obligations',
};

export default function TermsOfUsePage() {
  return (
    <LegalLayout title="Terms of Use" lastUpdated="January 15, 2025">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> By using Effinity, you agree to be bound by these Terms of Use and our{' '}
          <Link href="/legal/privacy" className="underline">Privacy Policy</Link>. If you do not agree, you must immediately discontinue use of the Platform.
        </p>
      </div>

      <h2 id="acceptance">1. Acceptance of Terms</h2>
      <p>
        Welcome to <strong>Effinity</strong>, a multi-vertical SaaS platform owned and operated by{' '}
        <strong>Lia Mesika</strong>. These Terms of Use ("Terms") govern your access to and use of the Effinity
        platform, including all services, features, content, and applications provided through https://effinity.co.il
        and related domains.
      </p>
      <p>
        <strong>By accessing or using Effinity, you agree to be bound by these Terms and our Privacy Policy. If you
        do not agree, do not use the Platform.</strong>
      </p>

      <h2 id="eligibility">2. Eligibility</h2>
      <p>To use Effinity, you must:</p>
      <ul>
        <li>Be at least <strong>18 years old</strong></li>
        <li>Have legal capacity to enter into binding agreements</li>
        <li>Represent a legitimate business or organization (B2B platform)</li>
        <li>Not be prohibited from accessing the Platform under applicable laws</li>
      </ul>
      <p>
        Effinity supports <strong>four business verticals</strong>: Real Estate, Productions, E-Commerce, and Law.
      </p>

      <h2 id="account">3. Account Registration and Security</h2>
      
      <h3>3.1 Account Creation</h3>
      <ul>
        <li>You must provide accurate, complete, and up-to-date information during registration</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials</li>
        <li>You must notify us immediately of any unauthorized access or security breach</li>
      </ul>

      <h3>3.2 Organization Accounts</h3>
      <ul>
        <li>You can be a member of multiple organizations</li>
        <li>Each organization has separate data and permissions</li>
        <li>Cross-organization data access is strictly prohibited</li>
      </ul>

      <h3>3.3 Account Termination</h3>
      <p>We reserve the right to suspend or terminate your account if you:</p>
      <ul>
        <li>Violate these Terms</li>
        <li>Engage in fraudulent or illegal activities</li>
        <li>Misuse the Platform or harm other users</li>
        <li>Fail to pay applicable fees</li>
      </ul>

      <h2 id="acceptable-use">4. Acceptable Use Policy</h2>
      <p>You agree to use Effinity for lawful purposes only. <strong>Prohibited activities include</strong>:</p>

      <h3>4.1 Strictly Prohibited</h3>
      <ul>
        <li><strong>Illegal Activities</strong>: Fraud, money laundering, terrorism financing, or any criminal conduct</li>
        <li><strong>Security Threats</strong>: Hacking, phishing, malware distribution, DDoS attacks</li>
        <li><strong>IP Violation</strong>: Copying, reverse engineering, or duplicating the Platform</li>
        <li><strong>Unauthorized Access</strong>: Attempting to access other users' accounts or data</li>
        <li><strong>Spam and Abuse</strong>: Sending unsolicited communications or overloading systems</li>
      </ul>

      <h3>4.2 Content Restrictions</h3>
      <p>You may not upload content that:</p>
      <ul>
        <li>Infringes intellectual property rights</li>
        <li>Contains malware, viruses, or malicious code</li>
        <li>Is defamatory, obscene, harassing, or discriminatory</li>
        <li>Violates privacy rights or data protection laws</li>
      </ul>

      <h3>4.3 Enforcement</h3>
      <p>Violation of this policy may result in:</p>
      <ul>
        <li>Immediate account suspension or termination</li>
        <li>Removal of prohibited content</li>
        <li>Legal action and cooperation with law enforcement</li>
        <li>No refunds for paid services</li>
      </ul>

      <h2 id="data-ownership">5. Data Ownership and Rights</h2>
      
      <h3>5.1 Your Content</h3>
      <p><strong>You retain ownership</strong> of all content you create or upload to the Platform, including:</p>
      <ul>
        <li>Properties, projects, leads, clients, campaigns</li>
        <li>Photos, videos, documents, and files</li>
        <li>Business data, reports, and settings</li>
      </ul>

      <h3>5.2 Effinity's Rights</h3>
      <p><strong>Effinity retains ownership</strong> of:</p>
      <ul>
        <li>Platform code, architecture, and design</li>
        <li>AI-generated insights, recommendations, and analytics</li>
        <li>System logs, error reports, and performance metrics</li>
        <li>Aggregated, anonymized statistics</li>
      </ul>

      <h3>5.3 License Grant</h3>
      <p>
        By using Effinity, you grant us a <strong>non-exclusive, worldwide, royalty-free license</strong> to:
      </p>
      <ul>
        <li>Store, process, and display your content to provide the service</li>
        <li>Use your data to generate AI insights and recommendations</li>
        <li>Create anonymized statistics to improve the Platform</li>
        <li>Back up your data for disaster recovery</li>
      </ul>
      <p>This license terminates when you delete your content or close your account, except as required by law.</p>

      <h2 id="ai-features">6. AI-Powered Features and OpenAI Integration</h2>
      <p>Effinity uses <strong>OpenAI APIs</strong> for AI-powered features, including:</p>
      <ul>
        <li>Property search and recommendations (Real Estate)</li>
        <li>Lead qualification and insights (E-Commerce)</li>
        <li>Content generation and summarization (Productions)</li>
      </ul>

      <h3>6.1 AI Terms of Use</h3>
      <ul>
        <li>Your prompts and inputs are processed by OpenAI models</li>
        <li><strong>OpenAI does not use your data to train models</strong> (per their API terms)</li>
        <li>AI outputs are non-deterministic and may contain errors</li>
        <li>You are responsible for verifying AI-generated content</li>
      </ul>

      <h3>6.2 No Warranty on AI Outputs</h3>
      <ul>
        <li>AI recommendations are provided "as is" without guarantees</li>
        <li>We are not liable for business decisions based on AI insights</li>
        <li>Always verify critical information independently</li>
      </ul>

      <h2 id="limitation-liability">9. Limitation of Liability</h2>
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
        <p className="text-sm text-yellow-900">
          <strong>IMPORTANT:</strong> Please read this section carefully as it limits Effinity's liability.
        </p>
      </div>

      <h3>9.1 No Liability for Business Losses</h3>
      <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW</strong>:</p>
      <ul>
        <li>Effinity is <strong>NOT LIABLE</strong> for any business losses, lost revenue, lost profits, or opportunity costs arising from your use of the Platform</li>
        <li>We are not responsible for business decisions made based on Platform data or AI insights</li>
        <li>You use Effinity at your own risk for business operations</li>
      </ul>

      <h3>9.2 Service Availability</h3>
      <ul>
        <li>We strive for 99.9% uptime but do not guarantee uninterrupted service</li>
        <li>Planned maintenance will be announced in advance when possible</li>
        <li>We are not liable for downtime, data loss, or service interruptions</li>
      </ul>

      <h3>9.3 Third-Party Services</h3>
      <ul>
        <li>We integrate with third-party services (Firebase, Google Analytics, Sentry, OpenAI)</li>
        <li>We are not responsible for failures or issues with external services</li>
      </ul>

      <h3>9.4 Maximum Liability</h3>
      <p>
        In no event shall Effinity's total liability exceed the amount you paid us in the <strong>12 months</strong>{' '}
        preceding the claim.
      </p>

      <h2 id="governing-law">13. Governing Law and Dispute Resolution</h2>
      
      <h3>13.1 Governing Law</h3>
      <p>
        These Terms are governed by the laws of the <strong>State of Israel</strong>, without regard to conflict of law
        principles.
      </p>

      <h3>13.2 Jurisdiction</h3>
      <p>
        Any disputes arising from these Terms or your use of Effinity shall be resolved in the competent courts of{' '}
        <strong>Tel Aviv, Israel</strong>.
      </p>

      <h3>13.3 Language</h3>
      <p>
        These Terms are provided in both <strong>English and Hebrew</strong>. In case of conflict, the{' '}
        <strong>English version</strong> shall prevail.
      </p>

      <h2 id="contact">15. Contact Us</h2>
      <p>If you have questions about these Terms, please contact:</p>
      <ul>
        <li><strong>Effinity Legal Team</strong></li>
        <li><strong>Owner</strong>: Lia Mesika</li>
        <li><strong>Email</strong>: support@effinity.co.il</li>
        <li><strong>Website</strong>: https://effinity.co.il</li>
      </ul>

      <h2 id="acknowledgment">16. Acknowledgment</h2>
      <p>
        By using Effinity, you acknowledge that you have read, understood, and agreed to these Terms of Use. If you do
        not agree, you must immediately discontinue use of the Platform.
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
