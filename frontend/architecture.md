# NexCode — Architecture

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Vite 5, Tailwind CSS 3 |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | MongoDB (native driver, not Mongoose) |
| Auth | JWT (`jsonwebtoken`), SHA-256 hashed access keys |
| Charts | Recharts |
| Animations | Framer Motion, GSAP |
| PWA | vite-plugin-pwa (service worker, manifest) |
| Deployment | Vercel (frontend + API in same project) |

---

## 2. Directory Structure

```
NexCode/
├── .vercel/                          # Vercel deployment config
├── Design Ideas/                     # Reference designs (not deployed)
└── frontend/                         # Single deployable unit
    ├── api/                          # Vercel Serverless Functions
    │   ├── _lib/                     # Shared serverless helpers
    │   │   ├── activity.js           # Activity logging helper
    │   │   ├── auth.js               # JWT sign/verify, requireAuth middleware
    │   │   ├── cache.js              # In-memory cache (invalidation pattern)
    │   │   ├── designreferences.js   # Shared Design Reference service layer (routes + AI tools)
    │   │   ├── finance.js             # Shared Finance/Expense service layer (routes + AI tools)
    │   │   ├── gemini.js             # Google Gemini service (AI Assistant + tool loop)
    │   │   ├── issues.js             # Shared Issue service layer (routes + AI tools)
    │   │   ├── mongodb.js            # MongoDB connection singleton
    │   │   ├── projects.js           # Shared Project service layer (routes + AI tools)
    │   │   ├── stats.js              # Shared Dashboard stats service (routes + AI tools)
    │   │   ├── tasks.js              # Shared Task service layer (routes + AI tools)
    │   │   ├── tools/                # AI tool-calling layer (Phase 3 → Phase 9)
    │   │   │   ├── registry.js       # Tool definitions/schemas + handlers (30 tools, 13 RO / 12 WRITE / 5 DESTRUCTIVE)
    │   │   │   ├── executor.js       # Generic tool execution + structured logging + duplicate prevention
    │   │   │   ├── confirmation.js   # Durable (MongoDB) pending-action confirmation store
    │   │   │   ├── validate.js       # JSON-schema argument validation (size limits)
    │   │   │   └── index.js          # Public exports
    │   │   └── users.js              # User CRUD, access control, password hashing
    │   ├── auth/
    │   │   ├── login.js              # POST — authenticate by access key
    │   │   └── verify.js             # GET — validate JWT, return user + access
    │   ├── designreferences.js      # GET/POST design references
    │   ├── designreferences/[id].js # GET/PUT/DELETE design reference
    │   ├── finance.js                # GET/POST transactions (+ summary, filters)
    │   ├── finance/[id].js           # PUT/DELETE transaction
    │   ├── issues.js                 # GET/POST issues
    │   ├── issues/[id].js            # GET/PUT/DELETE issue
    │   ├── kanban.js                 # GET kanban summary (project task counts)
    │   ├── activities.js             # GET activity log
    │   ├── assistant.js              # POST chat messages → Gemini (AI Assistant)
    │   ├── projects.js               # GET/POST projects
    │   ├── projects/[id].js          # GET/PUT/DELETE project
    │   ├── stats.js                  # GET dashboard stats
    │   ├── tasks.js                  # GET/POST tasks
    │   ├── tasks/[id].js             # PUT/DELETE task
    │   ├── users.js                  # GET/POST users (list + create)
    │   ├── users/[id].js             # GET/PUT/DELETE user
    │   └── users/[id]/password.js    # PUT change password
    │
    ├── src/
    │   ├── App.jsx                   # Root — public + admin routes
    │   ├── main.jsx                  # Entry point
    │   ├── index.css                 # Global styles (Tailwind, scrollbar, animations)
    │   │
    │   ├── components/               # Public site components
    │   │   ├── Navbar.jsx            # Main navigation bar
    │   │   ├── Footer.jsx            # Site footer
    │   │   ├── Hero.jsx              # Landing page hero
    │   │   ├── Button.jsx            # Reusable button (gradient, glow, variants)
    │   │   ├── FAQ.jsx               # Accordion FAQ section
    │   │   ├── FeaturedProjects.jsx  # Project showcase carousel
    │   │   ├── IndustrySolutions.jsx # Industry cards section
    │   │   ├── ServiceCard.jsx       # Service display card
    │   │   ├── Offersbanner.jsx      # Promotional banner
    │   │   ├── AdModal.jsx           # Advertisement modal (auto-rotate)
    │   │   ├── PageSkeleton.jsx      # Loading skeleton for pages
    │   │   ├── SectionLabel.jsx      # Section heading badge
    │   │   ├── ScrollToTop.jsx       # Scroll restoration on route change
    │   │   └── WhatsAppFloat.jsx     # Floating WhatsApp button
    │   │
    │   ├── pages/                    # Public pages
    │   │   ├── HomePage.jsx          # Landing page
    │   │   ├── AboutPage.jsx         # About us
    │   │   ├── ContactPage.jsx       # Contact form (Formspree)
    │   │   ├── ServicesPage.jsx      # Services listing
    │   │   ├── ShowcasePage.jsx      # Project showcase grid
    │   │   ├── ProjectDetailPage.jsx # Individual project view
    │   │   ├── ProjectRequestPage.jsx# Project inquiry form (3-step wizard)
    │   │   ├── PrivacyPolicyPage.jsx # Privacy policy
    │   │   └── TermsOfServicePage.jsx# Terms of service
    │   │
    │   ├── context/
    │   │   └── ThemeContext.jsx       # Light/dark theme (localStorage persistence)
    │   │
    │   ├── data/                     # Static data (no API calls)
    │   │   ├── adSlides.js           # Ad modal content
    │   │   ├── faqItems.js           # FAQ questions/answers
    │   │   ├── services.js           # Service definitions
    │   │   ├── showcaseProjects.js   # Portfolio project data
    │   │   └── socialLinks.js        # Social media URLs
    │   │
    │   ├── hooks/
    │   │   ├── useAdModal.js         # Ad modal state (cooldown-based)
    │   │   └── useFilterSync.js      # URL ↔ filter state sync
    │   │
    │   ├── utils/
    │   │   ├── api.js                # Axios instance (public API)
    │   │   ├── normalizeSlug.js      # Slug normalization
    │   │   ├── useGsapReveal.js      # GSAP scroll reveal hook
    │   │   ├── usePageTitle.js       # Dynamic document.title hook
    │   │   └── useThemeClasses.js    # Theme-aware CSS class generator
    │   │
    │   └── Admin/                    # Admin panel (self-contained module)
    │       ├── components/
    │       │   ├── AdminLayout.jsx   # Admin shell (sidebar + content area)
    │       │   ├── AdminSidebar.jsx  # Collapsible sidebar, access-filtered links
    │       │   ├── Modal.jsx         # Base modal wrapper
    │       │   ├── ConfirmDialog.jsx # Confirmation dialog
    │       │   ├── EmptyState.jsx    # Empty state placeholder
    │       │   ├── Spinner.jsx       # Loading spinner
    │       │   ├── StatCard.jsx      # Dashboard stat card
    │       │   ├── StatusBadge.jsx   # Colored status/priority badge
    │       │   ├── PremiumSelect.jsx # Custom dropdown (replaces native <select>)
    │       │   ├── TaskCard.jsx      # Kanban task card
    │       │   ├── TaskTableView.jsx # Task table view
    │       │   ├── TaskDetailModal.jsx # Read-only task viewer
    │       │   ├── TaskFormModal.jsx # Task create/edit form
    │       │   ├── TaskNotesModal.jsx # Task notes editor
    │       │   ├── ProjectFormModal.jsx # Project create/edit form
    │       │   ├── AdminProjectTableView.jsx # Project table view
    │       │   ├── TransactionFormModal.jsx # Finance transaction form
    │       │   ├── FinanceCharts.jsx # Bar + donut charts
    │       │   ├── KanbanGantt.jsx   # Timeline/Gantt chart
    │       │   ├── SettlementSummary.jsx # Splitwise-like settlement
    │       │   └── Assistant/        # AI Assistant chat UI
    │       │       ├── ChatMessage.jsx      # User/AI message bubble
    │       │       ├── ChatInput.jsx        # Message input + send
    │       │       ├── ChatEmptyState.jsx   # Welcome/suggestion state
    │       │       └── TypingIndicator.jsx  # Loading dots
    │       │
    │       ├── context/
    │       │   └── AdminAuthContext.jsx # Auth state + access hooks
    │       │
    │       ├── data/
    │       │   └── constants.js      # Task/project statuses, priorities, colors
    │       │
    │       ├── pages/
    │       │   ├── AdminLoginPage.jsx     # Access key login
    │       │   ├── AdminDashboardPage.jsx  # Stats + finance + activity
    │       │   ├── AdminProjectsPage.jsx   # Project list (grid/table)
    │       │   ├── AdminProjectDetailPage.jsx # Project detail + task board
    │       │   ├── AdminKanbanPage.jsx     # Board / Table / Timeline views
    │       │   ├── AdminFinancePage.jsx    # Transactions + charts + settlement
    │       │   ├── AdminActivityPage.jsx   # Activity log
    │       │   ├── AdminDesignerPage.jsx   # Placeholder
    │       │   ├── AdminAccessPage.jsx     # User access management
    │       │   └── AdminAssistantPage.jsx  # AI Assistant chat
    │       │
    │       └── utils/
    │           ├── adminApi.js       # Axios instance (admin API, JWT header)
    │           ├── auth.js           # localStorage helpers (token, user)
    │           ├── assistantApi.js   # AI Assistant API client (POST /api/assistant)
    │           └── date.js           # Date formatting utilities
    │
    ├── assets/                       # Project showcase images/videos
    ├── public/fonts/                 # Self-hosted .woff2 fonts
    ├── dist/                         # Vite build output
    ├── tailwind.config.js            # Theme (light/dark), input-field, card, badge CSS
    ├── vite.config.js                # Vite config
    ├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
    └── package.json                  # Dependencies + scripts
```

