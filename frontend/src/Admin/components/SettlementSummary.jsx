import { HiOutlineArrowRight, HiOutlineUser } from "react-icons/hi";

const PERSON_COLORS = {
  Pasindu: "bg-blue-500",
  Chamara: "bg-violet-500",
  NexCode: "bg-emerald-500",
};

export default function SettlementSummary({ settlement, byPaidBy }) {
  if (!settlement || !settlement.balances || settlement.balances.length === 0) {
    return null;
  }

  const { balances, transfers } = settlement;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-sm font-bold text-foreground">Expense Settlement</h3>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {balances.map((b, i) => (
          <div key={b.name} className="rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${PERSON_COLORS[b.name] || "bg-gray-400"}`}>
                {b.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{b.name}</div>
                <div className="text-[11px] text-text_muted">Paid Rs. {b.paid.toLocaleString()}</div>
              </div>
              <div className={`text-right text-sm font-bold ${b.balance > 0.01 ? "text-emerald-500" : b.balance < -0.01 ? "text-rose-500" : "text-text_muted"}`}>
                {b.balance > 0.01 ? `+Rs. ${b.balance.toLocaleString()}` : b.balance < -0.01 ? `-Rs. ${Math.abs(b.balance).toLocaleString()}` : "Settled"}
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full transition-all ${PERSON_COLORS[b.name] || "bg-gray-400"}`}
                style={{ width: `${b.paid > 0 ? (b.paid / (b.paid + (b.fairShare > b.paid ? 0 : b.fairShare - b.paid))) * 100 : 0}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-text_muted">
              <span>Fair share: Rs. {b.fairShare.toLocaleString()}</span>
              <span>{b.paid > b.fairShare ? "Gets back" : b.paid < b.fairShare ? "Owes" : "Even"}</span>
            </div>
          </div>
        ))}
      </div>

      {transfers && transfers.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text_muted">Settlement Transfers</h4>
          <div className="space-y-2">
            {transfers.map((t, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-2.5">
                <span className={`inline-flex items-center gap-1.5 text-sm font-medium text-foreground`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${PERSON_COLORS[t.from] || "bg-gray-400"}`} />
                  {t.from}
                </span>
                <HiOutlineArrowRight size={14} className="shrink-0 text-text_muted" />
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <span className={`h-2.5 w-2.5 rounded-full ${PERSON_COLORS[t.to] || "bg-gray-400"}`} />
                  {t.to}
                </span>
                <span className="ml-auto text-sm font-bold text-primary">Rs. {t.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {transfers && transfers.length === 0 && (
        <p className="rounded-xl border border-dashed border-border py-4 text-center text-sm text-text_muted">
          All expenses are settled evenly.
        </p>
      )}
    </div>
  );
}
