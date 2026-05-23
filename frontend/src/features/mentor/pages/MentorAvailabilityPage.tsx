import { useEffect, useState } from 'react';
import { mentorAvailabilityApi } from '../services/mentorAvailabilityApi';
import type { WeeklyAvailability, TimeSlot } from '../types/availability';
import { getCurrentTimezone } from '../utils/timezone';
import { showError, showSuccess } from '../../../shared/utils/toast.util';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type DayOfWeek = typeof DAYS_OF_WEEK[number];

const ALL_DAY_SLOT: TimeSlot = { startTime: '00:00', endTime: '23:59' };

const isAllDay = (slots: TimeSlot[]) =>
  slots.length === 1 &&
  slots[0].startTime === ALL_DAY_SLOT.startTime &&
  slots[0].endTime === ALL_DAY_SLOT.endTime;

const MentorAvailabilityPage = () => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>({});
  const [timezone, setTimezone] = useState(getCurrentTimezone());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('17:00');
  const [repeatAll, setRepeatAll] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      const res = await mentorAvailabilityApi.getMyAvailability();
      if (res.data?.weeklyAvailability) {
        setWeeklyAvailability(res.data.weeklyAvailability);
      }
      if (res.data?.timezone) {
        setTimezone(res.data.timezone);
      }
    } catch (error) {
      console.error('Failed to load availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await mentorAvailabilityApi.upsertAvailability({
        timezone,
        weeklyAvailability
      });
      showSuccess('Availability saved successfully!');
    } catch (error: unknown) {
      const msg =
        error instanceof Object && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      showError(msg || 'Failed to save availability');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSlot = () => {
    if (selectedDayIsAllDay && !repeatAll) {
      showError('Disable all-day mode for this day before adding custom slots');
      return;
    }

    if (newStartTime >= newEndTime) {
      showError('Start time must be before end time');
      return;
    }

    const newSlot: TimeSlot = { startTime: newStartTime, endTime: newEndTime };
    
    setWeeklyAvailability(prev => {
      const updated = { ...prev };
      
      if (repeatAll) {
        // Apply to all days
        DAYS_OF_WEEK.forEach(day => {
          updated[day] = [...(updated[day] || []), newSlot].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });
      } else {
        // Apply to selected day
        updated[selectedDay] = [...(updated[selectedDay] || []), newSlot].sort((a, b) => a.startTime.localeCompare(b.startTime));
      }

      return updated;
    });

    showSuccess('Time slot added locally. Remember to save changes.');
    setNewStartTime('09:00');
    setNewEndTime('17:00');
  };

  const handleRemoveSlot = (day: DayOfWeek, indexToRemove: number) => {
    setWeeklyAvailability(prev => {
      const updated = { ...prev };
      if (updated[day]) {
        updated[day] = updated[day]!.filter((_, idx) => idx !== indexToRemove);
      }
      return updated;
    });
  };

  const handleToggleAllDay = () => {
    setWeeklyAvailability(prev => {
      const currentSlots = prev[selectedDay] || [];
      return {
        ...prev,
        [selectedDay]: isAllDay(currentSlots) ? [] : [ALL_DAY_SLOT],
      };
    });
  };

  const selectedDaySlots = weeklyAvailability[selectedDay] || [];
  const selectedDayIsAllDay = isAllDay(selectedDaySlots);

  const handleDiscard = () => {
    loadAvailability();
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-gray-400">Loading availability...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Set Your Availability</h1>
          <p className="text-gray-400">
            Define the days and times you are available for mock interviews. Students can only book slots within these ranges.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#272b3a] bg-[#111111] text-sm text-gray-300">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timezone}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111111] border border-[#272b3a] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-white">Select Day</h2>
            </div>
            
            <div className="space-y-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    selectedDay === day 
                      ? 'bg-[var(--color-primary)] text-white font-medium'
                      : 'hover:bg-[#1a1d26] text-gray-400'
                  }`}
                >
                  <span className="capitalize">{day}</span>
                  {(weeklyAvailability[day]?.length || 0) > 0 && (
                    <span className={`w-2 h-2 rounded-full ${selectedDay === day ? 'bg-white' : 'bg-[var(--color-primary)]'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-[#272b3a] rounded-xl p-6">
            <h3 className="font-bold text-white mb-2">Quick Tip</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Maintaining consistent availability increases your chances of getting booked by 40%. Try to set recurring slots for peak hours.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white capitalize">{selectedDay}</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Available all day</span>
              <button
                type="button"
                role="switch"
                aria-checked={selectedDayIsAllDay}
                onClick={handleToggleAllDay}
                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                  selectedDayIsAllDay ? 'bg-[var(--color-primary)]' : 'bg-[#272b3a]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full transition-transform ${
                    selectedDayIsAllDay ? 'translate-x-4 bg-white' : 'translate-x-0 bg-gray-500'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mb-4 text-xs font-bold text-gray-500 tracking-wider">CONFIGURED TIME SLOTS</div>
          
          <div className="space-y-4 mb-8">
            {selectedDaySlots.length === 0 ? (
              <div className="bg-[#111111] border border-[#272b3a] rounded-xl p-8 flex items-center justify-center text-gray-500 border-dashed">
                No slots configured for this day.
              </div>
            ) : (
              selectedDaySlots.map((slot, idx) => (
                <div key={`${slot.startTime}-${idx}`} className="flex items-center justify-between bg-[#111111] border border-[#272b3a] rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-lg font-medium tracking-wider">
                      {slot.startTime} <span className="text-gray-500 mx-2">-</span> {slot.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleRemoveSlot(selectedDay, idx)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Slot Form */}
          <div className="border border-[#272b3a] rounded-xl p-6 border-dashed">
            <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add New Time Slot
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-2">Start Time</label>
                <input 
                  type="time" 
                  value={newStartTime}
                  onChange={e => setNewStartTime(e.target.value)}
                  disabled={selectedDayIsAllDay}
                  className="w-full bg-[#111111] border border-[#272b3a] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-2">End Time</label>
                <input 
                  type="time" 
                  value={newEndTime}
                  onChange={e => setNewEndTime(e.target.value)}
                  disabled={selectedDayIsAllDay}
                  className="w-full bg-[#111111] border border-[#272b3a] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
              <div className="col-span-1">
                <button 
                  onClick={handleAddSlot}
                  disabled={!newStartTime || !newEndTime || selectedDayIsAllDay}
                  className="w-full h-[42px] bg-[var(--color-primary)] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
                >
                  + Add Slot
                </button>
              </div>
            </div>

            {selectedDayIsAllDay && (
              <div className="mb-5 text-xs text-gray-500">
                All-day mode is active. Turn it off to add custom time slots.
              </div>
            )}

            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="repeatAll" 
                checked={repeatAll}
                onChange={e => setRepeatAll(e.target.checked)}
                className="w-4 h-4 rounded border-[#272b3a] bg-[#1a1d26] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <label htmlFor="repeatAll" className="text-sm text-gray-400 cursor-pointer">
                Repeat for all <span className="font-bold text-white capitalize">{selectedDay}s</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-8 border-t border-[#272b3a] flex justify-end gap-4">
            <button 
              onClick={handleDiscard}
              className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors font-medium"
            >
              Discard Changes
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2.5 bg-[var(--color-primary)] hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(45,95,255,0.3)]"
            >
              {isSaving ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorAvailabilityPage;
