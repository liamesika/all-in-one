'use client';

import { useLongPress } from '@/hooks/useLongPress';
import { isSameDay } from '@/lib/calendarUtils';
import { LawEvent } from '../types';

interface DayCellProps {
  date: Date | null;
  events: LawEvent[];
  focusedDay: Date | null;
  isToday: boolean;
  onDateClick: (date: Date) => void;
  onKeyDown: (e: React.KeyboardEvent, date: Date) => void;
  newEventId?: string | null;
}

export function DayCell({
  date,
  events,
  focusedDay,
  isToday,
  onDateClick,
  onKeyDown,
  newEventId,
}: DayCellProps) {
  const isFocused = date && isSameDay(focusedDay, date);

  const longPressHandlers = useLongPress({
    threshold: 500,
    moveTolerance: 10,
    onLongPress: () => {
      if (date) {
        onDateClick(date);
      }
    },
  });

  if (!date) {
    return (
      <div className="min-h-[100px] p-2 border border-white/10 rounded-lg bg-[#0f1a2c]" />
    );
  }

  const dateStr = date.toISOString().split('T')[0];

  return (
    <div
      role="gridcell"
      tabIndex={isFocused ? 0 : -1}
      aria-selected={isFocused}
      data-date={dateStr}
      onClick={() => onDateClick(date)}
      onKeyDown={(e) => onKeyDown(e, date)}
      {...longPressHandlers}
      className={`min-h-[100px] p-2 border rounded-lg transition-all cursor-pointer ${
        isToday
          ? 'border-amber-500 border-2 bg-[#1e3a5f]/30'
          : 'border-white/10 bg-[#1e3a5f]/20'
      } hover:bg-[#2a4a7a]/30 focus:outline-none ${
        isFocused ? 'ring-2 ring-amber-400' : ''
      }`}
    >
      {/* Day number */}
      <div className="text-sm font-medium text-white mb-2">{date.getDate()}</div>

      {/* Events */}
      {events.length > 0 ? (
        <div className="space-y-1">
          {events.slice(0, 3).map((event) => {
            const isNewEvent = event.id === newEventId;
            return (
              <div
                key={event.id}
                data-event-id={event.id}
                className={`text-xs p-1 rounded truncate bg-blue-500/20 text-blue-300 border border-blue-500/30 ${
                  isNewEvent ? 'ring-2 ring-amber-400/80 animate-pulse' : ''
                }`}
              >
                {event.title}
              </div>
            );
          })}
          {events.length > 3 && (
            <div className="text-xs text-gray-400">+{events.length - 3} more</div>
          )}
        </div>
      ) : (
        <div className="text-white/40 text-xs mt-2 hidden sm:block">
          No events yet — click to add
        </div>
      )}
    </div>
  );
}
