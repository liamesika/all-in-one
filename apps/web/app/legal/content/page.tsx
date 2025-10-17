// app/legal/content/page.tsx
import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Content & Media Rights Policy',
  description: 'Effinity content ownership, AI-generated content rights, and DMCA compliance',
};

export default function ContentPolicyPage() {
  return (
    <LegalLayout title="Content and Media Rights Policy" lastUpdated="January 15, 2025">
      <h2 id="introduction">1. Introduction</h2>
      <p>
        This Content and Media Rights Policy governs the ownership, use, and licensing of all visual, written, and
        multimedia content appearing on or within the <strong>Effinity platform</strong>. This policy clarifies the
        rights of Effinity, its users, and third parties regarding content creation, display, and commercial use.
      </p>

      <h2 id="effinity-content">2. Effinity-Created Content</h2>
      
      <h3>2.1 Original Works</h3>
      <p>
        All content created by or on behalf of Effinity is the <strong>exclusive intellectual property</strong> of{' '}
        <strong>Lia Mesika</strong> and is protected under copyright law. This includes:
      </p>

      <h4>Platform Visual Content</h4>
      <ul>
        <li>User interface designs, layouts, and component libraries</li>
        <li>Icons, graphics, illustrations, and animations</li>
        <li>Screenshots, mockups, and promotional imagery</li>
        <li>Video tutorials, demos, and product walkthroughs</li>
      </ul>

      <h4>Written Content</h4>
      <ul>
        <li>Website copy, marketing materials, and landing pages</li>
        <li>Blog posts, articles, and educational content</li>
        <li>Help documentation, tooltips, and in-app messaging</li>
        <li>Email templates and notification text</li>
      </ul>

      <h3>2.2 Rights Reserved</h3>
      <p>Effinity reserves all rights to its original content, including:</p>
      <ul>
        <li><strong>Reproduction Rights</strong>: Copying, duplicating, or replicating content</li>
        <li><strong>Distribution Rights</strong>: Sharing, publishing, or disseminating content</li>
        <li><strong>Modification Rights</strong>: Editing, adapting, or creating derivative works</li>
        <li><strong>Commercial Use Rights</strong>: Using content for commercial purposes</li>
        <li><strong>Display Rights</strong>: Publicly displaying content on any platform</li>
      </ul>
      <p>
        <strong>Unauthorized use, copying, or redistribution of Effinity-created content is strictly prohibited and
        constitutes copyright infringement.</strong>
      </p>

      <h2 id="user-content">3. User-Generated Content</h2>
      
      <h3>3.1 Content You Upload</h3>
      <p>When you use Effinity, you may upload various types of content, including:</p>
      <ul>
        <li>Property photos and videos (Real Estate vertical)</li>
        <li>Project files and creative assets (Productions vertical)</li>
        <li>Lead information and campaign data (E-Commerce vertical)</li>
        <li>Documents, reports, and attachments</li>
      </ul>
      <p><strong>You retain full ownership</strong> of all content you create or upload to the Platform.</p>

      <h3>3.2 License Grant to Effinity</h3>
      <p>
        By uploading content to Effinity, you grant us a <strong>non-exclusive, worldwide, royalty-free license</strong>{' '}
        to:
      </p>
      <ul>
        <li><strong>Store and Display</strong>: Host and display your content within the Platform</li>
        <li><strong>Process and Optimize</strong>: Resize, compress, and optimize images for performance</li>
        <li><strong>Backup and Replicate</strong>: Create backups for data protection and disaster recovery</li>
        <li><strong>Cache and Distribute</strong>: Use CDNs to deliver content efficiently</li>
      </ul>
      <p>
        <strong>This license is limited to service provision only.</strong> We do not use your content for advertising,
        sell it to third parties, or display it publicly outside your organization's context.
      </p>

      <h3>3.3 License Termination</h3>
      <p>The license terminates when:</p>
      <ul>
        <li>You delete the content from the Platform</li>
        <li>You close your Effinity account (see retention policy in <Link href="/legal/privacy">Privacy Policy</Link>)</li>
        <li>Your subscription ends and you do not renew within the grace period</li>
      </ul>
      <p>
        <strong>Exception:</strong> Content may be retained for legal compliance, dispute resolution, or backup purposes
        (typically 90 days post-deletion).
      </p>

      <h3>3.4 User Responsibilities</h3>
      <p>When uploading content to Effinity, you represent and warrant that:</p>
      <ul>
        <li><strong>You own the content</strong> or have the necessary rights and permissions to upload it</li>
        <li><strong>The content does not infringe</strong> on any third-party copyrights, trademarks, or privacy rights</li>
        <li><strong>The content complies</strong> with applicable laws and our <Link href="/legal/terms">Terms of Use</Link></li>
        <li><strong>You have obtained consent</strong> from individuals depicted in photos/videos (where applicable)</li>
      </ul>
      <p><strong>Violation of these warranties may result in account suspension and legal action.</strong></p>

      <h2 id="ai-content">4. AI-Generated Content</h2>
      
      <h3>4.1 AI Features on Effinity</h3>
      <p>Effinity uses <strong>OpenAI APIs</strong> and proprietary algorithms to generate content, including:</p>
      <ul>
        <li>Property descriptions and listings (Real Estate)</li>
        <li>Lead insights and recommendations (E-Commerce)</li>
        <li>Content summaries and suggestions (Productions)</li>
        <li>Automated reports and analytics</li>
      </ul>

      <h3>4.2 Ownership of AI-Generated Content</h3>
      <p>
        <strong>Effinity retains ownership</strong> of AI-generated content produced by the Platform's AI features,
        including:
      </p>
      <ul>
        <li><strong>Recommendations and Insights</strong>: AI-generated suggestions, predictions, and analytics</li>
        <li><strong>Automated Reports</strong>: System-generated dashboards, summaries, and data visualizations</li>
        <li><strong>Content Suggestions</strong>: AI-drafted property descriptions, email templates, and messaging</li>
      </ul>

      <h3>4.3 User License to AI Content</h3>
      <p>You are granted a <strong>non-exclusive, non-transferable license</strong> to:</p>
      <ul>
        <li>Use AI-generated content within the Platform for your business operations</li>
        <li>Copy AI-generated text for use in your own marketing materials</li>
        <li>Modify AI-generated content to suit your needs</li>
      </ul>
      <p>You may <strong>NOT</strong>:</p>
      <ul>
        <li><strong>Extract and commercialize</strong> AI-generated content independently (e.g., reselling as a service)</li>
        <li><strong>Reverse-engineer</strong> AI models or algorithms used by Effinity</li>
        <li><strong>Claim ownership</strong> of AI-generated outputs as your original work</li>
      </ul>

      <h3>4.4 AI Data Processing Rights</h3>
      <p>By using AI features, you grant Effinity the right to:</p>
      <ul>
        <li><strong>Process your inputs</strong> (prompts, property data, lead information) to generate AI outputs</li>
        <li><strong>Anonymize and aggregate</strong> AI usage data to improve models</li>
        <li><strong>Use AI outputs</strong> to train and improve Effinity's proprietary models</li>
      </ul>
      <p>
        <strong>Important:</strong> Under OpenAI's API Terms, your prompts and data are <strong>not used by OpenAI to
        train their models</strong>. Data is processed solely for generating outputs.
      </p>

      <h2 id="prohibited-content">5. Prohibited Content</h2>
      <p>You may <strong>NOT</strong> upload or create content on Effinity that:</p>

      <h3>5.1 Violates Intellectual Property Rights</h3>
      <ul>
        <li>Copyrighted material without authorization (photos, videos, text, music)</li>
        <li>Trademarked logos, brands, or designs used without permission</li>
        <li>Plagiarized or stolen content from other sources</li>
      </ul>

      <h3>5.2 Contains Harmful or Illegal Material</h3>
      <ul>
        <li>Malware, viruses, or malicious code</li>
        <li>Content depicting illegal activities (fraud, theft, violence)</li>
        <li>Child sexual abuse material (CSAM) — zero tolerance, immediate reporting to authorities</li>
      </ul>

      <h3>5.3 Violates Privacy or Consent</h3>
      <ul>
        <li>Personal information of individuals without consent (doxxing)</li>
        <li>Photos or videos of individuals without their consent</li>
        <li>Confidential or proprietary information stolen from third parties</li>
      </ul>

      <h3>5.4 Is Defamatory or Abusive</h3>
      <ul>
        <li>Defamatory content targeting individuals or businesses</li>
        <li>Harassment, hate speech, or discriminatory content</li>
        <li>Obscene or pornographic material</li>
      </ul>

      <p><strong>Violation of these prohibitions will result in:</strong></p>
      <ul>
        <li>Immediate removal of prohibited content</li>
        <li>Account suspension or termination</li>
        <li>Reporting to law enforcement (where legally required)</li>
        <li>No refunds for paid services</li>
      </ul>

      <h2 id="dmca">6. Copyright Infringement and DMCA</h2>
      
      <h3>6.1 DMCA Compliance</h3>
      <p>
        Effinity complies with the <strong>Digital Millennium Copyright Act (DMCA)</strong> and equivalent international
        laws. If you believe your copyrighted work has been infringed on Effinity:
      </p>
      
      <h4>DMCA Takedown Requests</h4>
      <ul>
        <li><strong>Email</strong>: legal@effinity.co.il</li>
        <li><strong>Subject</strong>: "DMCA Takedown Request"</li>
        <li><strong>Include</strong>:
          <ol>
            <li>Identification of the copyrighted work</li>
            <li>URL or location of the infringing content on Effinity</li>
            <li>Your contact information (name, email, phone)</li>
            <li>A statement that you have a good faith belief that the use is not authorized</li>
            <li>A statement that the information is accurate and you are authorized to act</li>
            <li>Your physical or electronic signature</li>
          </ol>
        </li>
      </ul>
      <p><strong>Response Time:</strong> We aim to respond within 72 hours and will remove infringing content if the claim is valid.</p>

      <h3>6.2 Counter-Notification</h3>
      <p>If your content was removed due to a DMCA claim and you believe it was removed in error:</p>
      <ul>
        <li><strong>Email</strong>: legal@effinity.co.il</li>
        <li><strong>Subject</strong>: "DMCA Counter-Notification"</li>
      </ul>

      <h3>6.3 Repeat Infringer Policy</h3>
      <p>Users who repeatedly upload infringing content will have their accounts permanently terminated.</p>

      <h2 id="contact">7. Contact Us</h2>
      <p>If you have questions about content rights or media usage:</p>
      <ul>
        <li><strong>Effinity Legal Team</strong></li>
        <li><strong>Owner</strong>: Lia Mesika</li>
        <li><strong>Email</strong>: legal@effinity.co.il</li>
        <li><strong>DMCA Agent</strong>: legal@effinity.co.il</li>
        <li><strong>Website</strong>: https://effinity.co.il</li>
      </ul>

      <hr />
      <p className="text-center text-sm text-gray-600 mt-8">
        <strong>© 2025 Effinity. All rights reserved.</strong>
        <br />
        Proprietary system developed by Lia Mesika.
        <br />
        Protected under Israeli Copyright Law and international IP conventions.
      </p>
    </LegalLayout>
  );
}
