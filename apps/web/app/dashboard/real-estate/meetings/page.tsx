'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon, List, Users, MapPin, Clock } from 'lucide-react';
import { auth } from '@/lib/firebase';
import CreateMeetingModal from './components/CreateMeetingModal';
import MeetingDetailPanel from './components/MeetingDetailPanel';
import MeetingCalendar from './components/MeetingCalendar';

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start: string;
  end: string;
  status: string;
  agentParticipants: Array<{
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  }>;
  clientParticipants: Array<{
    client: {
      id: string;
      fullName: string;
    };
  }>;
  propertyParticipants: Array<{
    property: {
      id: string;
      name: string;
    };
  }>;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const fetchMeetings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/real-estate/meetings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [statusFilter]);

  const handleCreateMeeting = async (meetingData: any) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/real-estate/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchMeetings();
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const handleUpdateMeeting = async (id: string, updates: any) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('/api/real-estate/meetings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...updates })
      });

      if (response.ok) {
        setShowDetailPanel(false);
        fetchMeetings();
      }
    } catch (error) {
      console.error('Failed to update meeting:', error);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`/api/real-estate/meetings?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setShowDetailPanel(false);
        fetchMeetings();
      }
    } catch (error) {
      console.error('Failed to delete meeting:', error);
    }
  };

  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailPanel(true);
  };

  const upcomingMeetings = meetings.filter(m => new Date(m.start) >= new Date() && m.status === 'SCHEDULED');
  const pastMeetings = meetings.filter(m => new Date(m.start) < new Date() || m.status !== 'SCHEDULED');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-[#1A2F4B] rounded" />
            <div className="h-96 bg-[#1A2F4B] rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1A2B]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meetings</h1>
            <p className="text-gray-400">Schedule and manage client meetings</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#2979FF] text-white rounded-lg flex items-center gap-2 hover:bg-[#1E5FCC] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Meeting
          </button>
        </div>

        {/* View Toggle & Filters */}
        <div className="bg-[#1A2F4B] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  view === 'list' ? 'bg-[#2979FF] text-white' : 'bg-[#0E1A2B] text-gray-400'
                }`}
              >
                <List className="w-5 h-5" />
                List
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  view === 'calendar' ? 'bg-[#2979FF] text-white' : 'bg-[#0E1A2B] text-gray-400'
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
                Calendar
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#0E1A2B] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#2979FF]"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="DONE">Completed</option>
              <option value="CANCELED">Canceled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1A2F4B] rounded-xl p-4 border border-[#2979FF]/20">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-[#2979FF]" />
              <div>
                <div className="text-2xl font-bold text-white">{upcomingMeetings.length}</div>
                <div className="text-sm text-gray-400">Upcoming</div>
              </div>
            </div>
          </div>
          <div className="bg-[#1A2F4B] rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {meetings.filter(m => m.status === 'DONE').length}
                </div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
            </div>
          </div>
          <div className="bg-[#1A2F4B] rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {new Set(meetings.flatMap(m => m.clientParticipants.map(c => c.client.id))).size}
                </div>
                <div className="text-sm text-gray-400">Clients</div>
              </div>
            </div>
          </div>
          <div className="bg-[#1A2F4B] rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-white">{meetings.length}</div>
                <div className="text-sm text-gray-400">Total Meetings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {view === 'calendar' ? (
          <MeetingCalendar
            meetings={meetings}
            onMeetingClick={handleViewDetails}
          />
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            <div className="bg-[#1A2F4B] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Upcoming Meetings</h2>
              {upcomingMeetings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No upcoming meetings</p>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => handleViewDetails(meeting)}
                      className="p-4 bg-[#0E1A2B] rounded-lg hover:bg-[#1A2F4B] transition-colors cursor-pointer border border-transparent hover:border-[#2979FF]/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{meeting.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(meeting.start).toLocaleString()}
                            </div>
                            {meeting.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {meeting.location}
                              </div>
                            )}
                          </div>
                          {meeting.clientParticipants.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-300">
                                {meeting.clientParticipants.map(p => p.client.fullName).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            {pastMeetings.length > 0 && (
              <div className="bg-[#1A2F4B] rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Past Meetings</h2>
                <div className="space-y-3">
                  {pastMeetings.slice(0, 5).map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => handleViewDetails(meeting)}
                      className="p-4 bg-[#0E1A2B] rounded-lg hover:bg-[#1A2F4B] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{meeting.title}</h3>
                          <div className="text-sm text-gray-400">
                            {new Date(meeting.start).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          meeting.status === 'DONE' ? 'bg-green-500/20 text-green-400' :
                          meeting.status === 'CANCELED' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateMeeting}
        />
      )}

      {showDetailPanel && selectedMeeting && (
        <MeetingDetailPanel
          meeting={selectedMeeting}
          onClose={() => setShowDetailPanel(false)}
          onUpdate={(updates) => handleUpdateMeeting(selectedMeeting.id, updates)}
          onDelete={() => handleDeleteMeeting(selectedMeeting.id)}
        />
      )}
    </div>
  );
}
