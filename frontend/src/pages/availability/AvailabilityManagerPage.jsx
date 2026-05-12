import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../hooks/useAuth';
import {
  getMyAvailability,
  saveMyAvailability,
  updateMyAvailabilitySlot,
} from '../../services/availabilityService';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 12 }, (_, index) => index + 8);

const padHour = (hour) => `${String(hour).padStart(2, '0')}:00`;
const timeOptions = Array.from({ length: 13 }, (_, index) => padHour(index + 8));
const slotKey = (day, hour) => `${day}-${padHour(hour)}`;

const toSlot = (key) => {
  const [dayOfWeek, startTime] = key.split('-');
  const endHour = Number(startTime.slice(0, 2)) + 1;
  return {
    dayOfWeek,
    startTime,
    endTime: padHour(endHour),
  };
};

export default function AvailabilityManagerPage() {
  const { user } = useAuth();
  const [selectedSlots, setSelectedSlots] = useState(() => new Set());
  const [savedSlotsByKey, setSavedSlotsByKey] = useState(() => new Map());
  const [editingSlot, setEditingSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);

  const selectedCount = selectedSlots.size;
  const savedSlotCount = savedSlotsByKey.size;
  const bookedSlotCount = Array.from(savedSlotsByKey.values()).filter((slot) => slot.status === 'booked').length;
  const unsavedSlotCount = Array.from(selectedSlots).filter((key) => !savedSlotsByKey.has(key)).length;

  const loadAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyAvailability();
      const activeSlots = (response.data.slots || []).filter((slot) => slot.status !== 'cancelled');
      setSavedSlotsByKey(new Map(activeSlots.map((slot) => [`${slot.dayOfWeek}-${slot.startTime}`, slot])));
      setSelectedSlots(new Set(activeSlots.map((slot) => `${slot.dayOfWeek}-${slot.startTime}`)));
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to load availability'
        : 'Unable to load availability';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'Tutor') {
      queueMicrotask(loadAvailability);
    }
  }, [loadAvailability, user?.role]);

  const slots = useMemo(
    () => Array.from(selectedSlots).map(toSlot),
    [selectedSlots],
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'Tutor') {
    return <Navigate to="/student/dashboard" replace />;
  }

  const toggleSlot = (day, hour) => {
    const key = slotKey(day, hour);
    const savedSlot = savedSlotsByKey.get(key);

    if (savedSlot) {
      setEditingSlot({
        ...savedSlot,
        hasPendingBooking: savedSlot.status === 'booked',
      });
      return;
    }

    setSelectedSlots((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await saveMyAvailability(slots);
      const activeSlots = (response.data.slots || []).filter((slot) => slot.status !== 'cancelled');
      setSavedSlotsByKey(new Map(activeSlots.map((slot) => [`${slot.dayOfWeek}-${slot.startTime}`, slot])));
      setSelectedSlots(new Set(activeSlots.map((slot) => `${slot.dayOfWeek}-${slot.startTime}`)));
      toast.success('Availability saved successfully');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to save availability'
        : 'Unable to save availability';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditField = (field, value) => {
    setEditingSlot((current) => ({ ...current, [field]: value }));
  };

  const handleUpdateSlot = async (nextStatus = editingSlot?.status || 'available') => {
    if (!editingSlot) {
      return;
    }

    try {
      setUpdating(true);
      const response = await updateMyAvailabilitySlot(editingSlot.id, {
        dayOfWeek: editingSlot.dayOfWeek,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        status: nextStatus,
      });
      const notificationsSent = response.data.notificationsSent || 0;
      await loadAvailability();
      setEditingSlot(null);
      toast.success(
        notificationsSent > 0
          ? `Slot updated. ${notificationsSent} pending student notification${notificationsSent === 1 ? '' : 's'} created.`
          : 'Slot updated successfully',
      );
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to update this slot'
        : 'Unable to update this slot';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <main className="availability-page">
      <ToastContainer position="top-right" autoClose={3000} />

      <section className="availability-shell" aria-labelledby="availability-heading">
        <div className="profile-topbar">
          <Link to="/tutor/dashboard">Dashboard</Link>
          <Link to="/tutor/subjects">Subjects</Link>
        </div>

        <header className="subject-manager-header">
          <p className="eyebrow">Weekly Schedule</p>
          <h1 id="availability-heading">Set Tutor Availability</h1>
          <p>Click hourly slots to mark when students can book you. Save once your week looks right.</p>
        </header>

        <section className="availability-summary" aria-label="Availability summary">
          <article>
            <span>Active Slots</span>
            <strong>{savedSlotCount}</strong>
          </article>
          <article>
            <span>New Selections</span>
            <strong>{unsavedSlotCount}</strong>
          </article>
          <article>
            <span>Booked</span>
            <strong>{bookedSlotCount}</strong>
          </article>
        </section>

        <div className="availability-toolbar">
          <p>{selectedCount} available slot{selectedCount === 1 ? '' : 's'} selected</p>
          <button type="button" className="primary-button" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>

        {loading ? (
          <p className="profile-value">Loading availability...</p>
        ) : (
          <>
            <p className="availability-help">
              Click a saved slot to edit its day, time, or cancel it. Pending students receive a notification when a booked pending slot changes.
            </p>
            <div className="availability-legend" aria-label="Calendar legend">
              <span><i className="legend-dot legend-available" /> Available</span>
              <span><i className="legend-dot legend-booked" /> Pending booking</span>
              <span><i className="legend-dot legend-unavailable" /> Unavailable</span>
            </div>
            <div className="weekly-calendar" role="grid" aria-label="Weekly availability calendar">
              <div className="calendar-corner" />
              {days.map((day) => (
                <div className="calendar-day-heading" key={day}>
                  {day.slice(0, 3)}
                </div>
              ))}

              {hours.map((hour) => (
                <div className="calendar-row" role="row" key={hour}>
                  <div className="calendar-time">{padHour(hour)}</div>
                  {days.map((day) => {
                    const key = slotKey(day, hour);
                    const selected = selectedSlots.has(key);
                    const savedSlot = savedSlotsByKey.get(key);
                    const booked = savedSlot?.status === 'booked';
                    return (
                      <button
                        type="button"
                        className={`calendar-slot ${selected ? 'calendar-slot-selected' : ''} ${booked ? 'calendar-slot-booked' : ''}`}
                        key={key}
                        onClick={() => toggleSlot(day, hour)}
                        aria-pressed={selected}
                      >
                        {booked ? 'Booked' : selected ? 'Available' : 'Unavailable'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {editingSlot && (
        <div className="slot-modal-backdrop" role="presentation">
          <section className="slot-modal" aria-labelledby="slot-modal-title">
            <header>
              <p className="eyebrow">Modify Slot</p>
              <h2 id="slot-modal-title">Edit availability</h2>
            </header>

            <label className="form-field">
              Day
              <select
                value={editingSlot.dayOfWeek}
                onChange={(event) => handleEditField('dayOfWeek', event.target.value)}
              >
                {days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </label>

            <div className="slot-time-grid">
              <label className="form-field">
                Start
                <select
                  value={editingSlot.startTime}
                  onChange={(event) => handleEditField('startTime', event.target.value)}
                >
                  {timeOptions.slice(0, -1).map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                End
                <select
                  value={editingSlot.endTime}
                  onChange={(event) => handleEditField('endTime', event.target.value)}
                >
                  {timeOptions.slice(1).map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </label>
            </div>

            {editingSlot.hasPendingBooking && (
              <p className="slot-modal-note">This slot has a pending booking. Saving a change will notify the student.</p>
            )}

            <div className="slot-modal-actions">
              <button type="button" className="secondary-button" onClick={() => setEditingSlot(null)} disabled={updating}>
                Close
              </button>
              <button type="button" className="danger-button" onClick={() => handleUpdateSlot('cancelled')} disabled={updating}>
                Cancel Slot
              </button>
              <button type="button" className="primary-button" onClick={() => handleUpdateSlot('available')} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
