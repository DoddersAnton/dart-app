# Session Log

This file records work content, current progress, and upcoming tasks across sessions.
New entries are **appended** to the end so the full history is preserved.

---

## Session — 2026-06-11

### Work Content
- Initialized `docs/session_log.md` to track work content, progress, and upcoming tasks.
- Established the convention: this log is **append-only** — new entries go at the end, existing logs are never overwritten.
- Agreed to automatically update this log whenever a task is finished.

### Current Progress
- Session log created and ready for use.
- Working branch: `master`.
- Outstanding uncommitted work in the tree relates to multi-team support (team settings, permissions, team photos/sponsors, player team roles, onboarding session restore) — not yet committed.

### Upcoming Tasks
- _None recorded yet — awaiting next request._

---

## Session — 2026-06-11 (cont.)

### Work Content
- Made the team name badge / team selector in the nav visible on mobile.
- File: `components/nav/nav.tsx` — changed the team-name container class from `hidden md:block` to `block` (line ~108). It sits directly under the "SGOR+" brand text.
- Behaviour: single team → shows team name; multiple teams → shows the team-switcher `DropdownMenu` (works with touch on mobile).

### Current Progress
- Edit applied; team badge/selector now renders across all viewports.
- No layout-height impact (badge is `text-[10px]` stacked under the brand text).

### Upcoming Tasks
- Optional: visually verify on a real mobile viewport (e.g. `npm run dev`) that the badge/dropdown don't crowd the hamburger menu on narrow screens.

---

## Session — 2026-06-12

### Work Content
- Replaced the site favicon with the SGOR logo.
- Copied `public/sgor-logo.ico` over `app/favicon.ico` (Next.js App Router serves `app/favicon.ico` as the tab icon). Both files are 3518 bytes.

### Current Progress
- Favicon swapped successfully.

### Upcoming Tasks
- Hard-refresh / clear browser cache to confirm the new favicon appears (browsers cache favicons aggressively).

---

## Session — 2026-06-12 (cont.)

### Work Content
- Added an **Instagram link** to team settings, surfaced as an Instagram button on the home page when populated.
- Changes:
  - `server/schema.ts` — added `instagramUrl` varchar(500) to the `team` table.
  - `server/actions/update-team-settings.ts` — accept `instagramUrl` in the values type.
  - `server/actions/get-team-homepage-data.ts` — added `instagramUrl` to `TeamHomepageData` type + mapping.
  - `app/settings/team-settings/page.tsx` — pass `initialInstagramUrl` to the form.
  - `components/teams/team-settings-form.tsx` — new Instagram input + save handler (validates URL starts with http/https) in the Identity card.
  - `components/home/home.tsx` — Instagram button (links out in new tab) in the team identity row, shown only when `instagramUrl` is set.
  - Migration `server/migrations/0021_lonely_starfox.sql` generated and applied via `db:push`.

### Current Progress
- Feature complete end-to-end; DB column live. `tsc --noEmit` clean (only cosmetic lucide `Instagram` deprecation hints remain).

### Upcoming Tasks
- _None — feature ready to test in the running app._

---

## Session — 2026-06-12 (cont. 2)

### Work Content
- **/players page**: confirmed the list is already scoped (grouped) to the active team via the `active-team-id` cookie + `playerTeams` filter in `app/players/page.tsx`. Removed the redundant legacy free-text `team` string from the player cards.
  - `app/players/player-card-list.tsx` — dropped `team` from the `Player` interface and removed its render line.
- **Player profile header**: reformatted DOB, age, darts used, and darts weight from cramped muted paragraphs into wrapping shadcn `Badge`s for better mobile layout.
  - `app/player/[id]/player-overview-client.tsx` — added `Badge` import + `Cake`/`Calendar` icons; DOB (calendar icon), age (cake icon, "X yrs"), darts used (target icon), and weight ("Ng") now render as a `flex-wrap` badge row under the name.

### Current Progress
- Both changes complete; `tsc --noEmit` clean.

