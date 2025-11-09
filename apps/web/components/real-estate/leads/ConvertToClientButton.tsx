'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { auth } from '@/lib/firebase';

interface ConvertToClientButtonProps {
  leadId: string;
  onSuccess?: (client: any) => void;
  className?: string;
}

export function ConvertToClientButton({ leadId, onSuccess, className = '' }: ConvertToClientButtonProps) {
  const [converting, setConverting] = useState(false);

  const handleConvert = async () => {
    if (!confirm('Convert this lead to a client? This action will mark the lead as CONVERTED.')) {
      return;
    }

    setConverting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`/api/real-estate/leads/${leadId}/convert-to-client`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert('Lead successfully converted to client!');
        if (onSuccess) {
          onSuccess(data.client);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to convert lead');
      }
    } catch (error) {
      console.error('Failed to convert lead:', error);
      alert('Failed to convert lead to client');
    } finally {
      setConverting(false);
    }
  };

  return (
    <button
      onClick={handleConvert}
      disabled={converting}
      className={`px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm ${className}`}
    >
      <UserPlus className="w-4 h-4" />
      {converting ? 'Converting...' : 'Convert to Client'}
    </button>
  );
}