---

## 3. Process Flows

### 3.1 Authentication Flow

```
User enters access key
        │
        ▼
POST /api/auth/login  { accessKey }
        │
        ├─ users.js: getUserByCredentials(accessKey)
        │   └─ Iterates all users in MongoDB "users" collection
        │   └─ SHA-256 hashes the key and compares with stored keyHash
        │
        ├─ On match → signToken({ uid, name, superAdmin, access })
        │   └─ JWT signed with JWT_SECRET, expires in 7d
        │
        └─ Returns { token, user: { id, name, superAdmin, access } }
                │
                ▼
        AdminAuthContext.login(token, user)
                │
                ├─ Stores token + user in localStorage
                ├─ Sets axios Authorization header
                └─ Redirects to /admin
```

### 3.2 Auth Verification (on page load)

```
AdminAuthContext mounts
        │
        ▼
GET /api/auth/verify  (Bearer token)
        │
        ├─ Verify JWT → extract payload { uid, name, superAdmin, access }
        │
        ├─ On valid → setUserState(data.user) — updates context
        │   └─ Sidebar reads access → filters visible nav links
        │   └─ Dashboard reads hasDashboardComponent() → shows/hides sections
        │
        └─ On invalid → clearSession() → redirect to /admin/login
```

### 3.3 Access Control Model

