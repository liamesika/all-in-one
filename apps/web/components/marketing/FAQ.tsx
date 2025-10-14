'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-blue-700"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <span className="text-base font-semibold text-gray-900 pr-4">
              {item.question}
            </span>
            <ChevronDown
              size={20}
              className={`text-gray-600 flex-shrink-0 transition-transform duration-200 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`transition-all duration-200 ${
              openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
          >
            <div className="px-6 pb-6 text-base font-normal text-gray-600 leading-relaxed">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
