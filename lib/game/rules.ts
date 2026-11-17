// Income rules, one copy for the simulator and the review engine.
// Source: League of Legends wiki, TFT:Gold (current Income section), checked Nov 2026.

// Passive gold at the start of a round. Stage 1 and 2-1 pay less.
export function passiveIncome(stage: string): number {
  if (stage === "1-1") return 0;
  if (stage === "1-2" || stage === "1-3") return 2;
  if (stage === "1-4") return 3;
  if (stage === "2-1") return 4;
  return 5;
}

// Streak bonus for a run of consecutive player-fight wins or losses: 3-4 pays 1, 5 pays 2, 6+ pays 3.
// It is paid at the start of every round while the streak lasts, monster rounds included.
export function streakGold(length: number): number {
  return length >= 6 ? 3 : length >= 5 ? 2 : length >= 3 ? 1 : 0;
}

// Interest: 1 gold per 10 held, at most 5.
export function interest(gold: number): number {
  return Math.min(5, Math.floor(gold / 10));
}

// A player-fight win pays 1 more gold.
export const WIN_GOLD = 1;