```
User document in MongoDB "users" collection:
{
  _id: "pasindu",              // lowercase ID
  name: "Pasindu",
  keyHash: "sha256-hashed-key",
  superAdmin: true,            // pasindu, chamara
  access: {
    pages: ["dashboard", "projects", "board", "designer", "finance", "activity", "access"],
    dashboardComponents: ["stats", "finance", "projects", "tasks"],
    projectAccess: "all",      // "all" | "assigned" | "none"
    projectIds: [],            // used when projectAccess = "assigned"
    expenseAccess: "edit",     // "edit" | "view" | "none"
  },
  createdAt: "ISO date",
  updatedAt: "ISO date"
}
```

**Permission checks:**
- `hasAccess(pageId)` — Sidebar hides pages user can't access; direct URL navigates redirect to /admin
- `hasDashboardComponent(compId)` — Dashboard sections conditionally rendered
- `hasProjectAccess()` — Controls project list visibility in board/kanban filters
- `hasExpenseAccess()` — Controls add/edit/delete on finance page
- Super admins (`pasindu`, `chamara`) bypass all checks — see everything, can manage all users

### 3.4 Data Flow — API Request Cycle

```
Frontend component
        │
        ▼
adminApi.get("/projects")    ← axios instance with JWT header
        │
        ▼
Vercel routes → /api/projects.js
        │
        ▼
requireAuth(handler)         ← extracts Bearer token, verifies JWT, sets req.user
        │
        ▼
getCollection("projects")    ← MongoDB singleton connection (cached globally)
        │
        ▼
MongoDB query → result
        │
        ▼
res.status(200).json(data)   ← returned to frontend
        │
        ▼
Component updates state → renders
```

### 3.5 MongoDB Connection Pattern

```
connectDB() called
        │
        ├─ cached.conn exists? → return it (reuse across invocations)
        │
        └─ First call / cold start:
            │
            ├─ new MongoClient(uri) → .connect()
            │   └─ Connection cached in globalThis.__mongo
            │   └─ ensureIndexes() fires async (non-blocking)
            │
            └─ Returns client → getCollection(name) → collection handle
```

### 3.6 User Migration (env → MongoDB)

```
First login attempt
        │
        ▼
ensureDefaultUsers() called
        │
        ├─ users collection has documents? → return (skip)
        │
        └─ Empty collection:
            │
            ├─ Reads ADMIN_USER_*_KEY, ADMIN_USER_*_NAME from env vars
            ├─ Creates user docs with SHA-256 hashed keys
            ├─ Sets superAdmin: true for "pasindu" and "chamara"
            └─ Inserts into "users" collection
```

### 3.7 Deployment Flow

```
git push → Vercel auto-deploys
        │
        ├─ Frontend: Vite build → dist/ → served as static files
        │   └─ PWA: service worker + manifest generated
        │
        └─ API: Each file in api/ → separate serverless function
            │
            ├─ /api/auth/login → api/auth/login.js
            ├─ /api/projects → api/projects.js
            ├─ /api/projects/:id → api/projects/[id].js
            └─ /api/users/:id/password → api/users/[id]/password.js
```

### 3.8 AI Assistant Flow

```
User sends a chat message
        │
        ▼
sendAssistantMessage(message, history)   ← src/Admin/utils/assistantApi.js
        │
        ├─ Builds full conversation: history + new user message
        │
        ▼
POST /api/assistant  { messages: [...] }   ← adminApi (JWT header, 60s timeout)
        │
        ▼
requireAuth(handler)                       ← verifies Bearer token
        │
        ▼
api/assistant.js                           ← validates messages (non-empty, ≤40 turns,
        │                                    ≤4000 chars each, last turn is user)
        ▼
api/_lib/gemini.js  generateReply({ messages, user })
        │
        ├─ Requires GEMINI_API_KEY (env) — never shipped to the browser
        ├─ Maps roles: user→"user", assistant→"model"
        ├─ Attaches tool definitions (api/_lib/tools/registry.js) to every request
        │   └─ 14 function declarations passed via config.tools
        │
        ├─ Calls Google Gemini via @google/genai SDK
        │   └─ Model chain (GEMINI_MODEL first, then gemini-3.6-flash → 3.7-flash
        │      → 3.5-flash-lite → flash-latest) — retries/falls back on 429/503/404
        │
        ├─ Tool-calling loop (up to 4 rounds):
        │   ├─ Model returns text → reply is final
        │   └─ Model returns functionCalls → for each call:
        │       ├─ executor.js: lookup tool in registry
        │       │   ├─ unknown name → error result (rejected)
        │       │   ├─ validate.js: check args vs JSON schema (required + types)
        │       │   │   └─ invalid → error result
        │       │   └─ handler(args, { user: req.user }) — auth context passed in
        │       ├─ result appended as functionResponse part (createPartFromFunctionResponse)
        │       └─ second generateContent → final reply
        │
        ├─ On success → 200 { reply, tools? }  → rendered as an AI message bubble
        │   └─ tools: [{ name, ok }] — shown as small chips under the bubble
        │
        └─ On failure → classified GeminiServiceError:
            ├─ Missing API key  → 503 "AI assistant is not configured"
            ├─ Rate limit/quota → 429 "AI service temporarily overloaded"
            ├─ Network error    → 502 "Could not reach the AI service"
            └─ Gemini error     → 502 "AI service returned an error"
        └─ Frontend renders the error message in an error-styled bubble
```

