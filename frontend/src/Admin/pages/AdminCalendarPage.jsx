"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineAdjustments,
  HiOutlineX,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineExternalLink,
  HiOutlineLightningBolt,
  HiOutlineRefresh,
} from "react-icons/hi";
import usePageTitle from "../../utils/usePageTitle";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import PremiumSelect from "../components/PremiumSelect";
import calendarApi from "../utils/calendarApi";
import {
  EVENT_TYPES,
  EVENT_TYPE_CONFIG,
  PRIORITIES,
  PRIORITY_CONFIG,
  STATUSES,
  STATUS_CONFIG,
  REMINDER_PRESETS,
  DATE_RANGE_OPTIONS,
  getEventTypeConfig,
  getPriorityConfig,
  getStatusConfig,
  formatEventTime,
  formatEventDate,
} from "../data/calendarConfig";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const addMonths = (d, n) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};
const startOfWeek = (d) => {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x;
};
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const sameDay = (a, b) =>
  a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const toDateInput = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtMonthYear = (d) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
const fmtDayHeader = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
const splitDateTime = (startAt, timezone) => {
  const d = new Date(startAt);
  return {
    date: d.toLocaleDateString("en-CA", { timeZone: timezone }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone }),
  };
};

const VIEWS = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "agenda", label: "Agenda" },
];

