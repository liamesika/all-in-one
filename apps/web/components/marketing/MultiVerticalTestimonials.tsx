'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Effinity's Real Estate system transformed our property management. Lead response time dropped from hours to minutes, conversion rate doubled.",
    author: "Sarah Cohen",
    title: "Managing Broker",
    company: "Elite Realty Group",
    vertical: "Real Estate",
    color: "blue"
  },
  {
    quote: "The E-Commerce automation saved us 25+ hours per week. Order tracking and marketing sequences work flawlessly across all channels.",
    author: "David Chen",
    title: "E-Commerce Director",
    company: "Modern Retail Co",
    vertical: "E-Commerce",
    color: "purple"
  },
  {
    quote: "Managing 15 concurrent productions became effortless. Budget tracking, timeline management, and asset delivery all in one place.",
    author: "Rachel Green",
    title: "Production Manager",
    company: "Creative Studios",
    vertical: "Productions",
    color: "orange"
  },
  {
    quote: "The Law vertical handles our entire practice. Case management, billing, and document automation work seamlessly together.",
    author: "Michael Levi",
    title: "Senior Partner",
    company: "Levi & Associates",
    vertical: "Law",
    color: "teal"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

export function MultiVerticalTestimonials() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-4">
            Trusted Across Industries
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See how businesses from every vertical achieve measurable results with Effinity
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {testimonials.map((testimonial) => {
            const colorMap = {
              blue: 'from-blue-500 to-blue-700',
              purple: 'from-purple-500 to-purple-700',
              orange: 'from-orange-500 to-orange-700',
              teal: 'from-teal-500 to-teal-700'
            };

            return (
              <motion.div
                key={testimonial.author}
                variants={cardVariants}
                className="group"
              >
                <div className="h-full p-8 rounded-2xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {/* Quote Icon */}
                  <div className={`
                    w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[testimonial.color as keyof typeof colorMap]}
                    flex items-center justify-center mb-4
                  `}>
                    <Quote size={20} className="text-white" />
                  </div>

                  {/* Quote */}
                  <blockquote className="text-base text-gray-700 leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.company}
                      </div>
                    </div>
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-medium text-white
                      bg-gradient-to-r ${colorMap[testimonial.color as keyof typeof colorMap]}
                    `}>
                      {testimonial.vertical}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white"
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold mb-1">500+</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold mb-1">98%</div>
            <div className="text-sm text-gray-400">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold mb-1">$100M+</div>
            <div className="text-sm text-gray-400">Revenue Managed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold mb-1">4</div>
            <div className="text-sm text-gray-400">Complete Systems</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
