# NexCode — Performance & Security Enhancement Backlog

This document is a prioritized, **task-by-task** list of improvements for the NexCode
`frontend/` app (public marketing site + admin panel + `/api/*` serverless layer on Vercel).

It was produced from a code review of the normal visitor flow, the admin flow, and the
database access patterns. Each item is self-contained so it can be picked up and shipped
individually — later tasks can build on earlier ones, but none are blocking.

**How to use:** pick the next unchecked item, implement it, run the listed verification,
then check it off. Items are ordered by impact vs. effort (P0 = do first).

Legend: 🔒 security · ⚡ performance · 🗄️ database · 🎨 frontend/rendering · 🧩 architecture
Effort: S (≤1h) · M (½ day) · L (1+ day).

---

## 🔒 Security

- [ ] **S1 · Rate-limit `/api/auth/login` and password-change endpoints** (P0, M)
  - **Issue:** `frontend/api/auth/login.js` has no rate limiting and `getUserByCredentials`
    (`frontend/api/_lib/users.js`) scans the whole `users` collection on every attempt.
    This enables brute-force / credential-stuffing of the admin access key.
  - **Files:** `frontend/api/auth/login.js`, `frontend/api/users/[id]/password.js`, `frontend/api/_lib/ratelimit.js`
  - **Fix:** Add a fixed-window limiter (reuse `checkWindow` from `ratelimit.js`) keyed by
    IP + accessKey, e.g. 5 attempts / 5 min, with a short lockout. Return `429` after the
    limit. The existing limiter fails **open**, so gate only auth behind it (keeping the
    AI limiter open is fine). Consider a constant-time compare (`crypto.timingSafeEqual`)
    instead of `compareKey`'s early-return loop.
  - **Verify:** hammer login >5× from one IP → 429; valid login still works; unit test in
    `frontend/tests`.

- [ ] **S2 · Validate `JWT_SECRET` at startup** (P0, S)
  - **Issue:** `signToken`/`verifyToken` (`frontend/api/_lib/auth.js`) will throw at runtime
    if `JWT_SECRET` is unset/missing. No fail-fast guard.
  - **Files:** `frontend/api/_lib/auth.js`, `frontend/lib/api/resolve-handler.js` (or a shared bootstrap)
  - **Fix:** On module load, if `!process.env.JWT_SECRET` throw a clear error. Recommend
    `JWT_SECRET` length ≥ 32 bytes; optionally warn if too short.
  - **Verify:** unset `JWT_SECRET` and load the API → immediate, clear error (not a 500 mid-request).

