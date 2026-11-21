# NexCode

Company website with an admin-only project management system (MongoDB + Vercel serverless functions + JWT auth).

## Setup

### 1. Create a MongoDB Atlas cluster

1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user, then grab the connection string (`MongoDB connection string` in Atlas)
3. Add your current IP to the network access allowlist (or allow all for production)

### 2. Environment variables

Copy `.env.example` to `.env` and fill in real values. Each admin gets their **own access key** — the key you log in with identifies you in the activity log:

```
MONGODB_URI=mongodb+srv://...
ADMIN_USER_PASINDU_KEY=<long random string for Pasindu>
ADMIN_USER_PASINDU_NAME=Pasindu Hansana
ADMIN_USER_CHAMARA_KEY=<long random string for Chamara>
ADMIN_USER_CHAMARA_NAME=Chamara Perara
JWT_SECRET=<another long random string>
GEMINI_API_KEY=<Google Gemini API key, backend-only>
```

`GEMINI_API_KEY` powers the AI Assistant. It is read only in the serverless functions (`api/_lib/gemini.js`) — it is never sent to the browser, never committed to git, and never logged. Set it in the Vercel project's **Production** environment variables; do not put a real value in any file tracked by git.

To add more users, copy the `ADMIN_USER_<ID>_KEY` / `ADMIN_USER_<ID>_NAME` pair with a new ID. `.env` is git-ignored — never commit it. Also set these same variables in the Vercel project settings (Project → Settings → Environment Variables) for **Production**.

### 3. Run locally

`npm run dev` starts both the Vite frontend (`:5173`) and the Vercel serverless functions (`:3000`, proxied automatically):

```bash
npm run dev
```

You need the Vercel CLI (`npm i -g vercel`) and to have run `vercel login` once. If you only want the frontend or the API separately: `npm run dev:web` or `npm run dev:api`.

### 4. Deploy to Vercel

Push to your repo and let Vercel build the `frontend` directory (it already deploys this way). The `api/` folder becomes serverless functions automatically — no extra backend app needed.

### 5. Access the admin panel