### 3.9 AI Tool-Calling Layer (Phase 3 → Phase 9)

**Purpose:** allow the Gemini assistant to invoke trusted backend actions via a generic, secured tool pipeline. Phase 4 wired the three Project tools to the real Project CRUD service; Phase 5 added live Task and Issue tools; Phase 6 added live Design Reference tools; Phase 7 added live Expense tools; Phase 8 replaced the `getDashboardStats` stub with six live **read-only** dashboard/data-query tools; Phase 9 hardened the layer for production: server-side **confirmation flows** for all destructive tools, backend-only **authorization** matching the admin UI's Assistant page access, **prompt-injection defense**, **input-size limits**, **duplicate-operation prevention**, and safe server-side logging.

```
User message
    │
    ▼
Gemini (function calling) → selects tool + structured args
    │
    ▼
api/_lib/tools/executor.js  executeToolCall({ name, args, user, requestId })
    │
    ├─ name not in registry → { ok: false, error: "Unknown tool: …" }
    │
    ├─ validate.js → args checked against the tool's JSON schema (max 25 args,
    │   │            strings ≤ 5000 chars, arrays ≤ 50 items, min/max on numbers)
    │   └─ missing required / wrong type / unknown key / too large → { ok: false, error }
    │
    ├─ checkDuplicate → identical create within 60 s (per user) → { ok: true, status: "duplicate" }
    │
    └─ tool.handler(args, { user, requestId }) → { ok, status, result }
        │
        ├─ READ_ONLY (13): getAIHealthStatus, getProject, getTask, getIssue,
        │   getDesignReferences, getExpense, getExpenses, getDashboardStats,
        │   getProjectSummary, getPendingTasks, getOpenIssues, getExpenseSummary,
        │   getRecentActivity
        ├─ WRITE (12): createProject, updateProject, createTask, updateTask,
        │   completeTask, createIssue, updateIssue, resolveIssue,
        │   addDesignReference, updateDesignReference, createExpense, updateExpense
        └─ DESTRUCTIVE (5): deleteProject, deleteTask, deleteIssue,
            deleteDesignReference, deleteExpense  (server-side confirmation flow)
    │
    ▼
Result returned to Gemini as a functionResponse → final reply to user
```

**Live Project tools (Phase 4):**
- `createProject`: requires `name`; defaults `status: planning`, `priority: medium`, `paidStatus: pending`, `color: #3699f3`; logs activity + invalidates `kanban`/`stats` cache; returns `{ success, message, project }`.
- `getProject`: resolves a project by `id` or natural-language `searchName`; returns the project with its tasks.
- `updateProject`: resolves the target the same way, then patches any validated fields (using `name` also allows renaming).
- Name resolution (`resolveProjectId`): exact case-insensitive match first, then "contains" match; 0 matches → 404 `Project "<name>" not found`; >1 → 400 listing candidates; neither id nor name → 400.
- Errors: `ProjectServiceError(message, status)` sets `expose = true`; `executor.js` only surfaces `err.message` when `expose` is true, otherwise returns a generic message — DB errors and stack traces never leak to the model or the user.

**Live Task tools (Phase 5):**
- `createTask`: project required (`projectId` or `searchProject` name); `title` required; `status` ∈ todo/in_progress/review/done (default todo), `priority` ∈ low/medium/high/urgent (default medium), plus description, assignee, dueDate, startDate, endDate, estimatedHours, notes, order.
- `getTask`: resolves by `searchTitle` (optionally scoped to a project) or `id`; returns the task or a list of tasks when only a project is given.
- `updateTask` / `completeTask`: `completeTask` reuses the same update path with `status: "done"`.
- Resolution (`findTask`): exact match → single "contains" match → 404; multiple matches → 400 "Multiple tasks match" with candidates so the model can ask the user which one.
- Errors: `TaskServiceError(message, status)` with `expose = true`, same sanitization as projects. Writes call `logActivity()` and `invalidate("kanban", "stats")`.

**Live Issue tools (Phase 5):**
- `createIssue`: project required (`projectId` or `searchProject`); `title` required; `severity` ∈ low/medium/high/critical (default medium), `status` ∈ open/in_progress/resolved/closed (default open), `priority` ∈ low/medium/high/urgent (default medium), plus description, assignee, dueDate.
- `getIssue`: resolves by `searchTitle` or `id`; list by `projectId`/`searchProject` with optional `status` filter.
- `updateIssue` / `resolveIssue`: `resolveIssue` reuses the update path with `status: "resolved"`.
- Resolution (`findIssue`): same exact/contains/ambiguity behavior as `findTask`.
- Errors: `IssueServiceError(message, status)` with `expose = true`. Issues have no cached consumer, so no cache invalidation; writes still call `logActivity()`.

**Live Design Reference tools (Phase 6):**
- `addDesignReference`: project required (`projectId` or `searchProject`); `url` (validated `http(s)`) and `title` required — if the user gives only a link, the model derives a short title (e.g. "Figma link"); `type` ∈ website/image/file/other (default website) and `notes` are optional.
- `getDesignReferences`: resolves by `searchTitle` or `id`, or lists a project's references by `projectId`/`searchProject` (optionally filtered by `type`).
- `updateDesignReference`: identifies the reference with `id`/`searchTitle` (optionally scoped to a project), then patches `title`, `url` (re-validated), `type`, or `notes`.
- `deleteDesignReference`: identifies the reference the same way, then goes through the **server-side confirmation flow** (see "Destructive tools & confirmation flow (Phase 9)" below) — the first call only returns a pending confirmation request and deletes nothing; it executes only after the user explicitly confirms and the model re-calls the tool with `confirmed: true` in a later message. Deletion is never silent.
- URL validation: `normalizeUrl` parses with `new URL()`, accepts only `http`/`https`, and rejects anything else with 400 "Invalid URL. Please provide a valid http(s) link."
- Resolution (`findDesignReference`): exact match → single "contains" match → 404; multiple → 400 with candidates.
- Errors: `DesignReferenceServiceError(message, status)` with `expose = true`. No cached consumer, so no cache invalidation; writes call `logActivity()` with `targetType: "designReference"`.
- Note: no duplicate prevention (matches tasks/issues behavior — the backend does not block duplicate titles per project).

