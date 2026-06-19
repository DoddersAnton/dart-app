import { GameRound } from "@/types/game-with-players";

// ── 3-dart averages ──────────────────────────────────────────────────────────

export function threeDartAvg(totalScore: number, totalDarts: number): number | null {
  if (totalDarts === 0) return null;
  return (totalScore / totalDarts) * 3;
}

// Per-side 3-dart average over rounds where that side actually threw (score > 0).
export function sideThreeDartAvg(rounds: GameRound[], side: "home" | "away") {
  const scored = rounds.filter((r) => (side === "home" ? r.homeScore : r.awayScore) > 0);
  const totalScore = scored.reduce((s, r) => s + (side === "home" ? r.homeScore : r.awayScore), 0);
  const totalDarts = scored.reduce((s, r) => s + ((side === "home" ? r.homeDartsUsed : r.awayDartsUsed) ?? r.dartsUsed ?? 3), 0);
  return threeDartAvg(totalScore, totalDarts);
}

// Per-side total points scored and total darts thrown (score > 0 rounds only).
export function sideTotals(rounds: GameRound[], side: "home" | "away") {
  const scored = rounds.filter((r) => (side === "home" ? r.homeScore : r.awayScore) > 0);
  const points = scored.reduce((s, r) => s + (side === "home" ? r.homeScore : r.awayScore), 0);
  const darts = scored.reduce((s, r) => s + ((side === "home" ? r.homeDartsUsed : r.awayDartsUsed) ?? r.dartsUsed ?? 3), 0);
  return { points, darts };
}

export function computeAverages(rounds: GameRound[]) {
  if (rounds.length === 0) return { homeAvg: null, awayAvg: null, playerAverages: [] };

  const homeAvg = sideThreeDartAvg(rounds, "home");
  const awayAvg = sideThreeDartAvg(rounds, "away");

  // Per-player 3-dart avg across both sides (attributed via home/away player ids).
  const playerMap = new Map<number, { name: string; total: number; darts: number }>();
  const add = (id: number | null, name: string | null, score: number, darts: number) => {
    if (!id || score <= 0) return;
    const entry = playerMap.get(id) ?? { name: name ?? "Unknown", total: 0, darts: 0 };
    playerMap.set(id, { name: entry.name, total: entry.total + score, darts: entry.darts + darts });
  };
  for (const r of rounds) {
    add(r.homePlayerId, r.homePlayerName, r.homeScore, r.homeDartsUsed ?? r.dartsUsed ?? 3);
    add(r.awayPlayerId, r.awayPlayerName, r.awayScore, r.awayDartsUsed ?? r.dartsUsed ?? 3);
  }
  const playerAverages = [...playerMap.entries()]
    .map(([id, p]) => ({ id, name: p.name, avg: threeDartAvg(p.total, p.darts) ?? 0 }))
    .sort((a, b) => b.avg - a.avg);

  return { homeAvg, awayAvg, playerAverages };
}

// ── Checkout dart-count rules ────────────────────────────────────────────────

// A score finishable with a single dart: an even double (2..40) or the bullseye (50).
function isOneDartFinish(score: number): boolean {
  return (score >= 2 && score <= 40 && score % 2 === 0) || score === 50;
}

// Single-dart values reachable on a non-finishing dart: singles 1-20, the doubles,
// the trebles, the outer (25) and inner (50) bull.
const REACHABLE_DARTS: number[] = (() => {
  const set = new Set<number>();
  for (let n = 1; n <= 20; n++) {
    set.add(n);       // single
    set.add(n * 2);   // double
    set.add(n * 3);   // treble
  }
  set.add(25);
  set.add(50);
  return [...set];
})();

function isTwoDartFinish(score: number): boolean {
  if (score > 110) return false;
  return REACHABLE_DARTS.some((d) => d < score && isOneDartFinish(score - d));
}

function isThreeDartFinish(score: number): boolean {
  if (score > 170) return false;
  return REACHABLE_DARTS.some((d) => d < score && isTwoDartFinish(score - d));
}

/**
 * Minimum number of darts (1, 2 or 3) required to check out the given score,
 * or null if the score cannot be finished (e.g. 169, 168, 166…).
 */
export function minDartsForCheckout(score: number): 1 | 2 | 3 | null {
  if (isOneDartFinish(score)) return 1;
  if (isTwoDartFinish(score)) return 2;
  if (isThreeDartFinish(score)) return 3;
  return null;
}
