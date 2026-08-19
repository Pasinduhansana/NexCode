"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  HiOutlineBolt,
  HiOutlineRefresh,
  HiOutlineCalendarDays,
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

export default function AdminCalendarPage() {
  const router = useRouter();
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
    dateFrom: "",
    dateTo: "",
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [modal, setModal] = useState({ open: false, mode: "create", event: null });
  const [deleting, setDeleting] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

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
    setModal({ open: true, mode: "create", event: day ? { date: toDateInput(day) } : null });
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

  const periodLabel =
    view === "day" ? fmtDayHeader(cursor) : view === "agenda" ? "Upcoming" : fmtMonthYear(cursor);

  /* __MORE__ */
}