**Live Expense tools (Phase 7):**
- `createExpense`: `amount` required (LKR, plain number; the model strips "LKR"/"Rs"/commas); always records `type: "expense"` (the shared `parseTransaction` defaults other inputs to "income", so the tool passes it explicitly); optional `description`, `category`, `date` (defaults to today), `paidBy`, `paymentStatus`, and `projectId`/`searchProject` (expenses may exist without a project).
- `getExpense`: resolves a single expense by `id` or `searchDescription` (a phrase from the description, optionally scoped to a project).
- `getExpenses`: lists expenses (defaults `type: "expense"`) with filters for `projectId`/`searchProject`, `category`, `type` (override), and `dateFrom`/`dateTo` — the latter accept YYYY-MM-DD or words (`today`, `yesterday`, `this week`, `this month`, `last month`) converted server-side via `resolveDateRangeToken`.
- `updateExpense`: identifies the target with `id`/`searchDescription`, then patches `amount`, `category`, `description`, `date`, `paidBy`, `paymentStatus`.
- `deleteExpense`: identifies the target the same way, then goes through the **server-side confirmation flow** (see below) — the first call only returns a pending confirmation request and deletes nothing; it executes only after the user explicitly confirms and the model re-calls the tool with `confirmed: true` in a later message.
- Amount validation (existing app rule): finite and `>= 0`, rounded to 2 decimals — negatives are rejected 400 "Valid amount is required". Dates are validated (`new Date()` + NaN check) → 400 "Invalid date" for malformed values.
- Resolution (`findExpense`): exact description match → single "contains" match → 404; multiple → 400 with candidates.
- Errors: `FinanceServiceError(message, status)` with `expose = true`. Writes call `invalidate("finance")` (covers the `finance:summary` cache) and `logActivity()` with `targetType: "finance"`.

**Live Read-only Dashboard tools (Phase 8):**
- These tools only ever read data — they call the same shared services/aggregations the UI uses (no duplicated calculations, no arbitrary DB access, no writes, no shell/HTTP execution). They are intentionally scoped for the model: `getExpenseSummary` returns aggregated totals and top-8 breakdowns rather than raw rows, and list tools cap records (`getPendingTasks`/`getOpenIssues` default 20, max 100; `getRecentActivity` default 10, max 50).
- `getDashboardStats`: reuses the exact dashboard aggregation via the shared `buildDashboardStats()` service (`api/_lib/stats.js`, cached under `stats:all` like the `/api/stats` route). Returns totals (projects, tasks, open/completed, overdue, budget), status counts, recent projects (6), overdue tasks (5), and a trimmed finance summary (totals, top-8 category breakdown, last 6 months, by-paid-by). Answer for "how many projects/tasks", "how is the business doing overall".
- `getProjectSummary`: resolves a project by `projectId`/`searchProject` (reuses `resolveProjectScope`); if neither is given it throws an exposed error so the model asks which project. Returns the project's core fields, task counts by status, open-issue count (`listIssuesByProject(projectId, "open")`), and total spent (`listTransactions({ type: "expense", projectId })`).
- `getPendingTasks`: lists tasks whose status is not `done`, optionally scoped to a project and filtered by `priority`/`status`, sorted by due date; returns count, overdue count, and a capped list. Reuses `listTasksByProject`.
- `getOpenIssues`: lists `status: "open"` issues, optionally scoped to a project and filtered by `severity`/`priority`. Empty results produce a plain "no open issues" message so the model states that instead of inventing data.
- `getExpenseSummary`: filters by project/category and a `dateFrom`/`dateTo` range (YYYY-MM-DD or `today`/`yesterday`/`this week`/`this month`/`last month`, resolved via the shared `resolveDateRangeToken`). Returns total spent, expense count, current-month spend (when no range is given), top-8 category breakdown, and top-8 per-project breakdown (project names resolved from `listProjects`). Note: it reads through `listTransactions`, which the existing finance service caps at the 200 most recent transactions — totals are exact for the loaded set (same ceiling the `/api/finance` list uses).
- `getRecentActivity`: reuses the new `listActivities()` service (also used by the refactored `/api/activities` route), filtered by `limit`/`user`/`action`/`targetType`; returns a capped list of recent entries.
- All read-only tools return `{ success, message, … }`; the message is pre-formatted so the model can repeat figures accurately. No cache invalidation, no `logActivity` — they never touch state.
- Permission model: the assistant endpoint is `requireAuth`-gated and passes `req.user` into every tool call, matching the rest of the tool layer. The app's existing server reads do not apply per-component/per-project filtering (access gating is client-side component hiding), so the read-only tools behave the same as the dashboard endpoints they reuse.

**Tool permission classification (Phase 9):**
- Every tool carries a `category` (`READ_ONLY` / `WRITE` / `DESTRUCTIVE`) from `TOOL_CATEGORY_MAP`, exposed via `getToolCategories()` for the health/tool-listing checks. Current totals: 13 READ_ONLY + 12 WRITE + 5 DESTRUCTIVE = 30 tools.

