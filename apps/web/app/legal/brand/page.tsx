// app/legal/brand/page.tsx
import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand & Trademark Policy',
  description: 'Effinity trademark protection and brand usage guidelines',
};

export default function BrandPolicyPage() {
  return (
    <LegalLayout title="Brand Protection and Trademark Usage Policy" lastUpdated="January 15, 2025">
      <h2 id="trademark-declaration">1. Trademark Declaration</h2>
      <p>
        <strong>"Effinity"</strong> is a proprietary and protected mark owned exclusively by <strong>Lia Mesika</strong>.
      </p>
      <p>
        All rights, title, and interest in the Effinity name, logo, branding elements, and associated marks are
        reserved under Israeli Trademark Law, common law trademark rights, and international trademark conventions
        (Madrid Protocol, Nice Classification).
      </p>

      <h2 id="protected-elements">2. Protected Brand Elements</h2>
      
      <h3>2.1 Word Marks</h3>
      <ul>
        <li><strong>"Effinity"</strong> (in any language, script, or transliteration)</li>
        <li><strong>"Effinity Platform"</strong></li>
        <li>Any confusingly similar variations (e.g., "Effinity Pro", "Effinity Studio")</li>
      </ul>

      <h3>2.2 Visual Marks</h3>
      <ul>
        <li>The Effinity logo in all formats and variations</li>
        <li>Effinity brand colors and color combinations</li>
        <li>Effinity iconography and graphic elements</li>
        <li>The distinctive visual "look and feel" of the Platform</li>
      </ul>

      <h3>2.3 Domain Names</h3>
      <ul>
        <li><strong>effinity.co.il</strong> (primary domain)</li>
        <li>Any domains containing "effinity" registered by Lia Mesika</li>
        <li>Social media handles: @effinity, @effinityplatform</li>
      </ul>

      <h2 id="prohibited-uses">3. Prohibited Uses</h2>
      
      <h3>3.1 Unauthorized Commercial Use</h3>
      <p>You may <strong>NOT</strong> use the Effinity name or logo to:</p>
      <ul>
        <li>Create competing products or services</li>
        <li>Imply endorsement, sponsorship, or affiliation without written consent</li>
        <li>Sell merchandise, products, or services branded with Effinity marks</li>
        <li>Register domain names, social media accounts, or business names containing "Effinity"</li>
      </ul>

      <h3>3.2 Confusing or Misleading Use</h3>
      <p>You may <strong>NOT</strong>:</p>
      <ul>
        <li>Create logos, brands, or designs confusingly similar to Effinity</li>
        <li>Use "Effinity" in ways that mislead consumers about the source of goods/services</li>
        <li>Combine "Effinity" with other terms to create derivative brand names</li>
        <li>Use Effinity marks in a manner that disparages or damages the brand</li>
      </ul>

      <h3>3.3 Dilution and Tarnishment</h3>
      <p>You may <strong>NOT</strong>:</p>
      <ul>
        <li>Use Effinity marks in connection with adult content, illegal activities, or unethical businesses</li>
        <li>Modify, alter, or distort the Effinity logo or branding</li>
        <li>Use Effinity marks in a way that diminishes their distinctiveness</li>
      </ul>

      <h2 id="authorized-use">.4 Authorized Use Cases</h2>
      
      <h3>4.1 Nominative Fair Use</h3>
      <p>Limited use is permitted when:</p>
      <ul>
        <li>Referring to Effinity Platform in factual discussions, reviews, or comparisons</li>
        <li>The use is necessary to identify Effinity as the subject of discussion</li>
        <li>No implication of endorsement or affiliation is made</li>
        <li>The use does not suggest official sponsorship</li>
      </ul>
      <p><strong>Example:</strong> "Our company uses Effinity for real estate lead management."</p>

      <h3>4.2 Partner and Affiliate Use</h3>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
        <p className="text-sm text-blue-900">
          <strong>"Powered by Effinity"</strong> branding may be used <strong>ONLY</strong> under explicit licensing
          agreement.
        </p>
      </div>

      <h4>Requirements for "Powered by Effinity" Use:</h4>
      <ol>
        <li><strong>Written Authorization</strong>: Must have signed licensing agreement with Effinity</li>
        <li><strong>Approved Format</strong>: Use only pre-approved logo and text formats provided by Effinity</li>
        <li><strong>No Modification</strong>: Cannot alter, crop, or change colors of approved marks</li>
        <li><strong>Clear Attribution</strong>: Must clearly indicate that Effinity is a third-party service</li>
        <li><strong>Quality Standards</strong>: Use must meet Effinity's quality and ethical standards</li>
      </ol>

      <h4>Application Process:</h4>
      <ul>
        <li><strong>Email</strong>: partnerships@effinity.co.il</li>
        <li><strong>Subject</strong>: "Partner Branding Request"</li>
        <li><strong>Include</strong>: Business description, intended use case, mockups of proposed branding</li>
      </ul>
      <p><strong>Approval is at Effinity's sole discretion and may be revoked at any time.</strong></p>

      <h2 id="brand-guidelines">5. Brand Guidelines and Visual Standards</h2>
      
      <h3>5.1 Logo Usage</h3>
      <p>When authorized to use the Effinity logo:</p>
      
      <h4>DO:</h4>
      <ul>
        <li>Use official logo files provided by Effinity</li>
        <li>Maintain minimum clear space around the logo</li>
        <li>Use approved color variations (full color, white, black)</li>
        <li>Ensure logo is legible (minimum 40px height for digital)</li>
      </ul>

      <h4>DON'T:</h4>
      <ul>
        <li>Rotate, skew, or distort the logo</li>
        <li>Change logo colors or add effects (shadows, gradients, outlines)</li>
        <li>Place logo on busy backgrounds where legibility is compromised</li>
        <li>Combine logo with other logos or graphics</li>
      </ul>

      <h2 id="enforcement">6. Enforcement and Remedies</h2>
      
      <h3>6.1 Cease and Desist</h3>
      <p>Upon discovery of unauthorized use, Effinity will:</p>
      <ul>
        <li>Send formal cease and desist letter demanding immediate cessation</li>
        <li>Require removal of all infringing materials within <strong>7 days</strong></li>
        <li>Demand transfer of infringing domain names or social accounts</li>
      </ul>

      <h3>6.2 Legal Action</h3>
      <p>Continued infringement will result in:</p>
      <ul>
        <li><strong>Trademark Infringement Lawsuit</strong> under Israeli and international law</li>
        <li><strong>Claims for Damages</strong>: Actual damages, lost profits, or statutory damages</li>
        <li><strong>Injunctive Relief</strong>: Court orders to stop infringing activities</li>
        <li><strong>Attorney Fees</strong>: Recovery of all legal costs</li>
        <li><strong>Domain Seizure</strong>: UDRP proceedings to transfer infringing domains</li>
      </ul>

      <h3>6.3 Criminal Penalties</h3>
      <p>In cases of willful trademark counterfeiting:</p>
      <ul>
        <li>Criminal prosecution under Israeli law</li>
        <li>Fines and imprisonment</li>
        <li>Seizure and destruction of counterfeit goods</li>
      </ul>

      <h2 id="reporting">7. Reporting Trademark Infringement</h2>
      <p>If you become aware of unauthorized use of Effinity trademarks:</p>
      <ul>
        <li><strong>Email</strong>: legal@effinity.co.il</li>
        <li><strong>Subject</strong>: "Trademark Infringement Report"</li>
        <li><strong>Include</strong>:
          <ul>
            <li>Description of the infringement</li>
            <li>URL or location of infringing content</li>
            <li>Evidence (screenshots, links, documents)</li>
            <li>Your contact information</li>
          </ul>
        </li>
      </ul>

      <h2 id="licensing">8. Requesting Permission</h2>
      <p>To request permission to use Effinity trademarks:</p>
      <ul>
        <li><strong>Email</strong>: legal@effinity.co.il</li>
        <li><strong>Subject</strong>: "Trademark Usage Request"</li>
        <li><strong>Include</strong>:
          <ul>
            <li>Your name, company, and contact information</li>
            <li>Detailed description of intended use</li>
            <li>Mockups or examples of how marks will be displayed</li>
            <li>Duration and geographic scope of use</li>
            <li>Commercial or non-commercial nature</li>
          </ul>
        </li>
      </ul>
      <p><strong>Response Time:</strong> We aim to respond within 14 business days.</p>

      <h2 id="contact">9. Contact Information</h2>
      <p>For trademark-related inquiries:</p>
      <ul>
        <li><strong>Effinity Legal Team</strong></li>
        <li><strong>Owner</strong>: Lia Mesika</li>
        <li><strong>Email</strong>: legal@effinity.co.il</li>
        <li><strong>Partnerships</strong>: partnerships@effinity.co.il</li>
        <li><strong>Website</strong>: https://effinity.co.il</li>
      </ul>

      <hr />
      <p className="text-center text-sm text-gray-600 mt-8">
        <strong>© 2025 Effinity. All rights reserved.</strong>
        <br />
        Effinity™ is a proprietary mark of Lia Mesika.
        <br />
        Protected under Israeli Trademark Law and international IP conventions.
      </p>
    </LegalLayout>
  );
}
