"use client";

import { useAppSelector, useAppDispatch, addSchedule, updateSchedule, removeSchedule } from "@badminton/store";
import type { ScheduledSession, RecurrenceType } from "@badminton/types";
import { saveSchedule, updateScheduleFirestore, deleteSchedule } from "@badminton/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarGrid } from "@/components/CalendarGrid";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState, useMemo } from "react";
import { FiPlus, FiCalendar, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2, FiRepeat, FiMapPin, FiClock } from "react-icons/fi";
import { v4 as uuid } from "uuid";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function SchedulePage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const schedules = useAppSelector((s) => s.schedules.items);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<ScheduledSession | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("19:00");
  const [formEndTime, setFormEndTime] = useState("21:00");
  const [formLocation, setFormLocation] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formRecurrence, setFormRecurrence] = useState<RecurrenceType>("none");
  const [formRecurrenceEnd, setFormRecurrenceEnd] = useState("");
  const [formCourtCount, setFormCourtCount] = useState("");

  const resetForm = () => {
    setFormTitle("");
    setFormDate("");
    setFormStartTime("19:00");
    setFormEndTime("21:00");
    setFormLocation("");
    setFormNotes("");
    setFormRecurrence("none");
    setFormRecurrenceEnd("");
    setFormCourtCount("");
  };

  const openCreate = (date?: string) => {
    resetForm();
    if (date) setFormDate(date);
    setEditingSession(null);
    setShowForm(true);
  };

  const openEdit = (session: ScheduledSession) => {
    setEditingSession(session);
    setFormTitle(session.title);
    setFormDate(session.date);
    setFormStartTime(session.startTime);
    setFormEndTime(session.endTime);
    setFormLocation(session.location ?? "");
    setFormNotes(session.notes ?? "");
    setFormRecurrence(session.recurrence);
    setFormRecurrenceEnd(session.recurrenceEndDate ?? "");
    setFormCourtCount(session.courtCount?.toString() ?? "");
    setShowForm(true);
  };

  const generateRecurringDates = (startDate: string, recurrence: RecurrenceType, endDate: string): string[] => {
    if (recurrence === "none" || !endDate) return [startDate];
    const dates = [startDate];
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    const current = new Date(start);

    while (current < end) {
      if (recurrence === "weekly") current.setDate(current.getDate() + 7);
      else if (recurrence === "biweekly") current.setDate(current.getDate() + 14);
      else if (recurrence === "monthly") current.setMonth(current.getMonth() + 1);
      if (current <= end) {
        dates.push(current.toISOString().split("T")[0]);
      }
    }
    return dates;
  };

  const handleSave = async () => {
    if (!user || !formTitle.trim() || !formDate) return;

    if (editingSession) {
      const updated: ScheduledSession = {
        ...editingSession,
        title: formTitle.trim(),
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        location: formLocation || undefined,
        notes: formNotes || undefined,
        recurrence: formRecurrence,
        recurrenceEndDate: formRecurrenceEnd || undefined,
        courtCount: formCourtCount ? parseInt(formCourtCount) : undefined,
      };
      dispatch(updateSchedule(updated));
      await updateScheduleFirestore(user.uid, updated);
    } else {
      // Generate recurring instances
      const dates = generateRecurringDates(formDate, formRecurrence, formRecurrenceEnd);
      for (const date of dates) {
        const session: ScheduledSession = {
          id: uuid(),
          title: formTitle.trim(),
          date,
          startTime: formStartTime,
          endTime: formEndTime,
          location: formLocation || undefined,
          notes: formNotes || undefined,
          recurrence: formRecurrence,
          recurrenceEndDate: formRecurrenceEnd || undefined,
          courtCount: formCourtCount ? parseInt(formCourtCount) : undefined,
          createdAt: Date.now(),
        };
        dispatch(addSchedule(session));
        await saveSchedule(user.uid, session);
      }
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    dispatch(removeSchedule(id));
    await deleteSchedule(user.uid, id);
    setDeleteConfirm(null);
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  // Upcoming sessions (next 30 days)
  const upcomingSessions = useMemo(() => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return schedules
      .filter((s) => s.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [schedules, today]);

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-6xl">
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Session"
        message="Are you sure you want to delete this session?"
        confirmLabel="Delete"
        danger
      />

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Schedule</h1>
          <p className="text-light-300 text-sm mt-1">Manage your badminton sessions</p>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 bg-accent text-primary font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-accent/80 transition-colors"
        >
          <FiPlus size={16} />
          New Session
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-dark-200 text-light-300 transition-colors">
            <FiChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-dark-200 text-light-300 transition-colors">
            <FiChevronRight size={18} />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-accent border border-accent/30 hover:bg-accent/10 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          sessions={schedules}
          onDayClick={(date) => openCreate(date)}
          onSessionClick={(session) => openEdit(session)}
        />
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
          <FiCalendar className="text-accent" size={18} />
          <h2 className="text-sm font-semibold">Upcoming Sessions</h2>
        </div>
        {upcomingSessions.length > 0 ? (
          <div>
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-dark-100 last:border-b-0 hover:bg-dark-200/30 transition-colors"
              >
                <div className="w-12 text-center shrink-0">
                  <p className="text-accent text-lg font-bold leading-tight">
                    {new Date(session.date + "T00:00:00").getDate()}
                  </p>
                  <p className="text-[10px] text-light-300 uppercase">
                    {MONTH_NAMES[new Date(session.date + "T00:00:00").getMonth()].slice(0, 3)}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-light-100 text-sm font-semibold truncate flex items-center gap-1.5">
                    {session.title}
                    {session.recurrence !== "none" && (
                      <FiRepeat size={12} className="text-info" />
                    )}
                  </h3>
                  <p className="text-light-300 text-xs flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <FiClock size={10} />
                      {session.startTime} - {session.endTime}
                    </span>
                    {session.location && (
                      <span className="flex items-center gap-1">
                        <FiMapPin size={10} />
                        {session.location}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => openEdit(session)}
                  className="text-light-300 hover:text-accent p-2 transition-colors"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(session.id)}
                  className="text-light-300 hover:text-danger p-2 transition-colors"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-light-300 text-sm">No upcoming sessions</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); resetForm(); }}
        title={editingSession ? "Edit Session" : "New Session"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-light-300 mb-1 block">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
              placeholder="e.g. Friday Night Badminton"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-light-300 mb-1 block">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
              />
            </div>
            <div>
              <label className="text-xs text-light-300 mb-1 block">Courts</label>
              <input
                type="number"
                value={formCourtCount}
                onChange={(e) => setFormCourtCount(e.target.value)}
                className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
                placeholder="Optional"
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-light-300 mb-1 block">Start Time</label>
              <input
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
              />
            </div>
            <div>
              <label className="text-xs text-light-300 mb-1 block">End Time</label>
              <input
                type="time"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-light-300 mb-1 block">Location</label>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="text-xs text-light-300 mb-1 block">Notes</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100 resize-none"
              rows={2}
              placeholder="Optional"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-light-300 mb-1 block">Recurrence</label>
              <select
                value={formRecurrence}
                onChange={(e) => setFormRecurrence(e.target.value as RecurrenceType)}
                className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
              >
                <option value="none">None</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {formRecurrence !== "none" && (
              <div>
                <label className="text-xs text-light-300 mb-1 block">Repeat Until</label>
                <input
                  type="date"
                  value={formRecurrenceEnd}
                  onChange={(e) => setFormRecurrenceEnd(e.target.value)}
                  className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="px-4 py-2 rounded-xl text-sm text-light-300 hover:bg-dark-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formTitle.trim() || !formDate}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-primary hover:bg-accent/80 disabled:opacity-50"
            >
              {editingSession ? "Save Changes" : "Create Session"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
