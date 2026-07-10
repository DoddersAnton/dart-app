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

## Session — 2026-06-17 — Fines by season + season-aware reports

### Work Content
- Added nullable `player_fines.season_id` (migration `0024`) + a backfill script linking existing fines to the season their date falls in.
- Create-fine flows now capture a season: a **Season** dropdown (defaulted from the match date, overrideable) on the single + group fine forms; all fine actions (`create-player-fine`, `create-multiple-player-fines`, in-game `create-round-fine`) derive/set `season_id`.
- Player fines page (`/fines`): added a **date-range picker** (alongside the exact-date dropdown) and a **Season** filter.
- Charts tab: **season-on-season comparison** (this vs last) — totals + % change and a grouped bar chart by fine type (fine counts, cost in the tooltip).
- Reports page: scoped **player standings** to the active team's roster; the **season selector now drives every visual** (standings, fines, subs) + an **All seasons** aggregate; replaced the payments card with **Fines** and **Subscriptions** paid-vs-unpaid cards.
- Appended the player's name to each **player subpage title** (e.g. "Financial summary — Joe Bloggs").

### Current Progress
- Committed `7127850` on branch `fines-seasons-and-reports`; build green; `season_id` column + backfill applied to the DB.

### Upcoming Tasks
- Manual verification of the filters + season comparison in the running app.

---

## Session — 2026-06-24 — Team subscriptions settings page

### Work Content
- New `/settings/team-subscriptions` page (+ sidebar item), league-admin scoped:
  - **Season tiles** showing subs raised for the active team with a **paid %**; click a tile to drill into who's **paid / unpaid** (with a Paid/Unpaid toggle).
  - **Create subscription** dialog raises one row per active-team player; dates derived from the chosen season (`teamSubscriptionSchema`).
- New actions: `create-team-subscription`, `update-subscription-status`.
- Folded the standalone `/subscriptions` pages in (redirect to settings).

### Current Progress
- Committed `fcfccab` on branch `team-subscriptions`; build green.

### Upcoming Tasks
- _None outstanding._

---

## Session — 2026-07-01 — Season "last season" link + team quick-add

### Work Content
- Added self-referencing `seasons.last_season_id` (migration `0025`) + a **Last season** selector on the season form.
- Settings → Seasons: **ordered by start date**, with **Current season** / **Last season** badges.
- Fines comparison now resolves "this" season as the highest-start-date season and "last" via `last_season_id` (fallback to previous by date); reacts to the season filter; renders 0 values when the prior season has no data.
- Team cards (Settings → Teams): **Quick add** — bulk-create basic players (name + nickname) and add them to the team.

### Current Progress
- Committed `0b92ae7`; `last_season_id` column applied to the DB.

### Upcoming Tasks
- Set "Last season" on the current season so the comparison uses the explicit link.

---

## Session — 2026-07-03 — Fixture schedule builder + divisions

### Work Content
- **Schema:** `fixtures.week_no`; new **`division`** table (seeded **Division 1** & **Division 2**); fixtures reference `division_id`. Migrations `0026`–`0029` (the varchar `division` iteration in `0027` was dropped by `0028`, replaced by the table in `0029`).
- **Backfills (applied):** all existing fixtures set to **Division 2**; `week_no` backfilled per season from the earliest fixture date (`round(daysFromAnchor / 7) + 1`, so calendar gaps / byes skip week numbers). Script: `scripts/backfill-fixture-weeks.ts`.
- **Nav:** Matches is now a dropdown → **Fixtures / Schedule**.
- **Pages:** `/fixtures/schedule` index + `/fixtures/schedule/[seasonId]` grouped by **season → division → week**; active team starred; current team names resolved (no stale denormalised names).
- **Week builder** (league-admin, dnd-kit): pick **division** + **date**, drag teams into Home/Away rows (per-row dates), bulk-create as **scheduled** via `create-week-fixtures`; venue guard for home teams lacking a default location. Week numbers run **per (season, division)**. (League field removed from the form.)
- **Per-fixture edit** (week no / scores / status / division) via `update-fixture-schedule`; the row shows the score when not scheduled.
- **Dart tracker:** warn that opposing (free-text) players aren't saved to the DB, with a link to create a real player; **Edit players** (before the game starts) refreshes **either** team's roster from current team players and updates the game.

### Current Progress
- Committed `cc74513` on branch `fixture-schedule-builder`; build green; all division/week schema + backfills applied to the DB.

### Upcoming Tasks
- **Design the "current division flag"** (marking the active division) — deferred to its own branch.
- Manual verification of the builder (drag-drop, per-division weeks) and per-fixture editing in the running app.

---

## Session — 2026-07-09 — Feedback fixes, checkout stats, league table

### Work Content
- **Dart tracker feedback fixes:**
  - Checkout darts now validated **before** any score is deducted, so an unselected dart count can no longer strand the leg at 0 (the "stuck / false Bust" bug).
  - Added an impossible-score validator (`isPossibleThreeDartScore` — rejects 163/166/169/172/173/175/176/178/179) wired into input, submit-disable, and submit handler.
  - Score input **auto-refocuses** after each throw / side switch / fine.
  - Round-history height reduced so the scorer stays on screen.
  - **Out-of-the-board** quick-fine button (shown when the throwing team has fines enabled).
  - Unified the user-icon and opposing-players popups into one **Manage players** dialog: real-team rosters + opposing side defaulting to **database players** with a local-name override (`DB` tag).
- **Monitor / display:** player names on game-type shortcuts, **nickname** on player rows (piped through the broadcast payload), manual **refresh** button + inactivity auto-refresh.
- **Fixtures:** visible **View** button on fixture list cards and game cards; Games/Match-report combined into **pills**; match-report "remaining" columns moved to the middle.
- **Session caching (High):** `getActiveTeamId()` now validates the cookie team belongs to the current user; all pages reading the `active-team-id` cookie directly now route through it (fixes "nav right, data wrong").
- **Availability:** create-fixture and week-builder create availability rows **only for the two playing teams'** players, not the whole league.
- **Stats:** checkout darts shown next to the 3-dart avg in the game view + match report; player **name (nickname)** in both rounds tables; match report gained **F9** and **F15** (first 9 / 15-dart averages).
- **League table (new feature):** `/fixtures/league-table` under the Matches menu.
  - `league_table` snapshot table (migration `0030`); **points = legs won**; one table **per division** with season selector + division pills; rank, movement arrow/colour vs last week, legs for/against + diff.
  - `submitWeekToLeague` (from the schedule page, gated on all week fixtures `completed`) and shared `writeWeekStandings` helper.
  - **Manual submission** dialog (`submitManualWeek`) to enter a week's standings by hand.
  - **Mark league complete** (`league_status` table, migration `0031`) → final standings with champions banner + medal tints; movement column hidden.

### Current Progress
- Build green; migration `0030` applied to the DB. **`0031` (`league_status`) generated but not yet pushed** — `npm run db:push` needed before "Mark complete" works.
- Committed on a new branch.

### Upcoming Tasks
- Push migration `0031`.
- Confirm an "out of the board" fine type exists (the quick-fine button matches by title).
- Manual verification of the league table submit/complete flow in the running app.
