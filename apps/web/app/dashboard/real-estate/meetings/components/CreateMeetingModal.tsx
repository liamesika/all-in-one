'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateMeetingModalProps {
  onClose: () => void;
  onCreate: (data: any) => void;
}

export default function CreateMeetingModal({ onClose, onCreate }: CreateMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start: '',
    end: '',
    status: 'SCHEDULED'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A2F4B] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Schedule New Meeting</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-[#0E1A2B] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
              placeholder="Property viewing, Client consultation, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                className="w-full px-4 py-2 bg-[#0E1A2B] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#2979FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                className="w-full px-4 py-2 bg-[#0E1A2B] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#2979FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-[#0E1A2B] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
              placeholder="Office address, Zoom link, property address, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-[#0E1A2B] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
              placeholder="Meeting agenda, notes, etc."
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#2979FF] text-white rounded-lg hover:bg-[#1E5FCC] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Meeting'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
