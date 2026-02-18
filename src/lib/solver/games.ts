export interface GameConfig {
  name: string;
  boardWidth: number;
  boardHeight: number;
  letterValues: Record<string, number>;
  boardMultipliers: string[][];
  bingoBonus: number;
  rackSize: number;
  centerSquare: [number, number];
}

export const CROSSPLAY_LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 4,
  H: 3,
  I: 1,
  J: 10,
  K: 6,
  L: 2,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 2,
  V: 6,
  W: 5,
  X: 8,
  Y: 4,
  Z: 10,
  _: 0,
  " ": 0,
  "?": 0,
};

// Standard Scrabble letter values
export const SCRABBLE_LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
  _: 0,
  " ": 0,
  "?": 0,
};

export const WWF_LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 4,
  C: 4,
  D: 2,
  E: 1,
  F: 4,
  G: 3,
  H: 3,
  I: 1,
  J: 10,
  K: 5,
  L: 2,
  M: 4,
  N: 2,
  O: 1,
  P: 4,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 2,
  V: 5,
  W: 4,
  X: 8,
  Y: 3,
  Z: 10,
  _: 0,
  " ": 0,
  "?": 0,
};

const ___ = "   ";
const DLS = "DLS";
const TLS = "TLS";
const DWS = "DWS";
const TWS = "TWS";
const STP = "STP";

// prettier-ignore
export const CROSSPLAY_BOARD_MULT = [
    [TLS, ___, ___, TWS, ___, ___, ___, DLS, ___, ___, ___, TWS, ___, ___, TLS],
    [___, DWS, ___, ___, ___, ___, TLS, ___, TLS, ___, ___, ___, ___, DWS, ___],
    [___, ___, ___, ___, DLS, ___, ___, ___, ___, ___, DLS, ___, ___, ___, ___],
    [TWS, ___, ___, DLS, ___, ___, ___, DWS, ___, ___, ___, DLS, ___, ___, TWS],
    [___, ___, DLS, ___, ___, TLS, ___, ___, ___, TLS, ___, ___, DLS, ___, ___],
    [___, ___, ___, ___, TLS, ___, ___, DLS, ___, ___, TLS, ___, ___, ___, ___],
    [___, TLS, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, TLS, ___],
    [DLS, ___, ___, DWS, ___, DLS, ___, STP, ___, DLS, ___, DWS, ___, ___, DLS],
    [___, TLS, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, TLS, ___],
    [___, ___, ___, ___, TLS, ___, ___, DLS, ___, ___, TLS, ___, ___, ___, ___],
    [___, ___, DLS, ___, ___, TLS, ___, ___, ___, TLS, ___, ___, DLS, ___, ___],
    [TWS, ___, ___, DLS, ___, ___, ___, DWS, ___, ___, ___, DLS, ___, ___, TWS],
    [___, ___, ___, ___, DLS, ___, ___, ___, ___, ___, DLS, ___, ___, ___, ___],
    [___, DWS, ___, ___, ___, ___, TLS, ___, TLS, ___, ___, ___, ___, DWS, ___],
    [TLS, ___, ___, TWS, ___, ___, ___, DLS, ___, ___, ___, TWS, ___, ___, TLS],
];

// prettier-ignore
export const SCRABBLE_BOARD_MULT = [
    [TWS, ___, ___, DLS, ___, ___, ___, TWS, ___, ___, ___, DLS, ___, ___, TWS],
    [___, DWS, ___, ___, ___, TLS, ___, ___, ___, TLS, ___, ___, ___, DWS, ___],
    [___, ___, DWS, ___, ___, ___, DLS, ___, DLS, ___, ___, ___, DWS, ___, ___],
    [DLS, ___, ___, DWS, ___, ___, ___, DLS, ___, ___, ___, DWS, ___, ___, DLS],
    [___, ___, ___, ___, DWS, ___, ___, ___, ___, ___, DWS, ___, ___, ___, ___],
    [___, TLS, ___, ___, ___, TLS, ___, ___, ___, TLS, ___, ___, ___, TLS, ___],
    [___, ___, DLS, ___, ___, ___, DLS, ___, DLS, ___, ___, ___, DLS, ___, ___],
    [TWS, ___, ___, DLS, ___, ___, ___, STP, ___, ___, ___, DLS, ___, ___, TWS],
    [___, ___, DLS, ___, ___, ___, DLS, ___, DLS, ___, ___, ___, DLS, ___, ___],
    [___, TLS, ___, ___, ___, TLS, ___, ___, ___, TLS, ___, ___, ___, TLS, ___],
    [___, ___, ___, ___, DWS, ___, ___, ___, ___, ___, DWS, ___, ___, ___, ___],
    [DLS, ___, ___, DWS, ___, ___, ___, DLS, ___, ___, ___, DWS, ___, ___, DLS],
    [___, ___, DWS, ___, ___, ___, DLS, ___, DLS, ___, ___, ___, DWS, ___, ___],
    [___, DWS, ___, ___, ___, TLS, ___, ___, ___, TLS, ___, ___, ___, DWS, ___],
    [TWS, ___, ___, DLS, ___, ___, ___, TWS, ___, ___, ___, DLS, ___, ___, TWS],
];

