import { Metadata } from 'next';
import { Target, Users, Award, TrendingUp } from 'lucide-react';
import { CTASection } from '@/components/marketing/CTASection';

export const metadata: Metadata = {
  title: 'About Us - EFFINITY Real Estate Platform',
  description:
    'Learn about EFFINITY, our mission to transform real estate management, and meet the team behind the platform.',
};

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Customer-First',
      description:
        'Every feature we build starts with customer feedback. We\'re obsessed with making real estate professionals more successful.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description:
        'We believe the best solutions come from working together. Our platform enables seamless team collaboration.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description:
        'We hold ourselves to the highest standards. Quality, reliability, and security are non-negotiable.',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description:
        'The real estate industry is evolving. We stay ahead by embracing new technologies and methods.',
    },
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      title: 'CEO & Co-Founder',
      bio: '15 years in real estate technology',
    },
    {
      name: 'Michael Chen',
      title: 'CTO & Co-Founder',
      bio: 'Former engineering lead at major tech companies',
    },
    {
      name: 'Jennifer Martinez',
      title: 'VP of Product',
      bio: 'Product expert with deep real estate industry knowledge',
    },
    {
      name: 'David Kim',
      title: 'VP of Engineering',
      bio: 'Built scalable systems for millions of users',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E1A2B] via-[#1A2F4B] to-[#2979FF] text-white py-20 sm:py-24">
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              We're transforming real estate management
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              EFFINITY was founded by real estate professionals who were frustrated
              with outdated, complicated software. We built the platform we always
              wanted.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-6">
                Our mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                To empower real estate professionals with technology that's powerful,
                intuitive, and designed specifically for their needs. We believe that
                managing properties and leads shouldn't require a computer science
                degree.
              </p>
              <p className="text-lg text-gray-600">
                Every day, we're working to make EFFINITY the most loved platform in
                real estate. We listen to our customers, iterate quickly, and never
                stop improving.
              </p>
            </div>
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl"></div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Our values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={28} className="text-blue-700" />
                  </div>
                  <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-base text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Meet the team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Led by experienced professionals from real estate and technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="text-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-blue-700 mb-2">
                  {member.title}
                </p>
                <p className="text-sm text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              By the numbers
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-semibold text-blue-700 mb-2">
                500+
              </div>
              <p className="text-base text-gray-600">Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-semibold text-blue-700 mb-2">
                10K+
              </div>
              <p className="text-base text-gray-600">Properties Managed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-semibold text-blue-700 mb-2">
                50K+
              </div>
              <p className="text-base text-gray-600">Leads Tracked</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-semibold text-blue-700 mb-2">
                99.9%
              </div>
              <p className="text-base text-gray-600">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section className="py-16 sm:py-24" id="careers">
        <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-6">
            Join our team
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We're always looking for talented people who are passionate about real
            estate technology. Check out our open positions or send us your resume.
          </p>
          <a
            href="mailto:careers@effinity.com"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-all duration-200"
          >
            View Open Positions
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        headline="Ready to transform your business?"
        subtext="Join 500+ real estate professionals using EFFINITY"
        primaryCTA={{ text: 'Start Free Trial', href: '/register' }}
        secondaryCTA={{ text: 'Contact Us', href: '/contact' }}
      />
    </>
  );
}
