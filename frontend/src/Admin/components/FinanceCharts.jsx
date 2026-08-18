export function MonthlyBars({ series }) {
  const data = [...(series || [])].slice(-6);
  if (data.length === 0) {
    return <div className="flex h-40 items-center justify-center text-xs text-text_muted">No monthly data yet</div>;
  }

  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense, d.payment)));

  return (
    <div>
      <div className="flex items-end justify-between gap-3" style={{ height: 160 }}>
        {data.map((d, i) => {
          const incomeH = Math.round((d.income / max) * 150);
          const expenseH = Math.round((d.expense / max) * 150);
          const paymentH = Math.round((d.payment / max) * 150);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full max-w-[46px] flex-col items-center justify-end gap-[3px]" style={{ height: 150 }}>
                {expenseH > 0 && (
                  <div title={`Expense Rs. ${d.expense.toLocaleString()}`} className="w-full rounded-sm bg-rose-400 transition-all" style={{ height: expenseH }} />
                )}
                {paymentH > 0 && (
                  <div title={`Payments Rs. ${d.payment.toLocaleString()}`} className="w-full rounded-sm bg-violet-400 transition-all" style={{ height: paymentH }} />
                )}
                {incomeH > 0 && (
                  <div title={`Income Rs. ${d.income.toLocaleString()}`} className="w-full rounded-sm bg-emerald-400 transition-all" style={{ height: incomeH }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-3">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] font-medium text-text_muted">
            {d.month}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-text_secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-400" /> Income
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-rose-400" /> Expense
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-violet-400" /> Payment
        </span>
      </div>
    </div>
  );
}

export function CategoryBreakdown({ rows, tone = "emerald" }) {
  const data = rows || [];
  const max = Math.max(1, ...data.map((d) => d.amount));
  const barClass = tone === "rose" ? "bg-rose-400" : "bg-emerald-400";

  if (data.length === 0) {
    return <div className="flex h-32 items-center justify-center text-xs text-text_muted">No categories yet</div>;
  }

  return (
    <div className="space-y-3">
      {data.slice(0, 7).map((d) => (
        <div key={d.category}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{d.category}</span>
            <span className="font-semibold text-text_secondary">Rs. {d.amount.toLocaleString()}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${barClass} transition-all`}
              style={{ width: `${Math.max(4, Math.round((d.amount / max) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}