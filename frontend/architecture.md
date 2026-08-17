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
    │   │   ├── gemini.js             # Google Gemini service (AI Assistant)
    │   │   ├── mongodb.js            # MongoDB connection singleton
    │   │   └── users.js              # User CRUD, access control, password hashing
    │   ├── auth/
    │   │   ├── login.js              # POST — authenticate by access key
    │   │   └── verify.js             # GET — validate JWT, return user + access
    │   ├── finance.js                # GET/POST transactions
    │   ├── finance/[id].js           # PUT/DELETE transaction
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
api/_lib/gemini.js  generateReply({ messages })
        │
        ├─ Requires GEMINI_API_KEY (env) — never shipped to the browser
        ├─ Maps roles: user→"user", assistant→"model"
        ├─ Calls Google Gemini via @google/genai SDK
        │   └─ Model chain (GEMINI_MODEL first, then gemini-3.6-flash → 3.7-flash
        │      → 3.5-flash-lite → flash-latest) — retries/falls back on 429/503/404
        │
        ├─ On success → 200 { reply }  → rendered as an AI message bubble
        │
        └─ On failure → classified GeminiServiceError:
            ├─ Missing API key  → 503 "AI assistant is not configured"
            ├─ Rate limit/quota → 429 "AI service temporarily overloaded"
            ├─ Network error    → 502 "Could not reach the AI service"
            └─ Gemini error     → 502 "AI service returned an error"
        └─ Frontend renders the error message in an error-styled bubble
```

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
| `transactions` | Finance records | type (income/expense/payment/advance/balance), amount, category, description, date, projectId, paidBy, paymentStatus |
| `activities` | Activity log | action, targetType, target, details, userId, userName, timestamp |
| `users` | Admin users | _id, name, keyHash, superAdmin, access (pages, dashboardComponents, projectAccess, expenseAccess) |
