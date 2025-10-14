'use client';

import { useState } from 'react';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';
import { Testimonial } from '@/components/marketing/Testimonial';

export default function DemoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    teamSize: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const benefits = [
    'Live walkthrough of all EFFINITY features',
    'Customized demo based on your business needs',
    'Q&A session with our product experts',
    'Best practices from successful customers',
    'Pricing and implementation guidance',
  ];

  const testimonials = [
    {
      quote:
        'The demo was incredibly helpful. Within 30 minutes, I understood exactly how EFFINITY would solve our lead management challenges.',
      author: 'Mark Thompson',
      title: 'Sales Director',
      company: 'Prestige Properties',
    },
    {
      quote:
        'Our account manager showed us features we didn\'t even know we needed. The personalized demo made our decision easy.',
      author: 'Lisa Chen',
      title: 'Operations Manager',
      company: 'Urban Realty Group',
    },
  ];

  if (isSubmitted) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
            Demo request received!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your interest in EFFINITY. Our team will contact you within
            24 hours to schedule your personalized demo.
          </p>
          <p className="text-base text-gray-600">
            In the meantime, feel free to explore our{' '}
            <a href="/features" className="text-blue-700 hover:text-blue-800 font-semibold">
              features page
            </a>{' '}
            or check out our{' '}
            <a href="/pricing" className="text-blue-700 hover:text-blue-800 font-semibold">
              pricing
            </a>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E1A2B] via-[#1A2F4B] to-[#2979FF] text-white py-20 sm:py-24">
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              See EFFINITY in action
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Schedule a personalized demo and discover how EFFINITY can transform
              your real estate business.
            </p>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              What to expect in your demo
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A 30-minute personalized walkthrough tailored to your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock size={28} className="text-blue-700" />
              </div>
              <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-2">
                30 Minutes
              </h3>
              <p className="text-base text-gray-600">
                Concise, focused walkthrough of features that matter to you
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-blue-700" />
              </div>
              <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-2">
                Live Expert
              </h3>
              <p className="text-base text-gray-600">
                One-on-one session with our product specialists
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={28} className="text-blue-700" />
              </div>
              <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-2">
                Flexible Scheduling
              </h3>
              <p className="text-base text-gray-600">
                Choose a time that works best for your schedule
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-4">
              Your demo will include:
            </h3>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Demo Request Form */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Request your demo
            </h2>
            <p className="text-lg text-gray-600">
              Fill out the form below and we'll contact you to schedule your demo
            </p>
          </div>

          <div className="bg-white p-8 border border-gray-200 rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Work Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Company Name *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label
                  htmlFor="teamSize"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Team Size *
                </label>
                <select
                  id="teamSize"
                  name="teamSize"
                  required
                  value={formData.teamSize}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="">Select team size</option>
                  <option value="1">Just me</option>
                  <option value="2-5">2-5 people</option>
                  <option value="6-10">6-10 people</option>
                  <option value="11-50">11-50 people</option>
                  <option value="51+">51+ people</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 text-base font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Request Demo'}
              </button>

              <p className="text-sm text-gray-500 text-center">
                By submitting this form, you agree to our Privacy Policy
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              What demo attendees say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial) => (
              <Testimonial
                key={testimonial.author}
                quote={testimonial.quote}
                author={testimonial.author}
                title={testimonial.title}
                company={testimonial.company}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
