'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
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
    setFormData({ name: '', email: '', company: '', message: '' });

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E1A2B] via-[#1A2F4B] to-[#2979FF] text-white py-20 sm:py-24">
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              Get in touch
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
                  Contact information
                </h2>
                <p className="text-lg text-gray-600">
                  Reach out to us through any of these channels, or use the form to
                  send us a message directly.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail size={24} className="text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      Email
                    </h3>
                    <a
                      href="mailto:contact@effinity.com"
                      className="text-base text-gray-600 hover:text-blue-700 transition-colors"
                    >
                      contact@effinity.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={24} className="text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      Phone
                    </h3>
                    <a
                      href="tel:+15551234567"
                      className="text-base text-gray-600 hover:text-blue-700 transition-colors"
                    >
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} className="text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      Office
                    </h3>
                    <p className="text-base text-gray-600">
                      123 Real Estate Ave
                      <br />
                      San Francisco, CA 94105
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-4">
                  Sales inquiries
                </h3>
                <p className="text-base text-gray-600 mb-2">
                  For Enterprise plans and custom solutions:
                </p>
                <a
                  href="mailto:sales@effinity.com"
                  className="text-base text-blue-700 hover:text-blue-800 font-semibold"
                >
                  sales@effinity.com
                </a>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-[1.125rem] font-semibold text-gray-900 mb-4">
                  Support
                </h3>
                <p className="text-base text-gray-600 mb-2">
                  For existing customers needing help:
                </p>
                <a
                  href="mailto:support@effinity.com"
                  className="text-base text-blue-700 hover:text-blue-800 font-semibold"
                >
                  support@effinity.com
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 border border-gray-200 rounded-2xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Send us a message
              </h2>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">
                    Thank you! Your message has been sent. We'll get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    placeholder="Your Company (optional)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
