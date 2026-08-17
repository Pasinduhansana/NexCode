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
```

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
- `/admin/assistant` — AI chat assistant (Google Gemini, requires `GEMINI_API_KEY` env var). Uses a secured tool-calling layer: the model can trigger backend tools via a whitelisted registry with argument validation. Live tools: Projects — `createProject`, `getProject`, `updateProject` (Phase 4); Tasks — `createTask`, `getTask`, `updateTask`, `completeTask`; Issues — `createIssue`, `getIssue`, `updateIssue`, `resolveIssue` (Phase 5); Design References — `addDesignReference`, `getDesignReferences`, `updateDesignReference`, `deleteDesignReference` (Phase 6); Expenses — `createExpense`, `getExpense`, `getExpenses`, `updateExpense`, `deleteExpense` (Phase 7); Read-only Dashboard/data — `getDashboardStats`, `getProjectSummary`, `getPendingTasks`, `getOpenIssues`, `getExpenseSummary`, `getRecentActivity` (Phase 8, never modify data). All 30 tools are classified (13 read-only / 12 write / 5 destructive). Destructive tools (Phase 9) go through a **server-side confirmation flow** stored in MongoDB: the first call only asks "Continue?", nothing is deleted until the user confirms in a later message (same-message auto-confirmation is rejected), and declines cancel the pending action. The layer also enforces assistant-page authorization (403), prompt-injection defense, argument-size limits, and duplicate-create prevention. All wired to the real CRUD/service layer with natural-language name/title lookup, ambiguity handling, URL/amount/date validation, and relative-date filters (today/this week/this month/last month). Phase 11 added UI/perf/accessibility polish without changing logic: memoized components (no full-thread re-renders while typing), a Stop button that aborts the in-flight request, stale-response protection, smart auto-scroll, smooth message entry animations, an elapsed-time typing indicator, a screen-reader live region (`role="log"`/`aria-live`), Enter/Shift+Enter behavior, client + server context trimming (last 40 turns / ~25–30k chars), a server-side 55 s generate timeout (friendly 504 before the client's 60 s timeout), and reuse of the existing cached dashboard queries — no DB index changes, no new dependencies, streaming intentionally not enabled (tool-calling loop).

## Security notes

- All `/api/*` endpoints require a JWT (`Authorization: Bearer <token>`), issued only when a valid per-user access key is submitted.
- The access keys and JWT secret live only in server-side environment variables — they are never shipped to the browser.
- The Mongo connection string is used only inside serverless functions.
- Every action (sign in, create/update/delete project or task) is written to the `activities` collection with the acting user's name.
