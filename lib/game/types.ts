// Shapes mirror what the desktop recorder captures from the official game-events
// feed (me, roster, store, board, bench, match_info), one snapshot per round,
// uploaded only after the match ends. Augments are never stored or shown.

export type Cost = 1 | 2 | 3 | 4 | 5;
export type Star = 1 | 2 | 3;

export interface UnitDef {
  id: string;
  name: string;
  cost: Cost;
  traits: string[];
}

export interface Piece {
  unit: string; // UnitDef id
  star: Star;
  items: string[];
}

export type RoundKind = "pve" | "pvp" | "carousel";
export type Outcome = "win" | "loss" | "draw" | "none";

export interface Opponent {
  id: string;
  name: string;
  hp: number;
  level: number;
  boardValue: number; // sum of cost * copies on board
  eliminatedAt?: string;
}

export interface RoundSnapshot {
  stage: string; // "4-1"
  kind: RoundKind;
  // state at the start of the planning phase
  hp: number;
  gold: number;
  level: number;
  xp: number;
  xpToNext: number;
  shops: string[][]; // every shop seen this round, in order (first is the free one)
  // actions during the planning phase
  rerolls: number;
  xpBought: number; // times "buy xp" was pressed
  bought: string[];
  sold: string[];
  soldGold: number; // what the sold units paid back
  // state when combat starts
  board: Piece[];
  bench: Piece[];
  itemBench: string[];
  goldEnd: number;
  // combat
  opponent?: string;
  outcome: Outcome;
  damageTaken: number;
  roster: Opponent[];
}

export interface GameRecord {
  id: string;
  player: string;
  placement: number;
  patch: string;
  setName: string;
  queue: string;
  playedAt: string;
  durationMin: number;
  source: "recorder" | "screen" | "match-api";
  rounds: RoundSnapshot[];
}