**Destructive tools & confirmation flow (Phase 9):**
- The five `DESTRUCTIVE` tools (`deleteProject`, `deleteTask`, `deleteIssue`, `deleteDesignReference`, `deleteExpense`) never delete on the initial call. The first unconfirmed call creates a **pending confirmation** and returns `{ status: "confirmation_required", message: "You're about to delete the <kind> \"<label>\". Continue?" }`; the model relays it and asks the user.
- The pending action lives in a **durable MongoDB store** (`aiconfirmations`, unique `{ user, tool, fingerprint }` index, `expiresAt` TTL ~5 min) — not in memory — so the flow survives across HTTP requests / serverless cold starts. `fingerprint` is the record's `_id`, binding the confirmation to the exact target.
- After the user explicitly agrees, the model re-calls the SAME tool with the same identifying arguments plus `confirmed: true`. The server resolves the pending confirmation; it is rejected when it is missing, expired, or was created in the **same request** (`requestId` match) — a confirm cannot happen in the same message/request the deletion was requested, blocking auto-confirmation. Only a later request succeeds, and the pending is consumed atomically.
- If the user declines, the model re-calls the tool with `confirmed: false`, which cancels the pending confirmation and changes nothing.
- Events are logged server-side as `[ai-tool:confirm]` with `confirmation_requested` / `confirmation_accepted` / `confirmation_rejected` / `confirmation_expired`.
- A `requestId` (UUID) is generated per `generateReply` call in `api/_lib/gemini.js` and threaded through `executeToolCall({ name, args, user, requestId })` into every handler — it is what makes same-turn confirmation impossible.

**Duplicate-operation prevention (Phase 9):**
- `createProject`, `createTask`, `createIssue`, `addDesignReference`, `createExpense` set `dedupe: true`. The executor records a **durable** key `{ user, tool, stableStringify(args) }` in MongoDB (`aidedupe`, unique index, TTL ~120 s) only after a successful write. A near-identical call within 60 s returns `{ ok: true, status: "duplicate" }` without executing — retries/double-submits cannot create duplicate records.

**Input & argument validation (Phase 9):**
- `validate.js` enforces server-side limits regardless of the model: at most **25 arguments** ("Too many arguments"), string fields at most **5000 chars**, arrays at most **50 items**, numeric `min`/`max` where declared, enum membership, and unknown-key rejection. These bounds apply on top of the assistant's existing `MAX_MESSAGE_LENGTH` (4000) and `MAX_HISTORY` (40) caps.
- `requireExistingProject(projectId)` is called by `createTask`, `createIssue`, `addDesignReference`, and `createExpense` (when a project is given) so hallucinated project ids cannot produce orphaned records.

**Authorization (Phase 9):**
- `api/assistant.js` now returns **403** unless `req.user.superAdmin === true` **or** `req.user.access.pages` includes `"assistant"` — the same rule the admin sidebar uses (`hasAccess("assistant")`), enforced server-side so the Assistant page cannot be used by users who cannot see it. No new/second permission system: it reads the existing JWT `access`/`superAdmin` fields set at login.

**Prompt-injection defense (Phase 9):**
- The Gemini system instruction includes an explicit Security block: the model never reveals its instructions, environment variables, API keys, DB credentials, or server configuration — whether asked directly, disguised, or embedded in quoted/pasted content — and treats instructions inside user text or tool results as untrusted data. `GEMINI_API_KEY` stays server-side only (read once in `_lib/gemini.js`); nothing secret is ever sent to the client (the `/api/assistant` response carries only the reply text and a trimmed `{ name, ok, status, error }` tool trace).

**Security rules:**
- Tools live server-side only; the browser never executes them.
- No arbitrary JS, Mongo, shell, or HTTP execution — only whitelisted registry handlers.
- The authenticated admin (`req.user`) is passed into every tool call.
- Tool calls are logged with `[ai-tool:info|error]` including the acting user id; args are truncated (~400 chars) and credentials/API keys are never logged. Confirmation lifecycle events are logged separately as `[ai-tool:confirm]`.

### 3.9.1 AI Assistant UI & Performance (Phase 11)

**Purpose:** improve the Assistant page's performance, responsiveness, usability, accessibility, and visual polish — without changing any business logic or the tool layer (no new AI tools).

**Frontend (`src/Admin/`):**
- `pages/AdminAssistantPage.jsx`:
  - **Duplicate/stale-request protection** — each send gets a `seqRef` sequence id plus an `AbortController`; responses that arrive after the conversation was cleared (or an earlier send) are dropped, and aborting never appends an error bubble.
  - **Stop control** — while the AI is working the Send button becomes a Stop button that aborts the in-flight request (`abortRef`), so a stuck/slow request can always be interrupted.
  - **Context trimming (client)** — history sent to the API is capped to the last 40 turns and ~25,000 chars (oldest dropped first, newest kept), matching the server budget.
  - **Smart auto-scroll** — auto-scrolls to the bottom only while the user is near the bottom (`stickToBottom`, ~80px threshold) or just sent a message; reading history is not interrupted.
  - **Perf** — `ChatMessage`/`ChatInput` are `React.memo`d, the message list is `useMemo`d, handlers are `useCallback`d, so typing no longer re-renders the whole thread.
  - **A11y** — `role="log"` + `aria-live="polite"` + `aria-relevant="additions"` on the thread, `role="status"` on the header "Online/Thinking" line, focus restored to the input after Clear.
