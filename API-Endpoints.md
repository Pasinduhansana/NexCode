# API Endpoints Catalogue

> **Source of truth** – This file is generated from the `handlers` map in `frontend/lib/api/resolve-handler.js`.  
> Whenever a new handler is added (or an existing one removed), regenerate this markdown accordingly.

---
## Table of Endpoints

| # | Endpoint (path segments) | Typical HTTP method(s) | Brief description |
|---|---------------------------|------------------------|-------------------|
| 1 | `auth/login` | `POST` | Authenticate a user with email/password and receive a JWT. |
| 2 | `auth/verify` | `GET` / `POST` | Verify a JWT or session token; returns user info if valid. |
| 3 | `ai/conversations` | `GET` / `POST` | List AI conversation threads for the authenticated user, or create a new conversation. |
| 4 | `ai/conversations/:id` | `GET` / `PUT` / `DELETE` | Retrieve, update, or delete a specific conversation identified by `:id`. |
| 5 | `ai/conversations/:id/clear` | `POST` | Clear the message history of the given conversation. |
| 6 | `ai/conversations/:id/messages` | `GET` / `POST` | List messages of a conversation or add a new message. |
| 7 | `reports` | `GET` / `POST` | List all reports (or create a new report). |
| 8 | `reports/ai` | `GET` / `POST` | AI‑generated report endpoints – fetch or trigger an AI‑generated report. |
| 9 | `reports/:id` | `GET` / `PUT` / `DELETE` | Fetch, update, or delete a report by its `:id`. |
|10| `reports/:id/file` | `GET` / `POST` | Download the PDF file attached to a report or upload a new file. |
|11| `reports/:id/generate` | `POST` | Trigger a (re‑)generation of the report PDF. |
|12| `users` | `GET` / `POST` | List users (admin only) or create a new user account. |
|13| `users/:id` | `GET` / `PUT` / `DELETE` | Retrieve, update, or delete a user by `:id`. |
|14| `users/:id/password` | `PATCH` | Change the password for a user (admin reset or user‑initiated). |
|15| `activities` | `GET` | Read‑only activity log entries (audit trail). |
|16| `assistant` | `GET` / `POST` | Interact with the AI assistant (chat, tool calls, etc.). |
|17| `stats` | `GET` | Project‑wide statistics: request counts, latency, DB connect times (when performance logging is enabled). |
|18| `health` | `GET` | Simple health‑check: returns `{ ok: true, timestamp }`. |
|19| `document` | `GET` | Sample document payload: `{ id, title, content, createdAt }`. |
|20| `finance` | `GET` / `POST` | List finance entries or create a new finance record. |
|21| `finance/:id` | `GET` / `PUT` / `DELETE` | Retrieve, update, or delete a finance record by `:id`. |
|22| `issues` | `GET` / `POST` | List issues or create a new issue. |
|23| `issues/:id` | `GET` / `PUT` / `DELETE` | Fetch, update, or delete a specific issue by `:id`. |
|24| `tasks` | `GET` / `POST` | List tasks or create a new task. |
|25| `tasks/:id` | `GET` / `PUT` / `DELETE` | Fetch, update, or delete a task by `:id`. |
|26| `projects` | `GET` / `POST` | List projects or create a new project. |
|27| `projects/:id` | `GET` / `PUT` / `DELETE` | Fetch, update, or delete a project by `:id`. |
|28| `kanban` | `GET` / `POST` | Kanban‑board operations – list cards or create a new card. |
|29| `designsections` | `GET` / `POST` | List design sections or create a new section. |
|30| `designsections/:id` | `GET` / `PUT` / `DELETE` | Fetch, update, or delete a design section by `:id`. |
|31| `designreferences` | `GET` / `POST` | List design references or create a new reference. |
|32| `designreferences/:id` | `GET` / `PUT` / `DELETE` | Fetch, update, or delete a design reference by `:id`. |
|33| `designnotes` | `GET` / `POST` | List design notes or create a new note. |
|34| `designnotes/:id` | `GET` / `PUT` / `DELETE` | Fetch, update, or delete a design note by `:id`. |
|35| `calendar` | `GET` / `POST` | List calendar events or create a new event. |
|36| `calendar/:id` | `GET` / `PUT` / `DELETE` | Fetch, update, or delete a calendar event by `:id`. |
|37| `calendar/reminders` | `GET` / `POST` | List reminders or create a new reminder attached to a calendar event. |
|38| `calendar/reminders/process` | `POST` | Process pending reminders (e.g., send email notifications). |

---
## How to use this catalogue

1. **Open the file in VS Code** – `code API-Endpoints.md`.  
2. **Search** (`Ctrl+F`) for a particular route if you only need a subset.  
3. **Decide necessity** – If an endpoint no longer matches your product requirements, you can safely remove the handler from `frontend/lib/api/resolve-handler.js` *and* delete the corresponding handler file. After a fresh redeploy the Vercel function count stays at **1** (well under the Hobby‑plan limit of 12).  
4. **Add new routes** – Follow the same pattern: add a new key to the `handlers` map, create a handler file that exports a default async function `(req, res) => …`, and update this markdown accordingly.

---
## Quick verification after a redeploy

```powershell
# From the project root (frontend)
vercel functions   # should output “Functions: 1”

# Then hit a few endpoints (replace <url> with your Vercel domain):
GET https://<url>/api/health
GET https://<url>/api/document
GET https://<url>/api/stats
# etc.
```

The responses will match the descriptions above, confirming that the endpoint is active.

---
*End of file.*