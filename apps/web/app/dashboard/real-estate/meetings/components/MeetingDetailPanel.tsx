'use client';

import { X, Calendar, MapPin, Users, Building2, Clock, Trash } from 'lucide-react';

interface MeetingDetailPanelProps {
  meeting: any;
  onClose: () => void;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

export default function MeetingDetailPanel({ meeting, onClose, onUpdate, onDelete }: MeetingDetailPanelProps) {
  const handleStatusChange = (status: string) => {
    onUpdate({ status });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-[#1A2F4B] border-l border-gray-700 z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{meeting.title}</h2>
            <span className={`text-xs px-2 py-1 rounded-full ${
              meeting.status === 'SCHEDULED' ? 'bg-green-500/20 text-green-400' :
              meeting.status === 'DONE' ? 'bg-blue-500/20 text-blue-400' :
              meeting.status === 'CANCELED' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {meeting.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Date & Time */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Date & Time</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4 text-[#2979FF]" />
              <span>{new Date(meeting.start).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-[#2979FF]" />
              <span>
                {new Date(meeting.start).toLocaleTimeString()} - {new Date(meeting.end).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Location */}
        {meeting.location && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Location</h3>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-[#2979FF]" />
              <span>{meeting.location}</span>
            </div>
          </div>
        )}

        {/* Agents */}
        {meeting.agentParticipants && meeting.agentParticipants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Agents ({meeting.agentParticipants.length})
            </h3>
            <div className="space-y-2">
              {meeting.agentParticipants.map((participant: any) => (
                <div key={participant.user.id} className="flex items-center gap-2 p-3 bg-[#0E1A2B] rounded-lg">
                  <Users className="w-5 h-5 text-[#2979FF]" />
                  <div>
                    <div className="text-white font-medium">{participant.user.fullName}</div>
                    <div className="text-xs text-gray-400">{participant.user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clients */}
        {meeting.clientParticipants && meeting.clientParticipants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Clients ({meeting.clientParticipants.length})
            </h3>
            <div className="space-y-2">
              {meeting.clientParticipants.map((participant: any) => (
                <div key={participant.client.id} className="p-3 bg-[#0E1A2B] rounded-lg">
                  <div className="text-white font-medium">{participant.client.fullName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties */}
        {meeting.propertyParticipants && meeting.propertyParticipants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Properties ({meeting.propertyParticipants.length})
            </h3>
            <div className="space-y-2">
              {meeting.propertyParticipants.map((participant: any) => (
                <div key={participant.property.id} className="flex items-center gap-2 p-3 bg-[#0E1A2B] rounded-lg">
                  <Building2 className="w-5 h-5 text-[#2979FF]" />
                  <div className="text-white font-medium">{participant.property.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {meeting.description && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Description</h3>
            <div className="p-3 bg-[#0E1A2B] rounded-lg">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{meeting.description}</p>
            </div>
          </div>
        )}

        {/* Status Actions */}
        {meeting.status === 'SCHEDULED' && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusChange('DONE')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleStatusChange('NO_SHOW')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                No Show
              </button>
              <button
                onClick={() => handleStatusChange('CANCELED')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors col-span-2"
              >
                Cancel Meeting
              </button>
            </div>
          </div>
        )}

        {/* Delete */}
        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={onDelete}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Trash className="w-4 h-4" />
            Delete Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