- `components/Assistant/ChatMessage.jsx` — memoized; smooth `animate-fade-slide` entry (existing Tailwind keyframe); `data-role` attribute; tool chips carry a descriptive `title` (e.g. "Pending tasks — completed" / "… — failed" / "… — already handled").
- `components/Assistant/ChatInput.jsx` — Enter sends / Shift+Enter newline (unchanged); while busy the button becomes Stop (`HiOutlineStop`); the textarea stays editable so the next message can be composed; `aria-label` + `aria-describedby`; dynamic helper hint.
- `components/Assistant/TypingIndicator.jsx` — `role="status"` and an elapsed-seconds counter, so a long request visibly progresses instead of looking frozen.
- `components/Assistant/ChatEmptyState.jsx` — suggestion buttons are disabled while a request is in flight.
- `utils/assistantApi.js` — accepts an optional `{ signal }`; aborts throw `AssistantAbortError`, which the page suppresses (no error bubble, typing state cleared).

**Backend:**
- `api/assistant.js` — server-side context budget `MAX_CONTEXT_CHARS` (30,000) trims oldest turns before hitting Gemini; an overall `GENERATE_TIMEOUT_MS` (55 s) via `Promise.race` returns a friendly 504 *before* the client's 60 s axios timeout, so the UI can never hang forever. `sanitizeMessages` is exported for unit testing.
- **No database index changes.** The read-only dashboard tools already reuse the existing cached aggregations and indexed queries the UI routes use (`stats:all` 60 s, `finance:summary` 30 s, `kanban:all` 30 s, activities 10 s).
- **Streaming (req 17/18) is intentionally not enabled**: the assistant is a multi-round tool-calling loop (`generateContent` + `functionResponse`), so the final reply text is only produced after tool rounds complete. Streaming partial text would complicate function-calling safety and require an SSE client. The high-quality typing/loading state (animated indicator, elapsed counter, Stop button, immediate user-message render) is provided instead.

### 3.10 Shared Project Service Layer (`api/_lib/projects.js`)

Routes and AI tools both call this single service — no duplicated CRUD logic.

```
api/projects.js        ─┐  ┌→ createProject(input, user)
api/projects/[id].js   ─┼──┼→ getProjectById(id)   (includes tasks)
registry.js handlers   ─┘  ├→ resolveProjectId({ id, searchName })
                           ├→ updateProject(id, input, user)
                           ├→ deleteProject(id, user)   (routes only, NOT an AI tool)
                           └→ ProjectServiceError
```
- `requireAuth` enforced in the route handlers; tools receive `req.user` from `assistant.js`.
- Write operations call `logActivity()` and `invalidate("kanban", "stats")` — identical behavior to the previous route implementations.
- The REST endpoints (`api/projects.js`, `api/projects/[id].js`) were refactored into thin wrappers that map `ProjectServiceError` to `status`/`message` JSON.

### 3.11 Shared Task & Issue Service Layers (`api/_lib/tasks.js`, `api/_lib/issues.js`)

Routes and AI tools both call these single services — no duplicated CRUD logic.

```
api/tasks.js            ─┐  ┌→ createTask(input, user)
api/tasks/[id].js       ─┼──┼→ getTaskById(id)
registry.js handlers    ─┘  ├→ listTasksByProject(projectId)      (empty → all)
                            ├→ findTask({ searchTitle }, projectId)   (ambiguity → candidates)
                            ├→ updateTask(id, input, user)            (completeTask = status "done")
                            ├→ deleteTask(id, user)   (routes only, NOT an AI tool)
                            └→ TaskServiceError

api/issues.js           ─┐  ┌→ createIssue(input, user)
api/issues/[id].js      ─┼──┼→ getIssueById(id)
registry.js handlers    ─┘  ├→ listIssuesByProject(projectId, status)
                            ├→ findIssue({ searchTitle }, projectId)
                            ├→ updateIssue(id, input, user)           (resolveIssue = status "resolved")
                            ├→ deleteIssue(id, user)   (routes only, NOT an AI tool)
                            └→ IssueServiceError
```
- The same patterns as §3.10: `requireAuth` enforced in route handlers; tools receive `req.user`; writes call `logActivity()`.
- Task writes also call `invalidate("kanban", "stats")` (kanban/stats consume tasks); issue writes have no cached consumer, so no invalidation.
- REST endpoints (`api/tasks.js`, `api/tasks/[id].js`, `api/issues.js`, `api/issues/[id].js`) are thin wrappers mapping the service errors to `status`/`message` JSON. GET `/api/tasks` and `/api/issues` return all records when `projectId` is omitted.
- The `issues` collection and service layer were added in Phase 5 (no Issues feature existed before); an Issues UI is not part of the AI Assistant scope.

### 3.12 Shared Design Reference Service Layer (`api/_lib/designreferences.js`)

Routes and AI tools both call this single service — no duplicated CRUD logic.

```
api/designreferences.js       ─┐  ┌→ createDesignReference(input, user)
api/designreferences/[id].js  ─┼──┼→ getDesignReferenceById(id)
registry.js handlers          ─┘  ├→ listDesignReferencesByProject(projectId, type)   (empty → all)
                                   ├→ findDesignReference({ searchTitle }, projectId, type)  (ambiguity → candidates)
                                   ├→ updateDesignReference(id, input, user)
                                   ├→ deleteDesignReference(id, user)   (AI tool: confirmation flow)
                                   └→ DesignReferenceServiceError
```
- Same patterns as §3.10/§3.11: `requireAuth` in route handlers; tools receive `req.user`; writes call `logActivity()`.
- URL validation lives in the service (`normalizeUrl`, `http`/`https` only) — invalid links are rejected with a 400 service error before reaching the database.
- REST endpoints (`api/designreferences.js`, `api/designreferences/[id].js`) are thin wrappers mapping service errors to `status`/`message` JSON.
- The `designreferences` collection and service layer were added in Phase 6 (no Design References feature existed before — the admin Designer page was under construction); a Design References UI is not part of the AI Assistant scope.

