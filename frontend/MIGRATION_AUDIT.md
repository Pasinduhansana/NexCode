# NexCode React → Next.js Migration Audit (Phase 1)

## 1. Existing React entry point

| Item | Location |
|------|----------|
| HTML shell | `index.html` (loader, gtag, `#root`) |
| JS entry | `src/main.jsx` → `App.jsx` |
| Router | `react-router-dom` v6 in `src/App.jsx` |

## 2. Routing system

**Public:** `/`, `/services`, `/showcase`, `/showcase/:slug`, `/about`, `/contact`, `/start-project`, `/privacy-policy`, `/terms-of-service`

**Admin:** `/admin/login`, `/admin` (layout + index dashboard), `/admin/projects`, `/admin/projects/:id`, `/admin/board`, `/admin/designer`, `/admin/finance`, `/admin/activity`, `/admin/access`, `/admin/assistant`, `/admin/reporting`

**Fallback:** `*` → redirect `/`

## 3. API calls (frontend)

| Client | Base URL | Usage |
|--------|----------|--------|
| `src/utils/api.js` | `/api` | Public axios (minimal) |
| `src/Admin/utils/adminApi.js` | `/api` + JWT interceptors | All admin CRUD, auth |
| `src/Admin/utils/assistantApi.js` | `POST /assistant` | AI chat |
| `src/Admin/utils/aiConversationsApi.js` | `/ai/conversations*` | Persistent AI threads |
| `src/Admin/utils/designerApi.js` | design* endpoints | Designer CRUD |
| `src/Admin/utils/reportingApi.js` | `/reports*` | Reporting + PDF |
| `@formspree/react` | Formspree hosted | Contact + project request forms |

## 4. Backend architecture

Vercel Serverless Functions: one `api/**/*.js` file per route (~35 functions today — **exceeds Hobby 12**).

Shared logic lives in `api/_lib/` (copied to `lib/` for Next.js). Handlers use `(req, res)` + `requireAuth` middleware pattern.

## 5. Environment variables

See `.env.example`. Server-only: `MONGODB_URI`, `MONGODB_DB_NAME`, `JWT_SECRET`, `GEMINI_API_KEY`, `ADMIN_USER_*`, rate limits. No `NEXT_PUBLIC_*` secrets; API is same-origin `/api`.

## 6–7. Client-only code

- `localStorage`: theme (`nexcode_theme`), admin JWT/user, sidebar collapse
- `window.location` redirect on 401 in adminApi
- GSAP, framer-motion, react-hot-toast, PWA service worker (Vite)
- Formspree in browser only

## 8. Server-side

MongoDB singleton (`lib/mongodb.js`), JWT auth, Gemini AI, PDF generation, activity logging.

## 9–11. Auth & DB

JWT Bearer in `Authorization` header; login via access key → SHA-256 hash in MongoDB `users`. Session persistence via localStorage on client. Protected admin layout redirects to `/admin/login`.

## 12. Integrations

Formspree, Google Gemini (`@google/genai`), Google Analytics (`@vercel/analytics`), WhatsApp float link, gtag.

## 13. Dependencies

React 18, Vite 5, Tailwind 3, axios, recharts, lucide-react, react-icons, mongodb, jsonwebtoken, etc. (see `package.json`).

## 14–15. Server vs Client components

Nearly all UI is client-only (hooks, animations, charts, modals). Server Components used only for root `layout` shell where possible.

## 16. API consolidation target

**Current:** ~35 Vercel functions → **Target:** 1 catch-all `app/api/[[...path]]/route.js` + shared `lib/` (≤12 functions total including any ISR pages).

## 17. Compatibility

Preserve exact URL paths and JSON contracts; frontend admin API paths unchanged unless router internal only.
