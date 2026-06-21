# Expense Tracker — Build Plan

## Goal
A small React app that lets Cata and Carli log expenses into the shared Google Sheet, view the last 20 expenses, and edit or delete them — with category and payment method dropdowns pulled live from the sheet. Everything is locked behind Google login — only the two of you can read or write data. Total cost: $0.

---

## Architecture

```
React App (PWA — static, hosted on Vercel, installable on phone/desktop)
   │
   │  1. Sign in with Google → get ID token
   │  2. fetch(GET)  -> categories + payment methods
   │  3. fetch(GET)  -> last 20 expenses
   │  4. fetch(POST) -> create / update / delete an expense
   ▼
Google Apps Script Web App (bound to the Sheet)
   │  - Verifies every request's ID token with Google
   │  - Checks email against allow-list (you two only)
   ▼
Google Sheet
   - "Expenses" tab  (the data, each row has a hidden unique ID)
   - "Lists" tab     (dropdown source: Category, Payment Method)
```

No traditional backend server, no database, no hosting bill.

---

## 1. Google Sheet

### "Expenses" tab (existing)
| ID | Date | Amount | Category | Description | Who Paid | Payment Method | Notes |
|---|---|---|---|---|---|---|---|

- The **ID** column is new — a **UUIDv7** generated when the row is created. UUIDv7 is time-ordered (unlike random UUIDv4), so IDs naturally sort in creation order, which is a nice property for an expense log. It's what lets the app reliably target a specific row for editing or deleting, since row *position* can shift if anyone sorts or filters the sheet manually. You can hide this column in Sheets if you don't want to see it day-to-day.

### "Lists" tab (new — add this)
| Category | Payment Method |
|---|---|
| Groceries | Credit Card |
| Rent | Debit Card |
| Utilities | Cash |
| ... | Transfer |

- Edit this tab anytime to add/remove dropdown options — no code changes needed.
- "Who Paid" is **not** read from here — it's hardcoded in the React app as a fixed two-option list: **Cata** and **Carli**.

---

## 2. Google Apps Script (the "backend")

Bound to the spreadsheet (Extensions → Apps Script). Two entry points, routed by an `action` parameter:

### `doGet(e)` — reads
- Verifies the caller's Google ID token (see Security Model below).
- `?action=lists` → reads the "Lists" tab, returns:
  ```json
  { "categories": ["Groceries", "Rent", ...], "paymentMethods": ["Credit Card", "Cash", ...] }
  ```
- `?action=recent` → reads the "Expenses" tab, returns the **last 20 rows** (most recent first), including each row's hidden ID:
  ```json
  { "expenses": [ { "id": "...", "date": "...", "amount": 42.5, "category": "...", "description": "...", "whoPaid": "...", "paymentMethod": "...", "notes": "..." }, ... ] }
  ```
- If invalid/not allow-listed → returns 403/forbidden response.

### `doPost(e)` — writes
- Verifies the caller's Google ID token.
- Posted JSON includes an `action` field:
  - `action: "create"` → appends a new row (generates a new **UUIDv7** as the ID).
  - `action: "update"` → finds the row matching the posted `id` and overwrites its fields.
  - `action: "delete"` → finds the row matching the posted `id` and removes it.
- Returns a success/failure JSON response.
- *Note:* Apps Script's built-in `Utilities.getUuid()` only generates UUIDv4, not v7, so the backend code will include a small custom UUIDv7 helper function (a few lines — timestamp bits + random bits per the spec).

