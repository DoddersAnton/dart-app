# Session Log — Two-Sided (Multi-Team) Match Setup & Dart Tracker Overhaul

_Date: 2026-06-16 · Plan: `~/.claude/plans/can-you-restore-our-eager-clock.md`_

## Goal
Record real players for **both** teams per round so each round attributes a home throw and an away throw to its real player. `rounds.playerId` kept as deprecated/nullable; added `homePlayerId`/`awayPlayerId` (+ per-side darts); `gamePlayers` grouped by team; `isAppTeam`/`isAppTeamHome` replaced by an active-team-derived perspective. Non-app opponents fall back to the existing free-text path (away ids stay NULL).

## Status: implementation COMPLETE, build green, NOT yet manually tested, NOT committed

- ✅ Production build compiles (`npm run build`) — only pre-existing lint warnings.
- ✅ Data migration ran: **884 rounds → 769 home-only + 115 away-only, 0 unmatched**; **489 gamePlayers** all stamped with team + side (237 home / 252 away).
- ⏳ Runtime/manual verification — **pending (user testing)**.
- ⏳ Commits — **held off** (chosen delivery: staged commits, on master or a branch — TBD).

## What changed (by phase)

### Phase 1 — Schema + migration ✅
- `server/schema.ts`: `rounds.playerId` now nullable (`@deprecated`); added `rounds.homePlayerId`, `rounds.awayPlayerId` (FK, `onDelete: set null`), `rounds.homeDartsUsed`, `rounds.awayDartsUsed`. Added `gamePlayers.teamId` (FK) + `gamePlayers.side` (`"home"|"away"`).
- Migration `server/migrations/0023_outstanding_rockslide.sql` generated + pushed.
- `scripts/backfill-round-players.ts` (new) — backfilled existing rounds/gamePlayers from each fixture's app-team side (app team = id 1). Re-runnable (skips already-migrated rows).

### Phase 2 — Server reads/writes + types ✅
- `types/game-with-players.ts`: `GameWithPlayers` gained `homePlayers`/`awayPlayers`, `mySide`, `homeTeamId`/`awayTeamId`, `homeTeamFinesEnabled`/`awayTeamFinesEnabled`; **removed `isAppTeamHome`**. `GameRound` gained `homePlayerId`/`awayPlayerId` (+ names) and `homeDartsUsed`/`awayDartsUsed`; `playerId`/`playerName` kept as deprecated.
- `server/actions/get-game.ts`: splits rosters by `side`/`teamId`; resolves both player names; derives `mySide` from optional `activeTeamId`; surfaces team `finesEnabled`.
- `server/actions/save-round-auto.ts` + `create-game-rounds.ts` + `types/add-game-rounds.ts`: write the dual ids + per-side darts.
- `server/actions/broadcast-game-state.ts`: `appPlayers`/`opposingPlayers` → `homePlayers`/`awayPlayers`; round entries carry `homePlayerName`/`awayPlayerName`.
- `lib/permissions.ts`: `getActiveTeamId` exported. Callers `app/games/dart-tracker/page.tsx` and `app/games/[id]/page.tsx` pass it; display page passes nothing (no perspective).

### Phase 3 — Game setup UX ✅
- `types/add-game-schema.ts`: `playerList` → `homePlayerList` + `awayPlayerList` (+ refine: at least one player, no player on both sides).
- `server/actions/get-team-players.ts` (new): `getTeamPlayers(teamId)`.
- `components/fixtures/add-game-popup.tsx` + `add-game.tsx`: two team-scoped roster selectors; away selector hidden with a note when the away team isn't an app team.
- `server/actions/create-game.ts`: inserts both rosters stamped with `teamId`/`side`; dropped deprecated `isAppTeam` win logic (`isAppTeamWin` set false).

### Phase 4 — Dart tracker ✅
- `components/games/dart-tracker.tsx`: both sides are real rosters (`homePlayers`/`awayPlayers`) with independent rotation; free-text `opposingPlayers` kept as fallback for a side with no real roster. Each round records `homePlayerId` + `awayPlayerId` + per-side darts. Auto-fine fires for whichever throwing side's team has `finesEnabled` and the thrower is real, stamping `playerFines.teamId`. `computeInitialState` restores legacy rounds gracefully. Scoring math preserved unchanged.

### Phase 5 — Read sites + cleanup ✅
- `components/games/game-card.tsx`: per-side 3-dart averages (home/away darts); leg table shows both players; per-player averages across both sides; CSV exports `… Player`/`… Darts` for both teams; result badge derives from `mySide` (falls back to `isAppTeamWin`).
- `components/games/display-mode.tsx`: reads `homePlayers`/`awayPlayers` + `homePlayerName`/`awayPlayerName` from the broadcast; localStorage opponent seed fills whichever side has no real roster.

## Items to check (manual test)

1. **Two-team setup** — fixture with real `homeTeamId` + `awayTeamId` → Add Game shows **two roster selectors** populated from each team; can't pick the same player on both sides (refine error). Save persists `gamePlayers` with correct `teamId`/`side`.
2. **Tracker (both real)** — `/games/dart-tracker?id=…` shows both rosters as player cards; rotation advances per side; player selector reflects the throwing side.
3. **Persistence** — new `rounds` rows have **both** `home_player_id` and `away_player_id` + `home_darts_used`/`away_darts_used`. (One normal round → darts 3/3; one checkout → winner uses selected darts.)
4. **First-throw checkout** — only the throwing side's id/darts set; other side stays NULL.
5. **Game summary** (`/games/[id]`) — leg table shows home player + away player per row; per-player avg lists both sides; **Export CSV** has both teams' Player/Score/Darts/Remaining columns.
6. **Legacy opponent** — fixture with null `awayTeamId`: away selector hidden + note; tracker uses free-text fallback; `away_player_id` stays NULL; scoring still works.
7. **Auto-fine by side** — away team `finesEnabled = true` → ≤20 away throw offers a fine stamped with the away team id; set false → no offer. Confirm "20 or under" fine exists.
8. **Result badge** — shows Win/Loss/Draw from the **active team's** perspective (`mySide`), not always "Loss" for new games.
9. **Migrated/old game** — opens in summary + display mode correctly (home-only or away-only attribution depending on which side team 1 was).
10. **Roster edits on save** — finishing a leg re-writes `gamePlayers` from the tracker's current rosters; confirm continuing an existing game doesn't drop rostered players who haven't thrown.
11. **Display mode** (`/games/[id]/display`) — live updates show correct home/away player names; pending + completed round names attribute to the right side.
12. **Undo / edit round** — undo steps both side indices back; editing a round score recomputes correctly.

## Open notes / risks
- `dartsUsed` (old shared column) left in place; new code uses per-side darts with fallback to it for legacy rows.
- `isAppTeam` / `isAppTeamWin` columns intentionally left in DB (deprecated). Win/loss now derived via `mySide` where perspective is known.
- `saveAndAdvance` re-writes the whole `gamePlayers` roster each leg-save (delete + re-insert from tracker rosters) — see item 10.

## Next steps
- User runs the manual checks above.
- Then: create staged commits (on master per repo convention, or a feature branch) — decision pending.