### Upcoming Tasks
- _None — ready to test on mobile viewport._

---

## Session — 2026-06-12 (cont. 4)

### Work Content
- Committed and pushed all outstanding work to `origin/master`.
- Commit `e41b2a9` — "Team settings, Instagram link, and mobile UI refinements" (65 files, +8726/-270). Bundled this session's UI changes with the in-progress multi-team work (entangled across the same files).
- Push range `0c0ab04..e41b2a9` (also published the 2 earlier local commits).

### Current Progress
- Working tree clean; local `master` in sync with `origin/master`.

### Upcoming Tasks
- _None._

---

## Session — 2026-06-12 (cont. 3)

### Work Content
- Fixed mobile clash where the player-profile header action buttons overlapped the new detail badges.
- `app/player/[id]/player-overview-client.tsx`:
  - Made the **Edit** and **Upload avatar** dialogs controlled (state-driven, no inline `DialogTrigger`) so they can be opened from multiple places. Removed unused `DialogTrigger` import.
  - **Desktop (`md+`)**: unchanged inline button row (Practice, Edit, Link, Change image) — now opens dialogs via `setEditOpen`/`setDialogOpen`.
  - **Mobile (`<md`)**: collapsed all actions into a single `MoreVertical` dropdown menu (Practice, Edit, Change image, Link player). Added `DropdownMenu` import + `MoreVertical` icon.
  - Added `shrink-0` to the actions container so it never squeezes the name/badges.

### Current Progress
- Complete; `tsc --noEmit` clean. Header now shows just a kebab menu on mobile, leaving room for the badges to wrap.

### Upcoming Tasks
- _None — ready to test on mobile viewport._

---

## Session — 2026-06-12 (cont. 5)

### Work Content
Major onboarding + roles overhaul (plan: `~/.claude/plans/woolly-weaving-harp.md`).

- **Schema** (`server/schema.ts`): added `players.isLeagueAdmin` (DB-set only); new `team_join_requests` table + relations; documented the 5 team roles. Migration `0022_slippery_beast.sql` generated + pushed.
- **Permissions** (`lib/permissions.ts`): expanded `TeamRole` to player/vice_captain/treasurer/secretary/captain; added `isLeagueAdmin`, `isTeamAdmin`, `requireTeamAdmin`, `requireFinanceAccess`, `canEditPlayerProfile`. League admin short-circuits to allow.
- **Action gating** (~16 files): team-data actions → `requireTeamAdmin` (secretary gains access); fine-management (create-fine, delete-fine, delete-player-fine) → `requireFinanceAccess` (treasurer); `update-player-team-role` + `delete-player` stay captain-only; gated `create-player` (insert=team admin, edit=canEditPlayerProfile) and team photos/sponsors. NOTE: issuing/paying fines stays open to members (preserves existing behaviour).
- **Join requests**: new actions `request-to-join-team`, `resolve-join-request`, `get-team-join-requests`, plus onboarding `claim-player-profile` and `create-own-profile`. Deleted superseded `complete-onboarding.ts` (let players self-assign teams).
- **Onboarding** (`onboarding-form.tsx`): removed player-driven team select. Step 1 claim an unlinked profile OR create one; Step 2 request to join a team (pending captain approval). Pre-linked claims skip straight to the app.
- **Team Settings**: page now gated to team admins (captain/secretary); added Join Requests card (approve/reject), expanded role select to 5 roles (gated to captains via `canManageRoles`), and an Info popover explaining each role.
- **Surfacing**: nav formats role labels (e.g. "Vice Captain"); "Add Player" button + page gated to team admins.

### Current Progress
- Complete. `tsc --noEmit` clean, `npm run lint` clean (only pre-existing warnings), `npm run build` passes. Migration applied to DB.

### Upcoming Tasks
- Manual end-to-end verification in `npm run dev` (needs real Clerk sessions): new-user onboarding → request join → captain approve/reject; role-gating per role; league admin via DB flag.
- Optional/deferred: dedicated "delete player" UI (captain-only rights already wired).

---