### Deployment settings
- Execute as: **Me**
- Who has access: **Anyone**
  - This sounds permissive, but it's fine — the *script itself* rejects any request that doesn't carry a valid, allow-listed Google ID token. The access control lives in the code, not in the deployment dropdown. (Relying on "Anyone with Google account" at the deployment level doesn't work reliably for cross-origin `fetch()` calls from a separately-hosted app, which is why we verify the token manually instead.)

---

## 3. React App (frontend)

### Sign-in
- Uses **Google Identity Services** ("Sign in with Google" button).
- On success, Google returns a signed JWT ID token — stored in app state (memory only, not localStorage).

### Loading dropdown data
- On login, `fetch(GET ?action=lists)` the Apps Script URL with the ID token attached, populate Category and Payment Method `<select>` options from the response.

### The expense form (add / edit)
| Field | Input type | Source |
|---|---|---|
| Date | date picker | — |
| Amount | number input | — |
| Category | select | fetched from Sheet |
| Description | text input | — |
| Who Paid | select | hardcoded in code — **Cata** / **Carli** |
| Payment Method | select | fetched from Sheet |
| Notes | text input | — |

- Same form is reused for both adding a new expense and editing an existing one — when editing, it's pre-filled with the selected row's data and submits with `action: "update"` plus the row's `id` instead of `action: "create"`.

### Recent expenses list
- On login (and after every create/update/delete), `fetch(GET ?action=recent)` to pull the last 20 rows.
- Displayed as a list/table — Date, Amount, Category, Who Paid at a glance, with each row expandable or showing an **Edit** and **Delete** button.
- **Edit** opens the form above pre-filled with that row's data.
- **Delete** asks for a quick confirmation, then `fetch(POST action: "delete")` with that row's `id`, and removes it from the list on success.

### Submitting
- `fetch(POST)` to the Apps Script URL with the ID token + form data (including `action`) as JSON.
- Show a success confirmation or error message; refresh the recent-expenses list after create/update/delete.

### Tech stack
- **Vite** — build tool / dev server.
- **TanStack Router** — file-based routing.
- **TanStack Query** — data fetching/caching for all calls to the Apps Script backend (lists, recent expenses) and mutations (create/update/delete), including automatic refetch of the recent list after a mutation succeeds.
- **shadcn/ui** — component library (button, input, select, dialog, etc.), built on Tailwind CSS.

### Folder structure

```
expense-tracker/
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── favicon.ico
├── src/
│   ├── routes/                      # TanStack Router file-based routes
│   │   ├── __root.tsx               # root layout — auth gate, shell
│   │   └── index.tsx                 # main page: form + recent list
│   ├── components/
│   │   ├── ui/                       # shadcn-generated components (button, input, select, dialog...)
│   │   ├── google-sign-in-button.tsx
│   │   ├── expense-form.tsx          # shared add/edit form
│   │   ├── expense-list.tsx          # recent 20 expenses
│   │   ├── expense-row.tsx           # single row + edit/delete actions
│   │   └── delete-confirm-dialog.tsx
│   ├── queries/                      # TanStack Query hooks
│   │   ├── use-lists.ts              # categories + payment methods
│   │   ├── use-recent-expenses.ts
│   │   └── use-expense-mutations.ts  # create / update / delete
│   ├── lib/
│   │   ├── api.ts                    # fetch wrappers for the Apps Script endpoints
│   │   ├── auth.ts                   # Google Identity Services setup, token state
│   │   └── utils.ts                  # shadcn's cn() helper, misc utilities
│   ├── types/
│   │   └── expense.ts                # shared TS types (Expense, ListsResponse, etc.)
│   ├── App.tsx                        # QueryClientProvider + RouterProvider setup
│   ├── main.tsx                        # entry point
│   └── index.css                       # Tailwind base + shadcn theme variables
├── components.json                     # shadcn/ui config
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts                      # includes vite-plugin-pwa config
└── .env.local                          # VITE_GOOGLE_CLIENT_ID, VITE_APPS_SCRIPT_URL
```

- `routeTree.gen.ts` isn't listed — TanStack Router auto-generates it from the `routes/` folder, so it's never hand-edited.
- Given the app is really just one screen (sign in → form + list), `routes/` stays minimal for now; it's there mainly so adding a second screen later (e.g., a full expense history page) is just a new file.
- `.env.local` holds the two values that differ between local dev and production (Apps Script URL, OAuth Client ID) — never committed to the repo.

---

## 4. PWA (Progressive Web App) Layer

Makes the app installable on your phone's home screen and desktop, so it opens like a native app instead of a browser tab.

- **Web App Manifest** (`manifest.json`) — defines app name, icons, theme color, and `display: "standalone"` (so it opens without browser chrome).
- **Service Worker** — caches the app shell (HTML/CSS/JS) so it loads instantly on repeat opens. If you're using Vite for the React build (recommended), the `vite-plugin-pwa` plugin generates the manifest and service worker for you with sensible defaults — no need to hand-write either.
- **Icons** — need a simple app icon in a couple of sizes (192×192 and 512×512 at minimum). Can be as simple as a generated icon from a logo/emoji.
- **Install prompt** — once deployed over HTTPS (which Vercel/Netlify/GitHub Pages give you automatically) with a valid manifest, Chrome/Edge/Android will offer "Add to Home Screen" automatically; iOS Safari supports it via the Share → "Add to Home Screen" menu.

**Offline behavior (scope note):** the PWA setup above makes the *app shell* load instantly and work offline, but actually reading categories or submitting an expense still needs network, since both talk to the Apps Script backend. True offline expense entry (queue locally, sync when back online) is possible but adds real complexity — listed as an optional v2 enhancement below, not part of the initial build.

---

## Security Model

- **Every** request (read dropdowns, write expense) must include a valid Google ID token.
- The Apps Script verifies the token by calling Google's `tokeninfo` endpoint, checking:
  - Signature/expiry are valid (Google does this check for us)
  - `aud` (audience) matches our OAuth Client ID — proves the token was issued for *this* app, not some other Google sign-in
  - `email` is in our hardcoded allow-list (your two emails)
- No secrets or API keys live in the frontend code — there's nothing sensitive to leak by inspecting the JS bundle.
- The spreadsheet itself doesn't need to be shared publicly; the script runs under the owner's permissions regardless of who's calling it (after passing the checks above).

---

## One-Time Setup Steps

1. **Google Cloud project** — create a free project in Google Cloud Console.
2. **OAuth consent screen** — set to "Testing" mode, add your two emails as test users. (Skips Google's app verification process entirely.)
3. **OAuth Client ID** — create a Web Application client ID. Add authorized JavaScript origins:
   - `http://localhost:5173` (or whatever port, for local dev)
   - your production URL (added later, once you pick a host)
4. **Add the "Lists" tab** to the spreadsheet with initial categories and payment methods, and add an **"ID" column** to the "Expenses" tab (can be the first column, hidden if you like).
5. **Open Apps Script** from the spreadsheet (Extensions → Apps Script), paste in the backend code, hardcode the allow-listed emails and your OAuth Client ID.
6. **Deploy** as Web App (Execute as: Me, Access: Anyone). Copy the deployment URL.
7. **Build the React app locally**, plug in the OAuth Client ID and the Apps Script URL, test against `localhost`.
8. **Add PWA config** — set up `vite-plugin-pwa` (or hand-write manifest.json + service worker), add app icons, set name/theme color.
9. **Deploy the React app to Vercel** (connect the repo or use the Vercel CLI).
10. **Add the Vercel production URL** to the OAuth Client's authorized origins (step 3).
11. **Test installability** — open the deployed URL on your phone, confirm the "Add to Home Screen" prompt appears and the installed app launches standalone.

---

## Open Items
- Out of scope for v1: offline expense entry with local queue + background sync (true offline submission support — possible later via IndexedDB).

*Note: initial values for the "Lists" tab don't need to be locked down now — that tab is just spreadsheet data, not code. You can leave it empty, fill it in with real categories later, or change it anytime after launch, and the app will always reflect whatever's currently in the sheet. Nothing about the build depends on knowing those values in advance.*