// prettier-ignore
export const WWF_BOARD_MULT = [
    [___, ___, ___, TWS, ___, ___, TLS, ___, TLS, ___, ___, TWS, ___, ___, ___],
    [___, ___, DLS, ___, ___, DWS, ___, ___, ___, DWS, ___, ___, DLS, ___, ___],
    [___, DLS, ___, ___, DLS, ___, ___, ___, ___, ___, DLS, ___, ___, DLS, ___],
    [TWS, ___, ___, TLS, ___, ___, ___, DWS, ___, ___, ___, TLS, ___, ___, TWS],
    [___, ___, DLS, ___, ___, DLS, ___, ___, ___, DLS, ___, ___, DLS, ___, ___],
    [___, DWS, ___, ___, ___, TLS, ___, ___, ___, TLS, ___, ___, ___, DWS, ___],
    [TLS, ___, ___, ___, DLS, ___, ___, ___, ___, ___, DLS, ___, ___, ___, TLS],
    [___, ___, ___, DWS, ___, ___, ___, STP, ___, ___, ___, DWS, ___, ___, ___],
    [TLS, ___, ___, ___, DLS, ___, ___, ___, ___, ___, DLS, ___, ___, ___, TLS],
    [___, DWS, ___, ___, ___, TLS, ___, ___, ___, TLS, ___, ___, ___, DWS, ___],
    [___, ___, DLS, ___, ___, DLS, ___, ___, ___, DLS, ___, ___, DLS, ___, ___],
    [TWS, ___, ___, TLS, ___, ___, ___, DWS, ___, ___, ___, TLS, ___, ___, TWS],
    [___, DLS, ___, ___, DLS, ___, ___, ___, ___, ___, DLS, ___, ___, DLS, ___],
    [___, ___, DLS, ___, ___, DWS, ___, ___, ___, DWS, ___, ___, DLS, ___, ___],
    [___, ___, ___, TWS, ___, ___, TLS, ___, TLS, ___, ___, TWS, ___, ___, ___],
];

export const CROSSPLAY_CONFIG: GameConfig = {
  name: "CrossPlay",
  boardWidth: 15,
  boardHeight: 15,
  letterValues: CROSSPLAY_LETTER_VALUES,
  boardMultipliers: CROSSPLAY_BOARD_MULT,
  bingoBonus: 40,
  rackSize: 7,
  centerSquare: [7, 7],
};

export const SCRABBLE_CONFIG: GameConfig = {
  name: "Scrabble",
  boardWidth: 15,
  boardHeight: 15,
  letterValues: SCRABBLE_LETTER_VALUES,
  boardMultipliers: SCRABBLE_BOARD_MULT,
  bingoBonus: 50,
  rackSize: 7,
  centerSquare: [7, 7],
};

export const WWF_CONFIG: GameConfig = {
  name: "Words With Friends",
  boardWidth: 15,
  boardHeight: 15,
  letterValues: WWF_LETTER_VALUES,
  boardMultipliers: WWF_BOARD_MULT,
  bingoBonus: 35,
  rackSize: 7,
  centerSquare: [7, 7],
};

export const GAMES: Record<string, GameConfig> = {
  CrossPlay: CROSSPLAY_CONFIG,
  Scrabble: SCRABBLE_CONFIG,
  "Words With Friends": WWF_CONFIG,
};
