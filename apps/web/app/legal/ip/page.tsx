// app/legal/ip/page.tsx
import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intellectual Property & Copyright Notice',
  description: 'Effinity IP protection - Copyright, trademark, and trade secret protections',
};

export default function IPNoticePage() {
  return (
    <LegalLayout title="Intellectual Property & Copyright Notice" lastUpdated="January 15, 2025">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-sm text-red-900">
          <strong>Legal Warning:</strong> All design assets, source code, text, ideas, concepts, methodologies, and
          creative elements are the exclusive intellectual property of Lia Mesika (Effinity). Unauthorized copying,
          distribution, or imitation will result in legal action.
        </p>
      </div>

      <h2 id="declaration">1. Declaration of Ownership</h2>
      <p>
        All design assets, source code, text, ideas, concepts, methodologies, and creative elements appearing on or
        within the <strong>Effinity platform</strong> are the <strong>exclusive intellectual property</strong> of{' '}
        <strong>Lia Mesika</strong>.
      </p>
      <p>
        This includes, but is not limited to, software code, user interface designs, graphics, logos, business methods,
        workflows, and AI-generated content.
      </p>

      <h2 id="protected-works">2. Protected Works</h2>
      
      <h3>2.1 Software and Code</h3>
      <ul>
        <li>All source code, algorithms, and API endpoints</li>
        <li>Database schemas and data structures</li>
        <li>Backend logic and server-side processing</li>
        <li>Frontend components and JavaScript libraries</li>
      </ul>

      <h3>2.2 Visual Design and UI/UX</h3>
      <ul>
        <li>Page layouts, component libraries, and design systems</li>
        <li>Color palettes, typography, and visual identity</li>
        <li>Logos, icons, and graphical elements</li>
        <li>User flows, wireframes, and interaction patterns</li>
      </ul>

      <h3>2.3 Content and Copy</h3>
      <ul>
        <li>All text, documentation, and help articles</li>
        <li>Marketing materials and landing pages</li>
        <li>Email templates and notification messages</li>
        <li>Blog posts and educational content</li>
      </ul>

      <h3>2.4 Business Methods</h3>
      <ul>
        <li>Workflow automations and process designs</li>
        <li>Multi-vertical architecture and integration patterns</li>
        <li>Proprietary algorithms and methodologies</li>
        <li>Data models and business logic</li>
      </ul>

      <h3>2.5 AI-Generated Content</h3>
      <ul>
        <li>AI-powered insights and recommendations</li>
        <li>Property descriptions and automated reports</li>
        <li>Analytics and predictive models</li>
      </ul>

      <h2 id="prohibited-actions">3. Prohibited Actions</h2>
      
      <h3>3.1 Unauthorized Copying</h3>
      <p>You may <strong>NOT</strong> copy, reproduce, or duplicate:</p>
      <ul>
        <li>Source code, scripts, or software components</li>
        <li>Visual designs, UI layouts, or graphic elements</li>
        <li>Text, documentation, or marketing materials</li>
        <li>Database schemas or data structures</li>
      </ul>

      <h3>3.2 Reverse Engineering</h3>
      <p>You may <strong>NOT</strong>:</p>
      <ul>
        <li>Decompile, disassemble, or reverse-engineer the Platform</li>
        <li>Extract algorithms, business logic, or proprietary methods</li>
        <li>Analyze network traffic to discover API endpoints</li>
        <li>Attempt to recreate functionality through inspection</li>
      </ul>

      <h3>3.3 Redistribution and Resale</h3>
      <p>You may <strong>NOT</strong>:</p>
      <ul>
        <li>Resell, sublicense, or redistribute Effinity software or services</li>
        <li>Create competing products based on Effinity's design or functionality</li>
        <li>Offer Effinity as a white-label or rebranded solution</li>
      </ul>

      <h3>3.4 Brand Misuse</h3>
      <p>You may <strong>NOT</strong>:</p>
      <ul>
        <li>Use the "Effinity" name, logo, or branding without authorization</li>
        <li>Imply endorsement, sponsorship, or affiliation with Effinity</li>
        <li>Create confusingly similar brands or domain names</li>
      </ul>

      <h3>3.5 Competitive Use</h3>
      <p>You may <strong>NOT</strong>:</p>
      <ul>
        <li>Replicate Effinity's features, workflows, or user experience in competing products</li>
        <li>Use Effinity for competitive intelligence or benchmarking without permission</li>
        <li>Extract proprietary data or insights for use in rival services</li>
      </ul>

      <h2 id="enforcement">4. Enforcement and Legal Remedies</h2>
      
      <h3>4.1 Cease and Desist</h3>
      <p>Upon discovery of infringement:</p>
      <ul>
        <li>Formal cease and desist letter demanding immediate cessation</li>
        <li>Requirement to remove all infringing materials within <strong>7 days</strong></li>
        <li>Demand for transfer of infringing domain names or social accounts</li>
      </ul>

      <h3>4.2 Civil Lawsuits</h3>
      <p>Continued infringement will result in:</p>
      <ul>
        <li><strong>Copyright Infringement Lawsuit</strong> under Israeli and international law</li>
        <li><strong>Claims for Damages</strong>: Actual damages, lost profits, or statutory damages</li>
        <li><strong>Injunctive Relief</strong>: Court orders to stop infringing activities</li>
        <li><strong>Attorney Fees</strong>: Recovery of all legal costs</li>
      </ul>

      <h3>4.3 Criminal Prosecution</h3>
      <p>In cases of willful infringement:</p>
      <ul>
        <li>Criminal prosecution under Israeli Copyright Act</li>
        <li>Fines and imprisonment (up to <strong>5 years</strong> under Israeli law)</li>
        <li>Seizure and destruction of infringing materials</li>
      </ul>

      <h2 id="footer-notice">5. Website Footer Copyright Notice</h2>
      <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
        <p className="text-sm text-gray-800 leading-relaxed">
          <strong>© Effinity — All Rights Reserved</strong>
        </p>
        <p className="text-sm text-gray-700 mt-2">
          All images, text, videos, ideas, and designs appearing on this site are protected under copyright law and are
          the exclusive intellectual property of Lia Mesika (Effinity).
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Reproduction, distribution, or use of any materials without explicit written consent from Effinity is strictly
          prohibited and will result in legal action.
        </p>
      </div>

      <h2 id="reporting">6. Reporting Infringement</h2>
      <p>If you become aware of copyright or IP infringement involving Effinity:</p>
      <ul>
        <li><strong>Email</strong>: support@effinity.co.il</li>
        <li><strong>Subject</strong>: "IP Infringement Report"</li>
        <li><strong>Include</strong>:
          <ul>
            <li>Description of the infringement (unauthorized use, copying, reverse engineering)</li>
            <li>URL or location of infringing content</li>
            <li>Evidence of unauthorized use (screenshots, links, documents)</li>
            <li>Your contact information</li>
          </ul>
        </li>
      </ul>

      <h2 id="user-content">7. Your Content Rights</h2>
      <p>While Effinity owns the Platform itself, <strong>you retain ownership</strong> of content you upload:</p>
      <ul>
        <li>Properties, projects, leads, and business data</li>
        <li>Photos, videos, and documents you upload</li>
        <li>Client information and campaign data</li>
      </ul>
      <p>
        Effinity has a <strong>non-exclusive license</strong> to use your content solely for providing the service
        (storage, display, AI processing).
      </p>

      <h2 id="contact">8. Contact Information</h2>
      <p>For IP-related inquiries:</p>
      <ul>
        <li><strong>Owner</strong>: Lia Mesika</li>
        <li><strong>Email</strong>: support@effinity.co.il</li>
        <li><strong>Legal Department</strong>: legal@effinity.co.il</li>
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
