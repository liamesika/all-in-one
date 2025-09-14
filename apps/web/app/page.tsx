'use client';

import { useState } from 'react';
import { Button } from '../components/ui';
import EffinityHeader from '../components/effinity-header';

type Industry = 'ecommerce' | 'realestate' | 'law';

export default function LandingPage() {
  const [industry, setIndustry] = useState<Industry>('ecommerce');

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Professional Header with Effinity Branding */}
      <EffinityHeader variant="landing" />

      {/* Hero Section - Premium Design */}
      <section className="relative text-center px-6 py-32 bg-gradient-to-br from-white via-blue-50/30 to-gray-50 animate-fade-in overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-300 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-gray-900 leading-tight mb-6 animate-fade-in-1">
              AI-Powered Efficiency for
              <span className="block bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent animate-float">
                Modern Teams
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-base md:text-xl font-normal text-gray-700 mb-12 leading-relaxed animate-fade-in-2">
              Transform your business operations with our intelligent platform. 
              <span className="block mt-2">One solution for Real Estate, E-commerce, and Law verticals.</span>
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in-3">
            <Button
              href="#industries"
              variant="primary"
              size="lg"
              className="shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Explore Solutions
            </Button>
            <Button
              href="#contact"
              variant="outline"
              size="lg"
              className="shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Get Started
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-normal text-gray-600 animate-fade-in-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions - Professional Cards */}
      <section id="industries" className="px-6 py-24 bg-gray-50 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">Industry Solutions</h2>
            <p className="max-w-3xl mx-auto text-base font-normal text-gray-600">
              Tailored AI-powered platforms designed specifically for your industry's unique needs and challenges.
            </p>
          </div>
          
          {/* Industry Tabs */}
          <div className="flex justify-center gap-4 flex-wrap mb-12">
            {(['ecommerce','realestate','law'] as Industry[]).map(key => {
              const icons = {
                ecommerce: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
                realestate: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
                law: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              };
              
              return (
                <button
                  key={key}
                  onClick={() => setIndustry(key)}
                  className={[
                    'group flex items-center gap-3 px-6 py-4 rounded-xl border text-sm font-semibold transition-all duration-300 transform hover:-translate-y-1',
                    industry === key
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-xl'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-lg hover:shadow-xl'
                  ].join(' ')}
                >
                  <svg className={`w-5 h-5 ${industry === key ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icons[key]}
                  </svg>
                  <span>
                    {key === 'ecommerce' && 'E-Commerce'}
                    {key === 'realestate' && 'Real Estate'}
                    {key === 'law' && 'Law Firms'}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Industry Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {industry === 'ecommerce' && 'E-Commerce Excellence'}
                    {industry === 'realestate' && 'Real Estate Mastery'}
                    {industry === 'law' && 'Legal Authority Platform'}
                  </h3>
                  <p className="text-base font-normal text-gray-600 leading-relaxed">
                    {industry === 'ecommerce' && 'Transform your online store with AI-powered product recommendations, intelligent inventory management, automated customer service, and conversion optimization. Drive more sales with advanced analytics and personalized shopping experiences.'}
                    {industry === 'realestate' && 'Revolutionize your real estate business with AI property matching, automated lead qualification, smart CRM integrations, market analysis tools, and virtual tour capabilities. Connect buyers with their perfect properties faster.'}
                    {industry === 'law' && 'Establish your legal authority with AI-powered case research, automated document generation, client intake optimization, appointment scheduling, and comprehensive SEO strategies. Attract and serve more clients efficiently.'}
                  </p>
                </div>
                
                {/* Feature List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {industry === 'ecommerce' && [
                    'AI Product Recommendations',
                    'Smart Inventory Management', 
                    'Conversion Optimization',
                    'Advanced Analytics Dashboard'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-sm font-normal text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {industry === 'realestate' && [
                    'AI Property Matching',
                    'Lead Qualification System',
                    'CRM Integration',
                    'Market Analysis Tools'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-sm font-normal text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {industry === 'law' && [
                    'AI Case Research',
                    'Document Automation',
                    'Client Intake System',
                    'SEO Optimization'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-sm font-normal text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
              <h4 className="text-lg font-semibold mb-6">Success Metrics</h4>
              <div className="space-y-6">
                {industry === 'ecommerce' && [
                  { metric: '45%', label: 'Avg. Conversion Increase' },
                  { metric: '60%', label: 'Customer Retention Boost' },
                  { metric: '3.2x', label: 'ROI Improvement' }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-3xl font-semibold text-white">{stat.metric}</span>
                    <span className="text-sm font-normal text-blue-100">{stat.label}</span>
                  </div>
                ))}
                
                {industry === 'realestate' && [
                  { metric: '50%', label: 'Faster Property Matching' },
                  { metric: '40%', label: 'More Qualified Leads' },
                  { metric: '2.8x', label: 'Deal Closure Rate' }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-3xl font-semibold text-white">{stat.metric}</span>
                    <span className="text-sm font-normal text-blue-100">{stat.label}</span>
                  </div>
                ))}
                
                {industry === 'law' && [
                  { metric: '65%', label: 'Faster Case Research' },
                  { metric: '50%', label: 'More Client Inquiries' },
                  { metric: '2.5x', label: 'Operational Efficiency' }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-3xl font-semibold text-white">{stat.metric}</span>
                    <span className="text-sm font-normal text-blue-100">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Effinity - Features Section */}
      <section id="about" className="px-6 py-24 bg-white animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">Why Choose EFFINITY?</h2>
            <p className="max-w-3xl mx-auto text-base font-normal text-gray-600">
              We combine cutting-edge AI technology, elegant design, and intelligent automation 
              to deliver platforms that don't just work — they excel.
            </p>
          </div>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
                title: 'AI-Powered Intelligence',
                description: 'Advanced machine learning algorithms that adapt to your business needs, providing intelligent insights and automation that grows with your success.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                title: 'Lightning Fast Performance',
                description: 'Optimized infrastructure and modern technology stack ensure your platform loads instantly, keeping your users engaged and conversions high.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
                title: 'Enterprise Security',
                description: 'Bank-level security protocols, encrypted data transmission, and compliance with industry standards keep your business and customers protected.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />,
                title: 'Advanced Analytics',
                description: 'Comprehensive dashboards and real-time reporting give you deep insights into performance, helping you make data-driven decisions.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
                title: '24/7 Expert Support',
                description: 'Our dedicated support team is available around the clock to ensure your platform runs smoothly and your questions are answered promptly.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />,
                title: 'Scalable Architecture',
                description: 'Built to handle growth from startup to enterprise, our platform scales seamlessly as your business expands and evolves.'
              }
            ].map((feature, i) => (
              <div key={i} className={`group bg-white rounded-xl border border-gray-200 p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-${(i % 3) + 1} card-interactive`}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-6 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                  <svg className={`w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">{feature.title}</h3>
                <p className="text-sm font-normal text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Professional CTA */}
      <section id="contact" className="px-6 py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 animate-fade-in relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full" />
            <div className="absolute bottom-32 right-32 w-48 h-48 border border-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-white/20 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="max-w-2xl mx-auto text-base font-normal text-blue-100 mb-12 leading-relaxed">
            Join thousands of businesses already using EFFINITY to streamline operations, 
            increase efficiency, and drive unprecedented growth.
          </p>
          
          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Get Started Today</h3>
              <form className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="w-full h-12 px-4 py-3 border border-white/30 rounded-xl bg-white/20 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full h-12 px-4 py-3 border border-white/30 rounded-xl bg-white/20 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>
                <div>
                  <select className="w-full h-12 px-4 py-3 border border-white/30 rounded-xl bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm">
                    <option value="" className="bg-blue-700 text-white">Select Industry</option>
                    <option value="ecommerce" className="bg-blue-700 text-white">E-Commerce</option>
                    <option value="realestate" className="bg-blue-700 text-white">Real Estate</option>
                    <option value="law" className="bg-blue-700 text-white">Law Firms</option>
                  </select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  Start Your Free Trial
                </Button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="text-left space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Let's Talk</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Email Us</p>
                      <p className="text-blue-100 text-sm">hello@effinity.ai</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Call Us</p>
                      <p className="text-blue-100 text-sm">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Available</p>
                      <p className="text-blue-100 text-sm">24/7 Support</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="pt-8 border-t border-white/20">
                <div className="flex flex-wrap gap-4">
                  <Button href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-all">
                    Free Trial
                  </Button>
                  <Button href="#industries" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-2 rounded-lg font-semibold transition-all">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">EFFINITY</h3>
                  <p className="text-xs font-normal text-gray-400">AI-powered efficiency for modern teams</p>
                </div>
              </div>
              <p className="text-sm font-normal text-gray-400 max-w-md leading-relaxed mb-6">
                Transform your business operations with our intelligent platform designed for Real Estate, E-commerce, and Law verticals.
              </p>
              <div className="flex gap-4">
                {['twitter', 'linkedin', 'github'].map((social, i) => (
                  <a key={i} href={`#${social}`} className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:transform hover:-translate-y-1">
                    <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      {social === 'twitter' && <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />}
                      {social === 'linkedin' && <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />}
                      {social === 'github' && <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                {['Dashboard', 'Analytics', 'Integrations', 'API Documentation'].map((link, i) => (
                  <li key={i}>
                    <a href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-sm font-normal text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                {['Help Center', 'Contact Us', 'Status Page', 'Security'].map((link, i) => (
                  <li key={i}>
                    <a href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-sm font-normal text-gray-400 hover:text-blue-400 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-wrap gap-6 text-sm font-normal text-gray-500">
              <span>© {new Date().getFullYear()} EFFINITY. All rights reserved.</span>
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-sm font-normal text-gray-500 hover:text-blue-400 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm font-normal text-gray-500 hover:text-blue-400 transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