const COMMON_TIMEZONES = [
  { value: "Asia/Colombo", label: "Asia/Colombo (GMT+5:30)" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Dubai", label: "Asia/Dubai" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "America/New_York", label: "America/New York" },
];

const EVENT_TYPE_OPTIONS = EVENT_TYPES.map((t) => ({ value: t, label: EVENT_TYPE_CONFIG[t].label }));
const PRIORITY_OPTIONS = PRIORITIES.map((p) => ({ value: p, label: PRIORITY_CONFIG[p].label }));
const STATUS_OPTIONS = STATUSES.map((s) => ({ value: s, label: STATUS_CONFIG[s].label }));

const emptyForm = () => ({
  title: "",
  eventType: "MEETING",
  priority: "medium",
  status: "upcoming",
  projectId: "",
  date: toDateInput(new Date()),
  startTime: "09:00",
  endTime: "10:00",
  timezone: "Asia/Colombo",
  allDay: false,
  location: "",
  notes: "",
  reminders: [],
});

const formFromEvent = (event) => {
  const sd = splitDateTime(event.startAt, event.timezone);
  const ed = splitDateTime(event.endAt || event.startAt, event.timezone);
  return {
    title: event.title || "",
    eventType: event.eventType || "MEETING",
    priority: event.priority || "medium",
    status: event.status || "upcoming",
    projectId: event.projectId ? String(event.projectId) : "",
    date: sd.date,
    startTime: sd.time,
    endTime: ed.time,
    timezone: event.timezone || "Asia/Colombo",
    allDay: Boolean(event.allDay),
    location: event.location || "",
    notes: event.notes || "",
    reminders: Array.isArray(event.reminders)
      ? event.reminders.map((r) => (typeof r === "number" ? r : r.leadMinutes)).filter(Boolean)
      : [],
  };
};

function EventChip({ event, compact, onClick }) {
  const cfg = getEventTypeConfig(event.eventType);
  const Icon = cfg.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 truncate rounded-md border px-2 py-1 text-left text-[11px] font-medium transition-[filter] hover:brightness-110 ${
        cfg.chip
      } ${event.status === "cancelled" ? "opacity-50 line-through" : ""}`}
    >
      <Icon size={12} className="shrink-0" />
      <span className="truncate">{event.title}</span>
      {!compact && !event.allDay && (
        <span className="ml-auto shrink-0 opacity-70">{formatEventTime(event.startAt, event.timezone, event.allDay)}</span>
      )}
    </button>
  );
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon size={16} className="mt-0.5 shrink-0 text-text_muted" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-text_muted">{label}</div>
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  );
}

export default function AdminCalendarPage() {
  usePageTitle("Calendar");

  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const [filters, setFilters] = useState({
    eventType: "",
    projectId: "",
    priority: "",
    status: "",
    range: "",
    search: "",
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [modal, setModal] = useState({ open: false, mode: "create", event: null });
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);

  const viewRange = useMemo(() => {
    if (view === "month") return { dateFrom: toDateInput(startOfMonth(cursor)), dateTo: toDateInput(endOfMonth(cursor)) };
    if (view === "week") {
      const ws = startOfWeek(cursor);
      return { dateFrom: toDateInput(ws), dateTo: toDateInput(addDays(ws, 6)) };
    }
    if (view === "day") return { dateFrom: toDateInput(cursor), dateTo: toDateInput(cursor) };
    const from = startOfDay(new Date());
    return { dateFrom: toDateInput(from), dateTo: toDateInput(addDays(from, 90)) };
  }, [view, cursor]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const query = {
        ...filters,
        dateFrom: filters.range ? "" : viewRange.dateFrom,
        dateTo: filters.range ? "" : viewRange.dateTo,
      };
      const data = await calendarApi.listEvents(query);
      setEvents(data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }, [filters, viewRange]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    calendarApi
      .listProjects()
      .then(setProjects)
      .catch(() => {});
  }, []);

  const eventsForDay = useCallback(
    (day) => {
      const start = startOfDay(day).getTime();
      const end = start + 86400000;
      return events
        .filter((e) => {
          const t = new Date(e.startAt).getTime();
          return t >= start && t < end;
        })
        .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    },
    [events]
  );

  const todayEvents = useMemo(() => eventsForDay(today), [eventsForDay, today, events]);

  const upcoming = useMemo(
    () =>
      events
        .filter(
          (e) =>
            new Date(e.startAt).getTime() >= Date.now() &&
            e.status !== "cancelled" &&
            e.status !== "completed"
        )
        .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
        .slice(0, 8),
    [events]
  );

  const overdue = useMemo(
    () =>
      events
        .filter(
          (e) =>
            e.status !== "completed" &&
            e.status !== "cancelled" &&
            new Date(e.startAt).getTime() < startOfDay(new Date()).getTime()
        )
        .sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
    [events]
  );

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const goPrev = () => {
    if (view === "month") setCursor((c) => addMonths(c, -1));
    else if (view === "week") setCursor((c) => addDays(c, -7));
    else if (view === "day") setCursor((c) => addDays(c, -1));
    else setCursor((c) => addMonths(c, -1));
  };
  const goNext = () => {
    if (view === "month") setCursor((c) => addMonths(c, 1));
    else if (view === "week") setCursor((c) => addDays(c, 7));
    else if (view === "day") setCursor((c) => addDays(c, 1));
    else setCursor((c) => addMonths(c, 1));
  };
  const goToday = () => setCursor(new Date());

  const openCreate = (day) => {
    setForm({ ...emptyForm(), date: day ? toDateInput(day) : toDateInput(new Date()) });
    setModal({ open: true, mode: "create", event: null });
  };
  const openEvent = (event) => setModal({ open: true, mode: event.readOnly ? "view" : "edit", event });
  const openDetail = (event) => setModal({ open: true, mode: "view", event });

  const handleProcessReminders = async () => {
    try {
      const res = await calendarApi.processReminders();
      const s = res?.summary || {};
      toast.success(`Reminders processed: ${s.sent || 0} sent, ${s.failed || 0} failed`);
    } catch {
      toast.error("Could not process reminders");
    }
  };

  const toggleReminder = (value) => {
    setForm((f) => ({
      ...f,
      reminders: f.reminders.includes(value) ? f.reminders.filter((r) => r !== value) : [...f.reminders, value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, reminders: form.reminders.map(Number), projectId: form.projectId || null };
      if (modal.mode === "edit") {
        await calendarApi.updateEvent(modal.event.id, payload);
        toast.success("Event updated");
      } else {
        await calendarApi.createEvent(payload);
        toast.success("Event created");
      }
      setModal({ open: false, mode: "create", event: null });
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await calendarApi.deleteEvent(deleting.id);
      toast.success("Event deleted");
      setDeleting(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete event");
    }
  };

  const periodLabel =
    view === "day" ? fmtDayHeader(cursor) : view === "agenda" ? "Upcoming" : fmtMonthYear(cursor);

  const projectOptions = [{ value: "", label: "No project" }, ...projects.map((p) => ({ value: String(p.id), label: p.name }))];

  const hasActiveFilters = Boolean(
    filters.eventType || filters.projectId || filters.priority || filters.status || filters.range || filters.search
  );

  const clearFilters = () =>
    setFilters({ eventType: "", projectId: "", priority: "", status: "", range: "", search: "" });

  if (loading && events.length === 0) return <Spinner label="Loading calendar..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">Calendar</h1>
          <p className="mt-1 text-sm text-text_secondary">Schedule, deadlines, and reminders across projects.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleProcessReminders}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <HiOutlineLightningBolt size={16} />
            Process Reminders
          </button>
          <button
            type="button"
            onClick={() => openCreate()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary_hover"
          >
            <HiOutlinePlus size={16} />
            New Event
          </button>
        </div>
      </div>

      {/* Navigation + view switch */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-lg border border-border p-2 text-text_secondary transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Previous"
          >
            <HiOutlineChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg border border-border p-2 text-text_secondary transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Next"
          >
            <HiOutlineChevronRight size={18} />
          </button>
          <span className="ml-2 font-display text-lg font-semibold text-foreground">{periodLabel}</span>
        </div>

        <div className="flex rounded-xl border border-border bg-card p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                view === v.id ? "bg-primary text-white" : "text-text_secondary hover:text-foreground"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="hidden items-end gap-3 md:flex">
          <div className="w-44">
            <label className="label">Type</label>
            <PremiumSelect
              value={filters.eventType}
              onChange={(v) => setFilters((f) => ({ ...f, eventType: v }))}
              options={[{ value: "", label: "All types" }, ...EVENT_TYPE_OPTIONS]}
              compact
            />
          </div>
          <div className="w-44">
            <label className="label">Project</label>
            <PremiumSelect
              value={filters.projectId}
              onChange={(v) => setFilters((f) => ({ ...f, projectId: v }))}
              options={projectOptions}
              compact
            />
          </div>
          <div className="w-32">
            <label className="label">Priority</label>
            <PremiumSelect
              value={filters.priority}
              onChange={(v) => setFilters((f) => ({ ...f, priority: v }))}
              options={[{ value: "", label: "All" }, ...PRIORITY_OPTIONS]}
              compact
            />
          </div>
          <div className="w-32">
            <label className="label">Status</label>
            <PremiumSelect
              value={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              options={[{ value: "", label: "All" }, ...STATUS_OPTIONS]}
              compact
            />
          </div>
          <div className="w-40">
            <label className="label">Range</label>
            <PremiumSelect
              value={filters.range}
              onChange={(v) => setFilters((f) => ({ ...f, range: v }))}
              options={DATE_RANGE_OPTIONS}
              compact
            />
          </div>
          <div className="relative flex-1">
            <label className="label">Search</label>
            <div className="relative">
              <HiOutlineSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
              <input
                className="input-field pl-9"
                placeholder="Search events"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text_secondary hover:bg-muted"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((o) => !o)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground"
          >
            <HiOutlineAdjustments size={16} />
            Filters
            {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </button>
        </div>

        {mobileFiltersOpen && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:hidden">
            <PremiumSelect
              value={filters.eventType}
              onChange={(v) => setFilters((f) => ({ ...f, eventType: v }))}
              options={[{ value: "", label: "All types" }, ...EVENT_TYPE_OPTIONS]}
              compact
            />
            <PremiumSelect
              value={filters.projectId}
              onChange={(v) => setFilters((f) => ({ ...f, projectId: v }))}
              options={projectOptions}
              compact
            />
            <PremiumSelect
              value={filters.priority}
              onChange={(v) => setFilters((f) => ({ ...f, priority: v }))}
              options={[{ value: "", label: "All priorities" }, ...PRIORITY_OPTIONS]}
              compact
            />
            <PremiumSelect
              value={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              options={[{ value: "", label: "All statuses" }, ...STATUS_OPTIONS]}
              compact
            />
            <PremiumSelect
              value={filters.range}
              onChange={(v) => setFilters((f) => ({ ...f, range: v }))}
              options={DATE_RANGE_OPTIONS}
              compact
            />
            <div className="relative">
              <HiOutlineSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
              <input
                className="input-field pl-9"
                placeholder="Search events"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text_secondary"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* View */}
      {loading && events.length > 0 && (
        <div className="text-sm text-text_muted">Updating…</div>
      )}

      {!loading && events.length === 0 && (
        <EmptyState
          icon={HiOutlineCalendar}
          title="No events found"
          message="Create an event or adjust your filters to see items here."
        />
      )}

      {!loading && events.length > 0 && (
        <>
          {view === "month" && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-7 border-b border-border bg-muted/40">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-text_muted">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((day, i) => {
                  const dayEvents = eventsForDay(day);
                  const isToday = sameDay(day, today);
                  const inMonth = day.getMonth() === cursor.getMonth();
                  return (
                    <div
                      key={i}
                      className={`min-h-[110px] border-b border-r border-border p-1.5 last:border-r-0 ${
                        (i + 1) % 7 === 0 ? "" : ""
                      } ${inMonth ? "" : "bg-muted/20"}`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => openCreate(day)}
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            isToday ? "bg-primary text-white" : "text-text_secondary hover:bg-muted"
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <EventChip key={ev.id} event={ev} compact onClick={() => openEvent(ev)} />
                        ))}
                        {dayEvents.length > 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              setView("day");
                              setCursor(day);
                            }}
                            className="w-full rounded-md px-2 py-0.5 text-left text-[11px] font-medium text-text_muted hover:text-foreground"
                          >
                            +{dayEvents.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "week" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
              {weekDays.map((day) => {
                const dayEvents = eventsForDay(day);
                const isToday = sameDay(day, today);
                return (
                  <div key={day.toISOString()} className="rounded-2xl border border-border bg-card">
                    <div
                      className={`flex items-center justify-between rounded-t-2xl border-b border-border px-3 py-2 ${
                        isToday ? "bg-primary/10" : "bg-muted/40"
                      }`}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-text_muted">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      <button
                        type="button"
                        onClick={() => openCreate(day)}
                        className={`text-xs font-bold ${isToday ? "text-primary" : "text-foreground"}`}
                      >
                        {day.getDate()}
                      </button>
                    </div>
                    <div className="space-y-1.5 p-2">
                      {dayEvents.length === 0 ? (
                        <div className="py-4 text-center text-[11px] text-text_muted">—</div>
                      ) : (
                        dayEvents.map((ev) => <EventChip key={ev.id} event={ev} onClick={() => openEvent(ev)} />)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "day" && (
            <div className="rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
                {fmtDayHeader(cursor)}
              </div>
              <div className="space-y-2 p-4">
                {eventsForDay(cursor).length === 0 ? (
                  <EmptyState icon={HiOutlineCalendar} title="Nothing scheduled" message="Add an event for this day." />
                ) : (
                  eventsForDay(cursor).map((ev) => <EventChip key={ev.id} event={ev} onClick={() => openEvent(ev)} />)
                )}
              </div>
            </div>
          )}

          {view === "agenda" && (
            <div className="space-y-4">
              {overdue.length > 0 && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5">
                  <div className="border-b border-rose-500/20 px-4 py-2.5 text-sm font-semibold text-rose-400">
                    Overdue ({overdue.length})
                  </div>
                  <div className="divide-y divide-border">
                    {overdue.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => openEvent(ev)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                      >
                        <span className="w-32 shrink-0 text-xs text-text_muted">{formatEventDate(ev.startAt, ev.timezone)}</span>
                        <EventChip event={ev} onClick={() => openEvent(ev)} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-4 py-2.5 text-sm font-semibold text-foreground">
                  Upcoming {upcoming.length > 0 && <span className="text-text_muted">({upcoming.length})</span>}
                </div>
                {upcoming.length === 0 ? (
                  <EmptyState icon={HiOutlineCalendar} title="No upcoming events" message="You're all caught up." />
                ) : (
                  <div className="divide-y divide-border">
                    {upcoming.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => openEvent(ev)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                      >
                        <span className="w-32 shrink-0 text-xs text-text_muted">{formatEventDate(ev.startAt, ev.timezone)}</span>
                        <EventChip event={ev} onClick={() => openEvent(ev)} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Event modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: "create", event: null })}
        title={modal.mode === "create" ? "New Event" : modal.mode === "edit" ? "Edit Event" : "Event Details"}
      >
        {modal.mode === "view" && modal.event ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${getEventTypeConfig(modal.event.eventType).chip}`}>
                {(() => {
                  const C = getEventTypeConfig(modal.event.eventType).icon;
                  return <C size={13} />;
                })()}
                {getEventTypeConfig(modal.event.eventType).label}
              </span>
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${getStatusConfig(modal.event.status).chip}`}>
                {getStatusConfig(modal.event.status).label}
              </span>
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${getPriorityConfig(modal.event.priority).chip}`}>
                {getPriorityConfig(modal.event.priority).label}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">{modal.event.title}</h3>
            <div className="space-y-3">
              <DetailRow icon={HiOutlineClock} label="When">
                {formatEventDate(modal.event.startAt, modal.event.timezone)}
                {" · "}
                {formatEventTime(modal.event.startAt, modal.event.timezone, modal.event.allDay)}
                <span className="text-text_muted"> ({modal.event.timezone})</span>
              </DetailRow>
              {modal.event.projectName && (
                <DetailRow icon={HiOutlineExternalLink} label="Project">
                  {modal.event.projectName}
                </DetailRow>
              )}
              {modal.event.location && (
                <DetailRow icon={HiOutlineLocationMarker} label="Location">
                  {modal.event.location}
                </DetailRow>
              )}
              {modal.event.notes && (
                <DetailRow icon={HiOutlineCalendar} label="Notes">
                  {modal.event.notes}
                </DetailRow>
              )}
              {modal.event.isDerived && (
                <div className="text-xs text-text_muted">This is an auto-generated event and cannot be edited here.</div>
              )}
            </div>
            {!modal.event.readOnly && (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal((m) => ({ ...m, mode: "edit" }))}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <HiOutlinePencilAlt size={15} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleting(modal.event);
                    setModal({ open: false, mode: "create", event: null });
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-500/30 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10"
                >
                  <HiOutlineTrash size={15} />
                  Delete
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input-field"
                placeholder="Event title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Type</label>
                <PremiumSelect
                  value={form.eventType}
                  onChange={(v) => setForm((f) => ({ ...f, eventType: v }))}
                  options={EVENT_TYPE_OPTIONS}
                  compact
                />
              </div>
              <div>
                <label className="label">Priority</label>
                <PremiumSelect
                  value={form.priority}
                  onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                  options={PRIORITY_OPTIONS}
                  compact
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Timezone</label>
                <PremiumSelect
                  value={form.timezone}
                  onChange={(v) => setForm((f) => ({ ...f, timezone: v }))}
                  options={COMMON_TIMEZONES}
                  compact
                />
              </div>
            </div>
            {!form.allDay && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Start time</label>
                  <input
                    type="time"
                    className="input-field"
                    value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">End time</label>
                  <input
                    type="time"
                    className="input-field"
                    value={form.endTime}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.allDay}
                onChange={(e) => setForm((f) => ({ ...f, allDay: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              All day
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Project</label>
                <PremiumSelect
                  value={form.projectId}
                  onChange={(v) => setForm((f) => ({ ...f, projectId: v }))}
                  options={projectOptions}
                  compact
                />
              </div>
              <div>
                <label className="label">Status</label>
                <PremiumSelect
                  value={form.status}
                  onChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  options={STATUS_OPTIONS}
                  compact
                />
              </div>
            </div>
            <div>
              <label className="label">Location</label>
              <input
                className="input-field"
                placeholder="Optional"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                className="input-field min-h-[80px] resize-y"
                placeholder="Optional"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Reminders</label>
              <div className="flex flex-wrap gap-2">
                {REMINDER_PRESETS.map((p) => {
                  const checked = form.reminders.includes(p.value);
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => toggleReminder(p.value)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        checked
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-muted text-text_secondary hover:border-border hover:text-foreground"
                      }`}
                    >
                      {checked && <HiOutlineCheck size={12} />}
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModal({ open: false, mode: "create", event: null })}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary_hover disabled:opacity-60"
              >
                {saving && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                {modal.mode === "edit" ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete event?"
        message={deleting ? `Remove "${deleting.title}" from the calendar?` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
