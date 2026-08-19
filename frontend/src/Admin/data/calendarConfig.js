import {
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineFlag,
  HiOutlineSparkles,
  HiOutlineSwitchHorizontal,
  HiOutlineBell,
  HiOutlineCash,
  HiOutlineDotsCircleHorizontal,
  HiOutlineExclamation,
} from "react-icons/hi";

// Canonical event-type list. Keep in sync with backend EVENT_TYPES
// (frontend/lib/calendarLogic.js). Icons are React-only, so they live here.
export const EVENT_TYPES = [
  "MEETING",
  "TASK_DEADLINE",
  "PROJECT_DEADLINE",
  "MILESTONE",
  "PROJECT_HANDOVER",
  "REMINDER",
  "EXPENSE",
  "OTHER",
];

export const EVENT_TYPE_CONFIG = {
  MEETING: {
    label: "Meeting",
    icon: HiOutlineUsers,
    dot: "#38bdf8",
    chip: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  TASK_DEADLINE: {
    label: "Task Deadline",
    icon: HiOutlineCheckCircle,
    dot: "#fbbf24",
    chip: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  PROJECT_DEADLINE: {
    label: "Project Deadline",
    icon: HiOutlineFlag,
    dot: "#fb7185",
    chip: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  MILESTONE: {
    label: "Milestone",
    icon: HiOutlineSparkles,
    dot: "#a78bfa",
    chip: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  PROJECT_HANDOVER: {
    label: "Project Handover",
    icon: HiOutlineSwitchHorizontal,
    dot: "#34d399",
    chip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  REMINDER: {
    label: "Reminder",
    icon: HiOutlineBell,
    dot: "#fb923c",
    chip: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  EXPENSE: {
    label: "Expense",
    icon: HiOutlineCash,
    dot: "#e879f9",
    chip: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  },
  OTHER: {
    label: "Other",
    icon: HiOutlineDotsCircleHorizontal,
    dot: "#94a3b8",
    chip: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
};

export const PRIORITIES = ["low", "medium", "high", "urgent"];

export const PRIORITY_CONFIG = {
  low: { label: "Low", chip: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  medium: { label: "Medium", chip: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  high: { label: "High", chip: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  urgent: { label: "Urgent", chip: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
};

export const STATUSES = ["upcoming", "completed", "cancelled", "overdue"];

export const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", chip: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  completed: { label: "Completed", chip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  cancelled: { label: "Cancelled", chip: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  overdue: { label: "Overdue", chip: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
};

export const REMINDER_PRESETS = [
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 1440, label: "1 day before" },
  { value: 2880, label: "2 days before" },
  { value: 10080, label: "1 week before" },
];

export const DATE_RANGE_OPTIONS = [
  { value: "", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this week", label: "This week" },
  { value: "next week", label: "Next week" },
  { value: "this month", label: "This month" },
  { value: "next month", label: "Next month" },
];

export function getEventTypeConfig(type) {
  return EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.OTHER;
}

export function getPriorityConfig(priority) {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
}

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;
}

// Formats an ISO instant into the event's own timezone for display.
export function formatEventTime(startAt, timezone = "UTC", allDay = false) {
  if (allDay) return "All day";
  const d = new Date(startAt);
  if (isNaN(d)) return "";
  try {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    });
  } catch {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
}

export function formatEventDate(startAt, timezone = "UTC") {
  const d = new Date(startAt);
  if (isNaN(d)) return "";
  try {
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone,
    });
  } catch {
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
}

export const OverdueIcon = HiOutlineExclamation;