- `/admin/login` — sign in with **your own access key** (Pasindu or Chamara)
- `/admin` — dashboard with project/task stats
- `/admin/projects` — create, edit, delete projects
- `/admin/projects/:id` — task board (To Do / In Progress / Review / Done)
- `/admin/activity` — audit log of every action, tagged with which user did it
- `/admin/designer` — designer workspace (Phase 15): organize each project's design references into sections/pages, attach notes to projects, sections, or references, with a right-hand notes panel and an "Ask AI" link into the assistant
- `/admin/reporting` — reporting workspace (Phase 16): generate, edit, preview, download, and regenerate professional business documents as PDFs
- `/admin/assistant` — AI chat assistant (Google Gemini, requires `GEMINI_API_KEY` env var). Uses a secured tool-calling layer: the model can trigger backend tools via a whitelisted registry with argument validation. Live tools: Projects — `createProject`, `getProject`, `updateProject` (Phase 4); Tasks — `createTask`, `getTask`, `updateTask`, `completeTask`; Issues — `createIssue`, `getIssue`, `updateIssue`, `resolveIssue` (Phase 5); Design References — `addDesignReference`, `getDesignReferences`, `updateDesignReference`, `deleteDesignReference` (Phase 6); Expenses — `createExpense`, `getExpense`, `getExpenses`, `updateExpense`, `deleteExpense` (Phase 7); Read-only Dashboard/data — `getDashboardStats`, `getProjectSummary`, `getPendingTasks`, `getOpenIssues`, `getExpenseSummary`, `getRecentActivity` (Phase 8, never modify data). All 30 tools are classified (13 read-only / 12 write / 5 destructive). Destructive tools (Phase 9) go through a **server-side confirmation flow** stored in MongoDB: the first call only asks "Continue?", nothing is deleted until the user confirms in a later message (same-message auto-confirmation is rejected), and declines cancel the pending action. The layer also enforces assistant-page authorization (403), prompt-injection defense, argument-size limits, and duplicate-create prevention. All wired to the real CRUD/service layer with natural-language name/title lookup, ambiguity handling, URL/amount/date validation, and relative-date filters (today/this week/this month/last month). Phase 11 added UI/perf/accessibility polish without changing logic: memoized components (no full-thread re-renders while typing), a Stop button that aborts the in-flight request, stale-response protection, smart auto-scroll, smooth message entry animations, an elapsed-time typing indicator, a screen-reader live region (`role="log"`/`aria-live`), Enter/Shift+Enter behavior, client + server context trimming (last 40 turns / ~25–30k chars), a server-side 55 s generate timeout (friendly 504 before the client's 60 s timeout), and reuse of the existing cached dashboard queries — no DB index changes, no new dependencies, streaming intentionally not enabled (tool-calling loop).

**Phase 13 — persistent conversations:** `/admin/assistant` now keeps a per-user chat history (ChatGPT/Gemini style). A sidebar (grouped Today / Yesterday / Older) lists each admin's own conversations; "New Chat" starts a fresh thread (only created on the first message); conversations can be renamed, cleared, or deleted; messages persist in MongoDB (`aiconversations`). Isolation is strict — the owner id always comes from the JWT (never from the client), and cross-user access returns 404. Follow-up messages automatically continue the thread with the last 40 turns (≤ 30k chars) of context.

**Phase 14 — project planning assistant:** describe a project idea in natural language (e.g. "Plan a coffee shop website with a homepage, menu and contact us, around 12 days") and the assistant produces a structured **Plan Preview** card — scope (requested / recommended / optional with reasons), a deterministic LKR price estimate derived from the app's pricing configuration (Gemini never invents prices), planned yearly expenses, scope-based development tasks, and a phase-mapped timeline (with an explicit warning when the deadline is unrealistic). Two new tools: `generateProjectPlan` (read-only, proposes only) and `createProjectFromPlan` (write, confirmation-gated). **Nothing is created until the user clicks "Create Project"** (or explicitly confirms in chat) — the plan is regenerated server-side from the same inputs and persisted through the existing project/task services; estimated expenses go to a separate `plannedexpenses` collection and are never recorded as paid. The UI renders rich AI tables safely (no raw HTML) via `RichText.jsx`. Per-user isolation, authorization, and the confirmation gate all continue to apply.

**Phase 15 — designer workspace & AI design tools:** `/admin/designer` replaces the flat reference workflow with a project → section/page → reference + note workspace. A project picker (sidebar on desktop, drawer on mobile) selects a project; the workspace shows sections/pages with grouped references (drag-free ordering via up/down, type/tag filters, and search), an uncategorized bucket, and a right-hand **notes panel** (project / section / reference context, drawer on smaller screens). References keep Phase 6 fields (`notes` stays a short description) and gain `sectionId`, `tags`, and `order`; new `designsections` and `designnotes` collections back the workspace. **New AI tools:** `createDesignSection`, `getDesignSections`, `updateDesignSection`, `deleteDesignSection`, `getDesignOverview`, `addDesignNote`, `getDesignNotes`, `updateDesignNote`, `deleteDesignNote`; the Phase 6 reference tools were extended with `sectionId`/`searchSection`/`tags`/`addTags` so the assistant can add references to a page, move them between pages, tag them, and summarize a project's design direction. Brainstorming never auto-creates sections — the assistant only creates them when the user explicitly asks. All deletes (section/note/reference) run through the existing server-side confirmation gate. REST endpoints: `/api/designsections`, `/api/designnotes`, and extended `/api/designreferences` (all designer-page authorized). **Tests:** a new `npm test` suite (`frontend/tests/`, Node's built-in test runner with an in-memory MongoDB mock) covers all three designer services (validation, ordering, section-scoped parents, cross-project isolation) and the AI tool handlers (name/project resolution, section moves, overview counts, and the confirmation-gated delete flows) — 39 tests.

