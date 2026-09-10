# Dynamic Event Platform — Frontend

React + Vite + TypeScript frontend for the Django backend built earlier.
Talks to the backend's `/api/v2/` namespace exclusively — the legacy `/api/`
routes are unrelated and untouched.

## 1. What was built

- Full design system on Tailwind v4 (CSS-first tokens, no `tailwind.config.js`
  needed) — violet accent, warm off-white / deep charcoal-navy bases, Space
  Grotesk display type + Inter body, light/dark mode with a FOUC-safe init
  script, hand-rolled overlay/sheet animations (no `tailwindcss-animate`
  dependency, which isn't yet stable for Tailwind v4).
- A small shadcn-style primitive layer (`components/ui`) built directly on
  Radix — Button, Card, Input, Select, Dialog (auto becomes a bottom sheet on
  mobile), Tabs, DropdownMenu, Avatar, Popover, Checkbox, RadioGroup, Switch,
  Skeleton, Badge, Toaster (sonner), EmptyState/ErrorState, Pagination.
- Axios client with an access/refresh JWT interceptor (queues parallel
  requests during a token refresh, forces logout on refresh failure) and a
  `useAuth()` context.
- One `lib/queries.ts` with every TanStack Query hook the app uses, grouped
  by domain (events, forms, coordinators, registrations, notifications,
  dashboard, users) — mutations invalidate the right query keys, a couple
  (notification read state) do optimistic updates.
- **The dynamic form renderer** (`features/forms/DynamicFormRenderer.tsx`) —
  one component, all 19 field types, conditional show/hide driven by live
  RHF-watched values (Framer Motion height/fade transitions, not a layout
  jump), client-side validation mirroring each field's own constraints
  (required/min-max length/min-max value/regex/email/phone/URL format), and
  server-side 400 field errors mapped back onto the exact field by label.
  This exact component is reused for the public registration flow *and* the
  admin builder's preview — never a second hand-maintained copy.
- **The admin form builder** (`pages/admin/AdminFormBuilderPage.tsx` +
  `features/formbuilder/`) — dnd-kit drag-to-reorder field list, a field
  editor (label/type/placeholder/description/required/default/min-max/
  options/conditional-logic-picker), duplicate/delete, live preview through
  the renderer above, Save (full-replace PUT, matching the backend's
  builder contract) and a status menu (draft/active/inactive/closed).
- Every other screen from the brief: landing, events browse (debounced
  search + filter chips), event details with the flow timeline, student
  dashboard / my-registrations, coordinator dashboard scoped to assigned
  events, and the full admin section (events CRUD + flow builder, forms
  list, registrations table with CSV/Excel/PDF export, users, coordinators,
  analytics charts via Recharts, exports page, dashboard).
- Mobile: bottom sheet dialogs, a bottom tab bar + slide-out drawer for the
  admin/coordinator shell (not just a squeezed sidebar), tables collapse to
  stacked cards, 44px+ touch targets throughout.

## 1a. Update — collapse-first registration + multiple activities per event

Originally each event showed its registration form expanded inline. Changed
to match how real events actually run (an event can have more than one
activity — e.g. "Drawing" and "Quiz" — each with its own form):

- The backend's event-detail response now returns `active_forms: [{id,
  title, description}]` — every currently-active form for that event.
- The event details page renders one **`ActivityRegistrationCard`** per
  entry: collapsed by default (just the activity's name + description), a
  "Register" button expands it, and *only then* does it fetch the full field
  schema (`GET /forms/<id>/`) and mount the `DynamicFormRenderer`. Nothing is
  fetched or rendered for a form the person hasn't opened.
- If the signed-in user already has a submission for that specific form
  (checked against `GET /registrations/mine/`), the card shows "You're
  already registered" with the registration ID and status instead of a
  button — it doesn't let them submit twice from the UI.
- On successful submission, that card's content is replaced in place with
  the registration ID + confirmation message (no page-level success screen
  swap like before, since multiple independent activities can be registered
  for separately on the same page).

## 1b. Update — multiple backend connections via env

Three more `npm` scripts and three more env files, so you can point the same
build at different backend deployments without editing code:

```
.env               - default fallback (also what `vite preview` reads)
.env.development    - used by `npm run dev` / `npm run dev` mode
.env.staging         - used by `npm run dev:staging` / `build:staging`
.env.production       - used by `npm run dev:production` / `build:production`
```

Each just sets `VITE_API_BASE_URL`. Edit `.env.staging` / `.env.production`
to point at your real staging/production Django deployments — they currently
contain placeholder URLs.

```bash
npm run dev               # local backend (http://localhost:8000/api/v2)
npm run dev:staging        # whatever VITE_API_BASE_URL is in .env.staging
npm run build:production   # production build using .env.production
```

## 1c. Fix — `@/...` imports not resolving on some machines (Windows)

`npm run dev` could fail with `The following dependencies are imported but
could not be resolved: @/context/AuthContext ...`. Cause: `vite.config.ts`
originally computed the `@` alias manually with Node's `path`/`url` APIs
(`fileURLToPath(new URL('./src', import.meta.url))`), and that computation
depends on how Vite loads the config file itself — on some setups it doesn't
resolve. Fixed by switching to Vite's native `resolve.tsconfigPaths: true`,
which reads the same `@/*` mapping straight from `tsconfig.app.json` instead
of computing a path at config-eval time. Verified against both `vite build`
and the dev server (confirmed `@/context/AuthContext` resolves correctly at
runtime, not just during the dependency pre-bundle scan).

## 2. Environment variables

```
VITE_API_BASE_URL=http://localhost:8000/api/v2
```

That's the only one the app reads. Set per-environment via the files above.

## 3. Commands to run it

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173, talks to .env.development
npm run build         # type-checks (tsc -b) then builds to dist/
npm run preview       # serve the production build locally
```

## 4. Backend contract assumptions / gaps hit

- No settings/branding API exists on the backend, so `/admin/settings` is a
  placeholder page rather than a working settings form — flagged, not faked.
- The admin form builder's field editor is a single dialog (bottom sheet on
  mobile, centered on desktop) rather than a permanently-visible right-hand
  pane, so both breakpoints share one implementation instead of two. The
  drag-and-drop reordering, add/duplicate/delete, and live preview are all
  still there — only the "always-visible split pane" part was simplified.
- File Upload fields store whatever URL/text value is submitted; there's no
  actual file storage wired up (matches the backend, which has the same
  gap — no storage backend was specified for either side).

## 5. Verification performed

No browser/screenshot tool is available in this environment, so testing was:
TypeScript strict-mode compile (0 errors), `vite build` in every mode
(0 errors), `oxlint` static analysis (0 errors, a handful of expected
RHF-memoization/effect notices), and live integration against the real
Django backend — confirmed `active_forms` returns multiple entries when an
event has more than one active form, and the full admin → build form →
activate → public submit → export flow still works after these changes.
Visual/interactive behavior (animations, responsive breakpoints, dark mode
rendering) was written carefully but not visually verified — worth a manual
pass in an actual browser before shipping.
