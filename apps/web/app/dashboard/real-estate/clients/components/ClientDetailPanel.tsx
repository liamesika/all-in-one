'use client';

import { X, Phone, Mail, Building2, Calendar, User, Trash, Edit } from 'lucide-react';

interface ClientDetailPanelProps {
  client: any;
  onClose: () => void;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

export default function ClientDetailPanel({ client, onClose, onUpdate, onDelete }: ClientDetailPanelProps) {
  const handleArchive = () => {
    onUpdate({ status: 'ARCHIVED' });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-[#1A2F4B] border-l border-gray-700 z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-[#2979FF] flex items-center justify-center text-white text-xl font-semibold">
                {client.fullName[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{client.fullName}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  client.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                  client.status === 'INACTIVE' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {client.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Contact Info */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Contact Information</h3>
          <div className="space-y-2">
            {client.phone && (
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-[#2979FF]" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-[#2979FF]" />
                <span>{client.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Agent */}
        {client.assignedAgent && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Assigned Agent</h3>
            <div className="flex items-center gap-2 p-3 bg-[#0E1A2B] rounded-lg">
              <User className="w-5 h-5 text-[#2979FF]" />
              <div>
                <div className="text-white font-medium">{client.assignedAgent.fullName}</div>
                <div className="text-xs text-gray-400">{client.assignedAgent.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Properties */}
        {client.properties && client.properties.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Linked Properties ({client.properties.length})
            </h3>
            <div className="space-y-2">
              {client.properties.map((link: any) => (
                <div key={link.property.id} className="p-3 bg-[#0E1A2B] rounded-lg">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-5 h-5 text-[#2979FF] mt-0.5" />
                    <div className="flex-1">
                      <div className="text-white font-medium">{link.property.name}</div>
                      {link.property.address && (
                        <div className="text-xs text-gray-400">{link.property.address}</div>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 mt-1 inline-block">
                        {link.property.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meetings */}
        {client.meetingParticipations && client.meetingParticipations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Meetings ({client.meetingParticipations.length})
            </h3>
            <div className="flex items-center gap-2 p-3 bg-[#0E1A2B] rounded-lg">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span className="text-white">{client.meetingParticipations.length} scheduled meetings</span>
            </div>
          </div>
        )}

        {/* Source */}
        {client.convertedFromLead && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Source</h3>
            <div className="p-3 bg-[#0E1A2B] rounded-lg">
              <div className="text-sm text-gray-300">
                Converted from lead
                {client.convertedFromLead.source && (
                  <span className="text-[#2979FF]"> ({client.convertedFromLead.source})</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {client.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Notes</h3>
            <div className="p-3 bg-[#0E1A2B] rounded-lg">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{client.notes}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-700">
          {client.status !== 'ARCHIVED' && (
            <button
              onClick={handleArchive}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
            >
              Archive
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