**Phase 16 — AI-powered reporting & professional PDF generation:** `/admin/reporting` generates professional business documents — **Payment Invoice**, **Price Quotation**, **Project Proposal**, **Project Manual**, and **Other Report** — and stores them per-user with full versioning. Five document-generator cards open a two-step modal: pick a project (optional) and let Gemini draft structured content from real project data (project stats, tasks, issues, planned + actual expenses from Finance, design sections/references), or start from scratch; then edit a structured content form (title/subtitle/dates/currency, client, introduction, line items, pricing incl. paid/discount/taxes/balance, features, timeline, manual sections, notes) before saving a draft or generating the PDF. The PDF is built **directly server-side** with a dependency-free PDF 1.4 engine (`api/_lib/pdf/`) using the 14 standard fonts and a shared NexCode document theme — cover pages, running headers/footers with page numbers, info grids, tables with auto page breaks, pricing/payment-summary blocks, signature sections, and A4 sizing (no HTML-to-PDF or screenshot pipeline). PDFs are stored as binaries in the `reports` collection (metadata + blob together, capped at 10 MB); every generation bumps `pdfVersion`/`version` and appends to `versionHistory`, so past versions are never silently overwritten. Document numbering is database-safe and atomic (`INV/QUO/PRO/MAN-2026-001` via a `reportcounters` counter collection). Sensitive data (API keys, passwords, tokens, credentials, connection strings, private keys) is redacted recursively from stored content and from everything sent to the AI, so secrets can never appear in a report. Reports are strictly owner-scoped (the user id always comes from the JWT; cross-user access returns 404). **New AI tools:** `getReports` (read-only list), `generateReportDraft` (write, creates a draft only), `generateReportPdf` (write, confirmation-gated, never generates without explicit user confirmation), `deleteReport` (destructive, confirmation-gated). REST endpoints: `/api/reports`, `/api/reports/[id]`, `/api/reports/[id]/generate`, `/api/reports/[id]/file` (PDF download), `/api/reports/ai` — all requiring Reporting-page access. **Tests:** the `npm test` suite grew to 74 tests, adding coverage for the reports service (schema normalization, secret redaction, atomic numbering, ownership isolation, PDF buffer validity, versioning/history) and the four reporting AI tools (confirmation gates for generate/delete).

**Phase 17 — backend performance diagnosis & optimization:** the admin API (Dashboard, Projects, Finance, Reporting) now exposes opt-in, measurement-first performance logging that pinpoints exactly where every admin request's time goes. Enable it server-side with `ENABLE_PERFORMANCE_LOGGING=true` (or `1`) and each request logs `[PERF]` lines for `API_START`/`API_AUTH`/`BUSINESS_LOGIC_START|END`/`API_RESPONSE`/`API_TOTAL`, `DB_CONNECT_START|END` (marked `fresh` on a cold connect vs `reused`), `DB_RECONNECT`, `DB_CONNECT_FAILED`, and every Mongo operation (`collection=... op=... duration=...`); enable client-side timing by setting `localStorage.nexcode.perf = "1"` in the admin UI. On the server the single cached `MongoClient` is kept warm with a bounded idle re-ping (defaults: 45 s idle, 1 s ping timeout, `MONGO_IDLE_RECONNECT_MS` / `MONGO_PING_TIMEOUT_MS`), `serverSelectionTimeoutMS` is bounded to 4 s (was 8 s, `MONGO_SERVER_SELECTION_TIMEOUT_MS`) so a dead pooled socket after a serverless freeze fails fast instead of stalling, and two compound indexes were added (`activities {userId,timestamp}`, `transactions {projectId,date}`) so the hot filters/sorts are index-backed and no longer scanned + sorted in memory. `buildFinanceSummary` now uses a projection (only `type/amount/paidBy/paymentStatus/category/date`) instead of pulling whole transaction documents. The instrumentation overhead was measured at ~0.8 µs per call (disabled) and ~0.013 ms (enabled) — it cannot cause the multi-second delays. **Production measurement procedure:** set `ENABLE_PERFORMANCE_LOGGING=true`, hit `/api/stats` and `/api/projects` once (cold → expect a `fresh` connect ~1–6 s: DNS + TLS + handshake) and again immediately (warm → `reused`, sub-second), then read the `[PERF]` lines to see connect vs query vs business-logic split. **Tests:** `perf.test.js` + `measure-perf.test.js` — 89 tests pass, production build succeeds. (Live before/after connection numbers need a real `MONGODB_URI`; locally the suite verifies the instrumentation pipeline, safety, and the projection path analytically.)

