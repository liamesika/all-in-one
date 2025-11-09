'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MeetingCalendarProps {
  meetings: any[];
  onMeetingClick: (meeting: any) => void;
}

export default function MeetingCalendar({ meetings, onMeetingClick }: MeetingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getMeetingsForDate = (date: Date | null) => {
    if (!date) return [];
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.start);
      return meetingDate.getDate() === date.getDate() &&
             meetingDate.getMonth() === date.getMonth() &&
             meetingDate.getFullYear() === date.getFullYear();
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-[#1A2F4B] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{monthName}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-4 py-2 bg-[#0E1A2B] text-white rounded-lg hover:bg-[#2979FF] transition-colors"
          >
            Today
          </button>
          <button
            onClick={previousMonth}
            className="p-2 bg-[#0E1A2B] text-white rounded-lg hover:bg-[#2979FF] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-[#0E1A2B] text-white rounded-lg hover:bg-[#2979FF] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
            {day}
          </div>
        ))}

        {/* Day Cells */}
        {days.map((date, index) => {
          const dayMeetings = getMeetingsForDate(date);
          const isToday = date &&
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 rounded-lg ${
                date ? 'bg-[#0E1A2B]' : ''
              } ${isToday ? 'ring-2 ring-[#2979FF]' : ''}`}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-[#2979FF]' : 'text-gray-300'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 3).map(meeting => (
                      <div
                        key={meeting.id}
                        onClick={() => onMeetingClick(meeting)}
                        className="text-xs p-1 rounded bg-[#2979FF]/20 text-[#2979FF] cursor-pointer hover:bg-[#2979FF]/30 transition-colors truncate"
                      >
                        {new Date(meeting.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {meeting.title}
                      </div>
                    ))}
                    {dayMeetings.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{dayMeetings.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
