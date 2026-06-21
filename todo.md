# Expense Tracker — Execution Plan

## Phase 1 — Project Scaffold
- [x] **1.1** Fix `pnpm-workspace.yaml` — replace `allowBuilds` (invalid) with `onlyBuiltDependencies: [esbuild, lightningcss, unrs-resolver]`
- [x] **1.2** Restructure from TanStack Start → plain Vite + React + TanStack Router
  - Remove deps: `@tanstack/react-start`, `@tanstack/react-router-ssr-query`, `nitro`
  - Add dep: `vite-plugin-pwa`
  - Create `index.html`, `src/main.tsx`
  - Update `vite.config.ts` (swap `tanstackStart()` + `nitro()` for `TanStackRouterVite()` + `VitePWA`)
  - Simplify `src/routes/__root.tsx` to plain `<Outlet />` shell
  - Remove `src/router.tsx` (logic moves to `main.tsx`)
  - Remove `src/integrations/` (SSR provider no longer needed)
  - Regenerate route tree with `pnpm generate-routes`

## Phase 2 — Types & API Layer
- [x] **2.1** Create `src/types/expense.ts` — `Expense`, `ListsResponse`, `RecentExpensesResponse`, `MutationResponse`, `ExpenseFormData`
- [x] **2.2** Create `src/lib/api.ts` — fetch wrappers: `fetchLists`, `fetchRecentExpenses`, `createExpense`, `updateExpense`, `deleteExpense` (all pass ID token via `Authorization: Bearer` header)

## Phase 3 — Auth
- [x] **3.1** Create `src/components/google-sign-in-button.tsx` — loads GIS script, renders Google Sign-In button, calls `onToken(credential)` callback
- [x] **3.2** Remove `src/lib/auth.ts` (conflicting OAuth approach — not needed)

## Phase 4 — Shadcn UI Components
- [x] **4.1** Install `@radix-ui/react-slot` (needed for `Button`)
- [x] **4.2** Create `src/components/ui/button.tsx`
- [x] **4.3** Create `src/components/ui/input.tsx`
- [x] **4.4** Create `src/components/ui/label.tsx`
- [x] **4.5** Create `src/components/ui/select.tsx`
- [x] **4.6** Create `src/components/ui/card.tsx`
- [x] **4.7** Create `src/components/ui/dialog.tsx`

## Phase 5 — Queries
- [x] **5.1** Create `src/queries/use-lists.ts` — `useLists(token)`
- [x] **5.2** Create `src/queries/use-recent-expenses.ts` — `useRecentExpenses(token)` with 30s refetch
- [x] **5.3** Create `src/queries/use-expense-mutations.ts` — `useCreateExpense`, `useUpdateExpense`, `useDeleteExpense` (all invalidate `recent-expenses` on success)

## Phase 6 — App Components
- [x] **6.1** Create `src/components/expense-form.tsx` — shared form for add/edit, fields: date, amount, category (select), description, whoPaid (Cata/Carli), paymentMethod (select), notes
- [x] **6.2** Create `src/components/expense-row.tsx` — single row display + edit/delete buttons
- [x] **6.3** Create `src/components/expense-list.tsx` — renders list of ExpenseRow, empty/loading states
- [x] **6.4** Create `src/components/delete-confirm-dialog.tsx` — confirmation dialog before delete

## Phase 7 — Routes
- [x] **7.1** Rewrite `src/routes/index.tsx` — full page: unauthenticated view (sign-in gate) → authenticated view (form + recent list + edit/delete)

## Phase 8 — Backend
- [x] **8.1** Create `backend/Code.gs` — complete Apps Script: `doGet` (lists, recent), `doPost` (create, update, delete), UUIDv7 generator, token verification against Google's `tokeninfo` endpoint, email allow-list check

## Phase 9 — PWA & Polish
- [x] **9.1** Create `public/icons/` with placeholder icon files (192×192, 512×512)
- [x] **9.2** Update `public/manifest.json` with "Gastos" branding
- [x] **9.3** Add `.env.local.example` with `VITE_GOOGLE_CLIENT_ID` and `VITE_APPS_SCRIPT_URL`

## Verification
- [x] **V.1** `pnpm install` — clean install
- [x] **V.2** `pnpm build` — production build succeeds (PWA service worker generated)
- [x] **V.3** `pnpm dev` — dev server starts on localhost:3001

---

## Remaining (your side)

- [ ] Google Cloud project + OAuth consent screen + OAuth Client ID
- [ ] Add "Lists" tab + "ID" column to the Google Sheet
- [ ] Edit `backend/Code.gs` — set `ALLOWED_EMAILS` and `OAUTH_CLIENT_ID`
- [ ] Set `VITE_APPS_SCRIPT_URL` in `.env` (the Apps Script deployment URL)
- [ ] Deploy Apps Script as Web App (Execute as: Me, Access: Anyone)
- [ ] Build with `pnpm build` and deploy `dist/` to Vercel
- [ ] Add Vercel URL to OAuth Client's authorized JavaScript origins