## AI Assistant — Production Deployment

### Required environment variables (Production)

Set these in the Vercel project (Settings → Environment Variables → Production):

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string (used only inside serverless functions) |
| `JWT_SECRET` | Yes | Signs admin JWTs; use a long random string |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for the AI Assistant (backend-only) |
| `ADMIN_USER_<ID>_KEY` / `ADMIN_USER_<ID>_NAME` | Yes | One pair per admin access key |
| `MONGODB_DB_NAME` | No | Database name (defaults to `nexcode`) |
| `JWT_EXPIRES_IN` | No | Token lifetime (defaults to `7d`) |
| `GEMINI_MODEL` | No | Model name (defaults to `gemini-3.6-flash`, with automatic fallback) |
| `AI_RATE_LIMIT_MINUTE_MAX` | No | Max AI requests per user per minute (default `30`) |
| `AI_RATE_LIMIT_DAY_MAX` | No | Max AI requests per user per day (default `500`) |

### AI setup

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey) (Generative Language API).
2. Add it as `GEMINI_API_KEY` in the Vercel Production environment — never in a git-tracked file.
3. Optionally pin a model with `GEMINI_MODEL`. If it is removed/overloaded, the assistant falls back through the built-in model chain automatically.

### Production configuration

- **Same-origin API.** The Vite build and the `/api` serverless functions are served from the same Vercel project/domain, so no CORS configuration is needed or present. Do not add `Access-Control-Allow-Origin` headers unless you intentionally split the API onto another domain.
- **Security headers** (`vercel.json`): `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security` (HSTS), plus immutable asset caching.
- **Rate limiting.** `/api/assistant` is limited per admin user (burst + daily) using a durable MongoDB counter (`airatelimit`), so limits survive serverless cold starts. It fails OPEN (never breaks the assistant if the DB is unavailable) and returns `429` with `Retry-After` when exceeded.
- **Timeouts.** The server caps a Gemini generation at 55 s and returns a friendly `504` before the frontend's 60 s axios timeout — the UI never hangs forever.
- **Indexes.** `aiconfirmations`/`aidedupe`/`airatelimit` get idempotent TTL/unique indexes automatically on first use; the shared dashboard queries reuse the existing project/task/transaction indexes.

### How to verify the AI integration in production

1. **Page loads** — sign in as an admin with Assistant access and open `/admin/assistant`; the empty state shows "Meet your AI Assistant".
2. **Plain reply** — type a simple question (e.g. "Reply with the single word: ok") and confirm a reply appears with an "Online · Powered by Gemini" header.
3. **Tool calls** — ask "What's the AI health status?" and confirm the reply includes a `getAIHealthStatus` tool chip; ask "What's overdue?" for a `getPendingTasks` chip.
4. **Read-only data** — "Summarize the dashboard" must call `getDashboardStats` and never claim it changed anything.
5. **Write + read-back** — create a scratch project/task, confirm it appears in a follow-up summary, then delete it (see next step).
6. **Destructive confirmation** — ask the assistant to delete the scratch project. It must first ask "Continue?" and delete nothing; only after you confirm in a *later* message is it deleted. Declining must change nothing.
7. **Failure handling** — stop/abort mid-reply (Stop button), and temporarily misconfigure `GEMINI_API_KEY` to confirm a friendly error bubble appears (no stack traces, no keys) and the input recovers.
8. **Rate limit** — with `AI_RATE_LIMIT_MINUTE_MAX=1` temporarily set, a second message within the same minute returns "Too many AI requests".

## Security notes

- All `/api/*` endpoints require a JWT (`Authorization: Bearer <token>`), issued only when a valid per-user access key is submitted.
- The access keys and JWT secret live only in server-side environment variables — they are never shipped to the browser.
- The Mongo connection string is used only inside serverless functions.
- Every action (sign in, create/update/delete project or task) is written to the `activities` collection with the acting user's name.
