import { useMemo } from "react";
import { TASK_STATUSES } from "../data/constants";

const MS_DAY = 86_400_000;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function getTaskStart(task) {
  if (task.startDate) return startOfDay(task.startDate);
  if (task.createdAt) return startOfDay(task.createdAt);
  return null;
}

function getTaskEnd(task) {
  if (task.endDate) return startOfDay(task.endDate);
  if (task.dueDate) return startOfDay(task.dueDate);
  const start = getTaskStart(task);
  if (start) return addDays(start, Math.max(1, Math.ceil((task.estimatedHours || 0) / 8)));
  return null;
}

export default function KanbanGantt({ projects, zoom, setZoom, onEditTask }) {
  const pxPerDay = zoom === "month" ? 10 : zoom === "week" ? 20 : 36;

  const { minDate, maxDate, totalDays, rows } = useMemo(() => {
    const all = [];
    const visibleProjects = projects.filter((p) => p.tasks && p.tasks.length > 0);
    for (const p of visibleProjects) {
      for (const t of p.tasks) {
        const start = getTaskStart(t);
        const end = getTaskEnd(t);
        if (start) all.push({ start, end: end || addDays(start, 1) });
      }
    }

    let min = addDays(startOfDay(new Date()), -14);
    let max = addDays(startOfDay(new Date()), 60);
    if (all.length > 0) {
      min = new Date(Math.min(...all.map((x) => x.start.getTime())));
      max = new Date(Math.max(...all.map((x) => x.end.getTime())));
      min = addDays(min, -3);
      max = addDays(max, 7);
    }

    const rows = visibleProjects.map((p) => ({
      project: p,
      tasks: p.tasks
        .map((t) => {
          const start = getTaskStart(t);
          const end = getTaskEnd(t) || addDays(start || new Date(), 1);
          return { task: t, start, end };
        })
        .filter((x) => x.start)
        .sort((a, b) => a.start - b.start),
    }));

    const totalDays = Math.max(1, Math.ceil((max - min) / MS_DAY));
    return { minDate: min, maxDate: max, totalDays, rows };
  }, [projects]);

  const header = useMemo(() => {
    const ticks = [];
    if (zoom === "day") {
      for (let i = 0; i < totalDays; i++) {
        const d = addDays(minDate, i);
        ticks.push({
          label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          offset: i * pxPerDay,
          isWeekend: d.getDay() === 0 || d.getDay() === 6,
        });
      }
    } else if (zoom === "week") {
      for (let i = 0; i < totalDays; i++) {
        const d = addDays(minDate, i);
        if (d.getDay() === 1 || i === 0) {
          ticks.push({ label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), offset: i * pxPerDay, isWeekend: false });
        }
      }
    } else {
      for (let i = 0; i < totalDays; i++) {
        const d = addDays(minDate, i);
        if (d.getDate() === 1 || i === 0) {
          ticks.push({ label: d.toLocaleDateString("en-US", { month: "short" }), offset: i * pxPerDay, isWeekend: false });
        }
      }
    }
    return ticks;
  }, [zoom, minDate, totalDays, pxPerDay]);

  const todayOffset = Math.max(0, Math.min(totalDays, (startOfDay(new Date()) - minDate) / MS_DAY));
  const totalWidth = totalDays * pxPerDay;

  const gridLines = [];
  for (let i = 0; i <= totalDays; i++) {
    const d = addDays(minDate, i);
    gridLines.push({
      offset: i * pxPerDay,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isToday: d.getTime() === startOfDay(new Date()).getTime(),
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <h3 className="font-display font-bold text-foreground">Timeline</h3>
          <span className="text-xs text-text_muted">Click a bar to adjust dates</span>
        </div>
        <div className="flex rounded-lg border border-border bg-background p-0.5 text-xs">
          {[
            { key: "month", label: "Month" },
            { key: "week", label: "Week" },
            { key: "day", label: "Day" },
          ].map((z) => (
            <button
              key={z.key}
              type="button"
              onClick={() => setZoom(z.key)}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                zoom === z.key ? "bg-primary text-white" : "text-text_secondary hover:text-foreground"
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="flex">
            <div className="sticky left-0 z-20 w-52 shrink-0 border-r border-border bg-card" />
            <div className="relative" style={{ width: totalWidth, height: 28 }}>
              {gridLines.map((g, i) => (
                <div
                  key={i}
                  className={`absolute top-0 h-full border-l ${g.isToday ? "border-primary" : g.isWeekend ? "border-border/50" : "border-border/25"}`}
                  style={{ left: g.offset }}
                />
              ))}
              {header.map((t, i) => (
                <div key={i} className="absolute top-1.5 truncate text-[10px] font-medium text-text_muted" style={{ left: t.offset + 4 }}>
                  {t.label}
                </div>
              ))}
              <div
                className="absolute bottom-0 top-0 z-10 w-0.5 bg-rose-500"
                style={{ left: todayOffset * pxPerDay }}
                title="Today"
              />
            </div>
          </div>

          {rows.map(({ project, tasks }) => (
            <div key={String(project._id)}>
              <div className="flex">
                <div className="sticky left-0 z-20 flex w-52 shrink-0 items-center gap-2 border-b border-r border-border bg-muted/50 px-3 py-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: project.color || "#3699f3" }} />
                  <span className="truncate text-xs font-bold text-foreground">{project.name}</span>
                  <span className="ml-auto text-[10px] text-text_muted">{tasks.length}</span>
                </div>
                <div className="relative border-b border-border" style={{ width: totalWidth, height: 26 }}>
                  {gridLines.map((g, i) => (
                    <div
                      key={i}
                      className={`absolute top-0 h-full border-l ${g.isToday ? "border-primary" : g.isWeekend ? "border-border/50" : "border-border/25"}`}
                      style={{ left: g.offset }}
                    />
                  ))}
                  <div
                    className="absolute bottom-0 top-0 z-10 w-0.5 bg-rose-500"
                    style={{ left: todayOffset * pxPerDay }}
                  />
                </div>
              </div>

              {tasks.map(({ task, start, end }) => {
                const leftDays = (start - minDate) / MS_DAY;
                const spanDays = Math.max((end - start) / MS_DAY, 0.4);
                const left = leftDays * pxPerDay;
                const width = spanDays * pxPerDay;
                const done = task.status === "done";
                const status = TASK_STATUSES.find((s) => s.value === task.status);
                return (
                  <div key={String(task._id)} className="flex">
                    <div className="sticky left-0 z-20 flex w-52 shrink-0 items-center gap-2 border-b border-r border-border bg-card px-3 py-2">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status?.dot || "bg-slate-400"}`} />
                      <span className={`truncate text-xs ${done ? "text-text_muted line-through" : "text-foreground"}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="relative border-b border-border" style={{ width: totalWidth, height: 30 }}>
                      {gridLines.map((g, i) => (
                        <div
                          key={i}
                          className={`absolute top-0 h-full border-l ${g.isToday ? "border-primary" : g.isWeekend ? "border-border/50" : "border-border/25"}`}
                          style={{ left: g.offset }}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => onEditTask(task)}
                        title={`${task.title} — ${start.toLocaleDateString()} → ${end.toLocaleDateString()}`}
                        className="absolute top-1/2 z-10 flex h-[22px] -translate-y-1/2 items-center overflow-hidden rounded-md px-2 text-left text-[11px] font-semibold text-white shadow-sm transition-transform hover:z-20 hover:-translate-y-1/2 hover:scale-y-110"
                        style={{ left, width: Math.max(width, 14), backgroundColor: project.color || "#3699f3", opacity: done ? 0.5 : 1 }}
                      >
                        <span className="truncate">{task.title}</span>
                      </button>
                      <div
                        className="absolute bottom-0 top-0 z-10 w-0.5 bg-rose-500"
                        style={{ left: todayOffset * pxPerDay }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {rows.length === 0 && (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-text_muted">
              No scheduled tasks yet.
              <span className="text-text_secondary">Assign start / end dates to see them on the timeline.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