- [ ] **S3 · Add HTTP security headers** (P0, S)
  - **Issue:** `frontend/next.config.mjs` defines no `headers()`. Missing HSTS,
    `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`,
    and a baseline `Content-Security-Policy`.
  - **Files:** `frontend/next.config.mjs`
  - **Fix:** Add an async `headers()` returning a `Content-Security-Policy` (allow
    `self`, the Google Tag Manager + gtag domains, and `data:`/inline for the existing
    inline gtag script), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
    `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
  - **Verify:** `curl -I` the site; confirm headers present in dev + prod.

- [ ] **S4 · Cap request body size in the node adapter** (P0, S)
  - **Issue:** `runNodeHandler` (`frontend/lib/api/node-adapter.js`) calls
    `request.json()` with no size limit. A large payload (e.g. report generation, long
    descriptions) can be used for memory-exhaustion DoS.
  - **Files:** `frontend/lib/api/node-adapter.js`
  - **Fix:** Read the stream manually with a max byte cap (e.g. 1–4 MB) and reject
    `413 Payload Too Large` beyond it. Keep the JSON-only branch.
  - **Verify:** POST a multi-MB body → `413`; normal payloads still parse.

- [ ] **S5 · Move admin session token out of `localStorage` (XSS risk)** (P1, M)
  - **Issue:** The admin token is stored in `localStorage` (`frontend/src/Admin/utils/auth.js`).
    Any XSS in the admin SPA (rendered user content, third-party scripts) can exfiltrate it.
  - **Files:** `frontend/src/Admin/utils/auth.js`, `frontend/src/Admin/context/AdminAuthContext.jsx`, `frontend/api/auth/login.js`
  - **Fix (preferred):** Set the token in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie
    from `/auth/login`; read it server-side in `getToken`/the route adapter. If staying
    client-side, at minimum sanitize all rendered user HTML and keep the token in memory +
    refresh via `/auth/verify` rather than persisting it.
  - **Verify:** token not present in `localStorage`; cookie flagged HttpOnly/Secure; admin
    login + protected calls still work.

- [ ] **S6 · Sanitize user-controlled HTML in PDF / report rendering** (P1, M)
  - **Issue:** Report/PDF builders (`frontend/api/_lib/pdf/*`, `frontend/api/_lib/reports.js`)
    embed project/task/transaction text. If any field is rendered as HTML in the PDF
    engine, unsanitized input is an injection vector (and in-app preview XSS).
  - **Files:** `frontend/api/_lib/pdf/buildReportPdf.js`, `components.js`, `frontend/api/_lib/reports.js`
  - **Fix:** Run all dynamic text through an escaper (the `escapeHtml` helper pattern already
    used in `reminders.js` is the reference) or a vetted sanitizer before it reaches the
    PDF renderer; never `dangerouslySetInnerHTML` with raw user data in the preview UI.
  - **Verify:** a report containing `<script>`/`<img onerror>` renders as literal text;
    PDF still builds.

- [ ] **S7 · Explicit CORS allowlist (if cross-origin API is ever needed)** (P2, S)
  - **Issue:** No CORS headers are set, so today it is effectively same-origin only. If the
    admin is ever served from a different origin, it will silently break, prompting an
    ad-hoc permissive `*` later.
  - **Files:** `frontend/next.config.mjs` (or the route adapter)
  - **Fix:** Define an explicit `Access-Control-Allow-Origin` allowlist (env-driven) rather
    than `*`. Not urgent while admin + API share an origin.
  - **Verify:** only allowlisted origins get CORS headers.

---

## ⚡🗄️ Database & API Performance

- [x] **P1 · Cache dashboard stats** (P0, S) — DONE: `buildDashboardStats` self-cached 30s; invalidated on project/task/transaction writes via `invalidate("dashboard:")`.
  - **Issue:** `buildDashboardStats` (`frontend/api/_lib/stats.js`) runs ~7 aggregations +
    `buildFinanceSummary()` on **every** dashboard load, with no cache. Repeated navigation
    re-runs all of them.
  - **Files:** `frontend/api/_lib/stats.js`, `frontend/api/_lib/cache.js`
  - **Fix:** Wrap the result in `cached("dashboard:stats", 30_000, buildDashboardStats)`.
    Invalidate on project/task/transaction writes (call `invalidate("dashboard:")`).
  - **Verify:** two rapid loads → second is cache-served (no new DB aggregation); data still
    fresh within 30s.

- [x] **P2 · Cache derived calendar events** (P0, M) — DONE: `getDerivedEvents` source scans cached per date-window for 60s (`derived:<dayBucket>`); manual events stay live.
  - **Issue:** `listEvents` (`frontend/api/_lib/calendar.js`) calls `getDerivedEvents`, which
    fires 3 separate collection queries (`projects`, `tasks`, `transactions`) plus a
    `getProjectNames` lookup on **every** calendar load/filter change. Browser auto-refresh
    and navigation multiply this.
  - **Files:** `frontend/api/_lib/calendar.js`, `frontend/api/_lib/cache.js`
  - **Fix:** Cache `getDerivedEvents` result for ~30–60s keyed by the date window
    (`cached("derived:"+windowKey, 60_000, …)`). Keep the per-user manual event query
    live (small, user-scoped, already indexed).
  - **Verify:** repeated calendar loads reduce DB ops; switching filters still reflects
    newly created manual events immediately.

- [x] **P3 · Index `getUserByCredentials` / avoid full-collection scan on login** (P1, S) — DONE: login now does `findOne({ keyHash })`; unique index on `users.keyHash` added.
  - **Issue:** `getUserByCredentials` (`frontend/api/_lib/users.js`) does `find({}).toArray()`
    and loops comparing hashes. O(n) documents fetched per login.
  - **Files:** `frontend/api/_lib/users.js`
  - **Fix:** Add a `loginId` (or reuse `_id`) field and query `findOne({ _id: loginId })`;
    create a unique index. If access key is the only identifier, keep hashing but query by a
    derived id rather than scanning all users.
  - **Verify:** login still authenticates; DB profiler shows a single indexed `findOne`.

- [x] **P4 · Stop running `ensureDefaultUsers` on every login** (P1, S) — DONE: `globalThis.__defaultUsersEnsured` short-circuits the `countDocuments` after first run/seed.
  - **Issue:** `frontend/api/auth/login.js` calls `await ensureDefaultUsers().catch(()=>{})`
    on every request → a `countDocuments()` round-trip each login.
  - **Files:** `frontend/api/auth/login.js`, `frontend/api/_lib/users.js`
  - **Fix:** Make `ensureDefaultUsers` idempotent + cache the "already seeded" result in
    `globalThis` (like `mongodb.js` does), or only seed once at deploy/build time.
  - **Verify:** login no longer issues a `countDocuments` after first seed.

- [x] **P5 · Add compound indexes for derived-event source queries** (P1, S) — DONE: added `tasks(dueDate,status)`, `transactions(date,category)`, `transactions(date,showOnCalendar)`.
  - **Issue:** Task derived query filters `{dueDate:{…}, status:{$ne:"done"}}` — only separate
    `{dueDate:1}` and `{status:1}` indexes exist. Transactions derived query filters by
    `date` + (`showOnCalendar` | `category`) — only single-field indexes exist.
  - **Files:** `frontend/api/_lib/mongodb.js` (`ensureIndexes`)
  - **Fix:** Add `tasks.createIndex({dueDate:1, status:1})` and
    `transactions.createIndex({date:1, category:1})` (and/or `{date:1, showOnCalendar:1}`).
  - **Verify:** `explain()` on the derived queries shows `IXSCAN` not `COLLSCAN`.

- [x] **P6 · Make the in-memory cache cross-instance & bounded** (P2, M) — DONE (short-term): `cache.js` now LRU-evicts at `MAX_ENTRIES` (200) + a 30s sweep of expired entries; timer `unref()`'d so it never keeps serverless instances alive. (Long-term Redis/KV sharing still outstanding, noted in file.)
  - **Issue:** `cache.js` uses a module-level `Map` shared only within one serverless
    instance; other Vercel instances never see it, so hit rate is low. It also never evicts
    by size (only TTL on read), so it can grow.
  - **Files:** `frontend/api/_lib/cache.js`
  - **Fix (short term):** add a max-size cap with LRU eviction + a background sweep.
    (Long term): back it with Upstash Redis / Vercel KV so all instances share one cache.
  - **Verify:** cache size stays bounded under load; cross-instance hits work with Redis.

- [x] **P7 · Avoid re-verifying the admin token on every navigation** (P2, S) — DONE: `AdminAuthContext` decodes the JWT client-side for instant routing; `/auth/verify` runs in the background (5-min interval + on window focus) to catch revocation/expiry.
  - **Issue:** `AdminAuthContext` (`frontend/src/Admin/context/AdminAuthContext.jsx`) calls
    `/api/auth/verify` (a DB-backed verify) whenever the token is set, i.e. on every mount.
    The JWT already encodes user/access, so this is redundant per navigation.
  - **Files:** `frontend/src/Admin/context/AdminAuthContext.jsx`
  - **Fix:** Decode the JWT client-side for routing/access decisions and only call
    `/auth/verify` on a timer / on focus, or cache the verify result briefly. Prefer
    `hasPageAccess` from the decoded token until verified expires.
  - **Verify:** navigating admin pages no longer fires repeated `/auth/verify`; refresh on
    expiry still works.

---

## 🎨 Frontend / Rendering Performance

- [ ] **F1 · Lazy-load route components (code-splitting)** (P0, M)
  - **Issue:** `frontend/src/App.jsx` statically imports **every** public page *and* every
    admin page at startup, so the initial bundle includes Framer Motion, all admin pages,
    and all site pages even for a first-time visitor hitting `/`.
  - **Files:** `frontend/src/App.jsx`
  - **Fix:** Wrap route elements in `React.lazy(() => import(...))` + `<Suspense>` with the
    existing `PageSkeleton`. Split admin pages and heavy pages (designer, board, reporting)
    into their own chunks.
  - **Verify:** initial JS transfer drops; admin chunks load only on `/admin/*`; no layout
    shift (skeleton shown).

- [ ] **F2 · Enable image optimization / use a CDN** (P1, M)
  - **Issue:** `next.config.mjs` sets `images.unoptimized: true`, disabling Next's resizing
    + AVIF/WebP. The public site (`frontend/src/components/Navbar.jsx`, showcase, hero)
    serves raw images; large assets hurt LCP on mobile.
  - **Files:** `frontend/next.config.mjs`, image usages in `frontend/src/components/*`, `frontend/src/sitePages/*`
  - **Fix:** Use `next/image` where the Next renderer is used, or route static assets
    through an optimizer/CDN. Keep `loading="lazy"` + explicit width/height (already partly
    done in Navbar) to avoid CLS.
  - **Verify:** Lighthouse LCP/CLS improves; images served in modern formats with correct
    dimensions.

- [ ] **F3 · Audit scroll/entrance animations for jank** (P2, S)
  - **Issue:** `Navbar`, hero, and reveal hooks use Framer Motion / GSAP. Heavy layout
    properties (e.g. animating width/height/box-shadow) cause jank on low-end mobile.
  - **Files:** `frontend/src/components/Navbar.jsx`, `frontend/src/utils/useGsapReveal.js`, hero/section components
  - **Fix:** Prefer `transform`/`opacity`-only animations, respect `prefers-reduced-motion`,
    and throttle the global `scroll` listener (Navbar already adds one per mount — debounce/
    `passive` it).
  - **Verify:** smooth 60fps scroll on mobile; reduced-motion users see no animation.

- [ ] **F4 · Debounce/throttle admin list filters** (P2, S)
  - **Issue:** Calendar/report/kanban filters call the API on each keystroke/change, and the
    calendar list is expensive (see P2). No client debounce observed on search inputs.
  - **Files:** `frontend/src/Admin/pages/*` (calendar, reporting, projects)
  - **Fix:** Debounce search inputs (~250–300ms) and memoize list fetches; reuse the cached
    derived data from P2.
  - **Verify:** typing in a filter issues fewer requests; UX unchanged.

---

## 🧩 Architecture / Maintainability

- [x] **A1 · Resolve the dual build (Vite SPA + Next.js App Router)** — DONE: all dead
  duplicate Next.js pages removed from `frontend/app/*`; only `app/api/[[...path]]/route.js`
  (the API catch-all) remains. Topology documented in `frontend/MIGRATION_AUDIT.md` §0.
- [x] **A2 · Centralize per-request auth + logging at the route boundary** — DONE: shared
  guards (X-Request-Id, CORS, 4 MB body-size cap, error envelope) applied for every `/api/*`
  request inside `runNodeHandler` (`frontend/lib/api/node-adapter.js`); route-level
  `requireAuth` untouched.

---

## ✅ Already Good (keep as-is / don't regress)
- MongoDB connection pooling with idle-reconnect + bounded timeouts (`frontend/api/_lib/mongodb.js`).
- A broad, thoughtful `ensureIndexes` set with compound per-user indexes.
- Email HTML is properly escaped (`escapeHtml` in `reminders.js`).
- Access keys are hashed with SHA-256 (`users.js`); no plaintext keys stored.
- Rate limiter exists for AI endpoints and fails open (won't break the assistant).
- Manual event queries are user-scoped + indexed (`userId, startAt`).
- `force-dynamic` API route avoids accidental static caching of mutable data.

## Suggested execution order
1. S1, S2, S3, S4 (quick, high-value security hardening)
2. P1, P2 (biggest DB/API perf wins for normal + admin flow)
3. F1 (largest frontend rendering win)
4. P3, P4, P5, S5, S6, F2 (medium follow-ups)
5. P6, P7, F3, F4, A1, A2 (polish + architecture)
