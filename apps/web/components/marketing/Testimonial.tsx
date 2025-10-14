'use client';

import { Star } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  title: string;
  company: string;
  rating?: number;
}

export function Testimonial({
  quote,
  author,
  title,
  company,
  rating = 5,
}: TestimonialProps) {
  return (
    <div className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Rating Stars */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-base font-normal text-gray-700 mb-6 leading-relaxed">
        "{quote}"
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
          {author.charAt(0)}
        </div>
        <div>
          <div className="text-base font-semibold text-gray-900">{author}</div>
          <div className="text-sm font-normal text-gray-600">
            {title} at {company}
          </div>
        </div>
      </div>
    </div>
  );
}
