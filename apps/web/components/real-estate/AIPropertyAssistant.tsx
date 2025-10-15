'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { UniversalButton, UniversalCard } from '@/components/shared';
import { modalVariants } from '@/lib/animations/variants';

interface AIPropertyAssistantProps {
  propertyId: string;
  currentDescription?: string;
  onSuggestionApplied?: (newDescription: string) => void;
}

export function AIPropertyAssistant({ propertyId, currentDescription, onSuggestionApplied }: AIPropertyAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');

  const generateSuggestion = async () => {
    setIsLoading(true);
    
    // Simulate AI call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSuggestion('Stunning 4-bedroom villa in prime Tel Aviv location. Features include modern kitchen with high-end appliances, spacious living areas with natural light, master suite with en-suite bathroom, and private garden. Walking distance to shops, restaurants, and public transport. Perfect for families seeking luxury and convenience.');
    setIsLoading(false);
  };

  const applySuggestion = () => {
    if (onSuggestionApplied && suggestion) {
      onSuggestionApplied(suggestion);
      setIsOpen(false);
    }
  };

  return (
    <>
      <UniversalButton
        variant="outline"
        leftIcon={<Sparkles className="w-4 h-4" />}
        onClick={() => {
          setIsOpen(true);
          if (!suggestion) generateSuggestion();
        }}
        className="!bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700"
      >
        AI Enhance
      </UniversalButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Property Assistant</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enhance your property description</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {currentDescription && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Description:</p>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                      {currentDescription}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Suggestion:</p>
                  {isLoading ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#2979FF] animate-spin mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Generating description...</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg text-sm text-gray-900 dark:text-white border border-purple-200 dark:border-purple-700">
                      {suggestion}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                <UniversalButton variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </UniversalButton>
                <UniversalButton
                  variant="primary"
                  leftIcon={<Check className="w-4 h-4" />}
                  onClick={applySuggestion}
                  disabled={isLoading || !suggestion}
                >
                  Apply Suggestion
                </UniversalButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
