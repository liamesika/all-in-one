'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  employeeCount: string;
  industry: string;
  purpose: string;
}

interface FormErrors {
  [key: string]: string;
}

export function PublicLeadForm() {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    employeeCount: '',
    industry: '',
    purpose: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/public/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMap: FormErrors = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            errorMap[err.field] = err.message;
          });
          setErrors(errorMap);
        }
        toast.error(data.message || 'Please check the form and try again');
        return;
      }

      // Success
      setIsSuccess(true);
      toast.success('Thank you! We will contact you soon.');

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          employeeCount: '',
          industry: '',
          purpose: '',
        });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-12 bg-white rounded-2xl shadow-xl border border-gray-200 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Thank You!
        </h3>
        <p className="text-gray-600">
          We've received your information and will contact you shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Get Started with Effinity
          </h2>
          <p className="text-gray-600">
            Fill out the form below and we'll reach out to discuss how Effinity can help your business grow.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Your company name"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.companyName}
              </p>
            )}
          </div>

          {/* Contact Person */}
          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.contactPerson ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Your full name"
            />
            {errors.contactPerson && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.contactPerson}
              </p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Employee Count & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees <span className="text-red-500">*</span>
              </label>
              <select
                id="employeeCount"
                name="employeeCount"
                value={formData.employeeCount}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.employeeCount ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
              >
                <option value="">Select range</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="200+">200+</option>
              </select>
              {errors.employeeCount && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.employeeCount}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry / Profession <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.industry ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="e.g., Real Estate, E-commerce"
              />
              {errors.industry && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.industry}
                </p>
              )}
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
              Purpose / Goal for Using the System <span className="text-red-500">*</span>
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 border ${
                errors.purpose ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
              placeholder="Tell us about your business needs and goals..."
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.purpose}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Request
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