### 3.13 Shared Finance/Expense Service Layer (`api/_lib/finance.js`)

The existing Expense logic (previously inline in the REST routes) now lives in a single shared service that both the routes and AI tools call — no duplicated business logic.

```
api/finance.js       ─┐  ┌→ createTransaction(input, user)      (parseTransaction validation)
api/finance/[id].js  ─┼──┼→ getTransactionById(id)
registry.js handlers ─┘  ├→ listTransactions({ type, category, projectId, dateFrom, dateTo })
                          ├→ findExpense({ searchDescription }, projectId, type)  (ambiguity → candidates)
                          ├→ updateTransaction(id, patch, user)
                          ├→ deleteTransaction(id, user)        (AI tool: confirmation flow)
                          ├→ buildFinanceSummary()              (used by finance summary + dashboard stats)
                          ├→ resolveDateRangeToken(word)        (today / this week / this month / last month)
                          └→ FinanceServiceError
```
- Behavior preserved exactly: `TRANSACTION_TYPES`, `PAID_BY_OPTIONS`, `TRANSACTION_CATEGORIES`, amount `>= 0` + 2-decimal rounding, `type` default "income" on invalid, `category` default "Other", `date` default now, cache invalidation `invalidate("finance")`, activity logging `targetType: "finance"`.
- The GET route previously supported only `type`/`category` (plus `summary`); the shared service now also supports `projectId`, `dateFrom`, and `dateTo` filters (used by the AI tools; the UI is unaffected). Date-boundary conversion and natural-language tokens (`today`, `this week`, `this month`, `last month`) use the server's date conventions.
- The dashboard still consumes `buildFinanceSummary` via `api/stats.js` — unchanged.
- Invalid `amount`/`date`/`type`/`projectId` produce 400 `FinanceServiceError`s with user-safe messages; DB errors are never leaked.

### 3.14 Shared Dashboard Stats & Activity Services (`api/_lib/stats.js`, `api/_lib/activity.js`)

Routes and AI tools call these shared services — no duplicated aggregation/query logic.

```
api/stats.js ────────┐  ┌→ buildDashboardStats()   (project/task status counts, budget,
registry.js handler ─┘  │   recent projects, overdue tasks, finance summary)
(getDashboardStats)    └→ cached("stats:all", 60s) — same key the /api/stats route uses

api/activities.js ───┐  ┌→ listActivities({ limit, user, action, targetType })
registry.js handler ─┘  └→ sorted by timestamp desc, capped at 500 (route) / 50 (tool)
(getRecentActivity)
```

- `api/stats.js` is now a thin wrapper: `cached("stats:all", 60_000, buildDashboardStats)`. `buildDashboardStats()` was moved verbatim from the old route body into the shared service, so the dashboard payload shape is unchanged. `getDashboardStats` (Phase 8) calls the exact same cached function, so it always matches what the dashboard shows and stays fresh via the existing write-time invalidation.
- `api/_lib/activity.js` gained `listActivities()` (the same query the route used inline, plus an optional `targetType` filter); `api/activities.js` is now a thin cached wrapper. `getRecentActivity` reuses it directly.

---

## 4. Key Patterns

### PremiumSelect Component
All `<select>` elements replaced with `PremiumSelect` — custom dropdown using `value` + `onChange(val)` pattern (not event-based). Supports `compact` mode for inline/table use.

### input-field CSS Class
Defined in `tailwind.config.js` as theme-aware CSS:
- Default: `border-border` (matches PremiumSelect)
- Hover: `border-primary/40` (blue tint)
- Focus: `border-primary/40` + subtle ring
- No visible outline

### View Mode Persistence
Board page (Board/Table/Timeline) and Projects page (Grid/Table) store view preference in `localStorage`.

### Activity Logging
Every create/update/delete operation calls `logActivity()` → inserts into MongoDB "activities" collection with user info, action type, target, and timestamp.

### Cache Invalidation
`api/_lib/cache.js` provides a simple in-memory cache with `invalidate()` called after writes to keep read endpoints fresh.

### Theme System
`ThemeContext` provides light/dark toggle with `localStorage` persistence. `tailwind.config.js` defines separate `light` and `dark` palettes. `useThemeClasses` hook generates theme-aware CSS class strings.

---

## 5. Database Collections

| Collection | Purpose | Key Fields |
|---|---|---|
| `projects` | Project records | name, client, status, priority, budget, projectCost, advanceAmount, paidStatus, features, notes, tags, color |
| `tasks` | Task records | projectId, title, description, status, priority, assignee, dueDate, startDate, endDate, estimatedHours, notes, order |
| `issues` | Issue records | projectId, title, description, severity (low/medium/high/critical), status (open/in_progress/resolved/closed), priority, assignee, dueDate |
| `designreferences` | Design reference records | projectId, title, url (http/https), type (website/image/file/other), notes |
| `transactions` | Finance records | type (income/expense/payment/advance/balance), amount, category, description, date, projectId, paidBy, paymentStatus |
| `activities` | Activity log | action, targetType, target, details, userId, userName, timestamp |
| `users` | Admin users | _id, name, keyHash, superAdmin, access (pages, dashboardComponents, projectAccess, expenseAccess) |
| `aiconfirmations` | Pending AI destructive-action confirmations (Phase 9) | user, tool, fingerprint (record _id), requestId, targetLabel, createdAt, expiresAt (TTL ~5 min) |
| `aidedupe` | AI duplicate-operation dedupe ledger (Phase 9) | user, tool, argsKey, createdAt (TTL ~120 s) |
