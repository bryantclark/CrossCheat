/**
 * Brute-force Scrabble solver — direct port of the Python reference solver.
 * Used exclusively for testing correctness of the optimized solver.
 *
 * This is intentionally slow: it iterates every dictionary word against every
 * anchor square. Do NOT use in production.
 */

import { LETTER_VALUES, BOARD_MULT } from "../constants";
import type { Direction, Move } from "../scorer";
import type { Trie } from "../trie";

// ── Helpers ───────────────────────────────────────────────────

function rc(r: number, c: number, i: number, d: Direction): [number, number] {
  return d === "V" ? [r + i, c] : [r, c + i];
}

function applyMult(baseVal: number, multCode: string): [number, number] {
  const m = multCode.trim();
  if (m === "2L" || m === "DL") return [baseVal * 2, 1];
  if (m === "3L" || m === "TL") return [baseVal * 3, 1];
  if (m === "2W" || m === "DW") return [baseVal, 2];
  if (m === "3W" || m === "TW") return [baseVal, 3];
  return [baseVal, 1];
}

function crossWordScore(
  board: string[][],
  r: number,
  c: number,
  char: string,
  mainDir: Direction,
  isBlank: boolean,
  trie: Trie,
): number {
  const dr = mainDir === "V" ? 0 : 1;
  const dc = mainDir === "V" ? 1 : 0;

  const r1 = r - dr,
    c1 = c - dc;
  const r2 = r + dr,
    c2 = c + dc;
  const hasNeighbor =
    (r1 >= 0 && r1 < 15 && c1 >= 0 && c1 < 15 && board[r1][c1] !== " ") ||
    (r2 >= 0 && r2 < 15 && c2 >= 0 && c2 < 15 && board[r2][c2] !== " ");
  if (!hasNeighbor) return 0;

  // Walk back to start of perpendicular word
  let sr = r,
    sc = c;
  while (sr - dr >= 0 && sc - dc >= 0 && board[sr - dr][sc - dc] !== " ") {
    sr -= dr;
    sc -= dc;
  }

  let word = "";
  let score = 0;
  let wmult = 1;
  let cr = sr,
    cc = sc;

  while (
    cr >= 0 &&
    cr < 15 &&
    cc >= 0 &&
    cc < 15 &&
    (board[cr][cc] !== " " || (cr === r && cc === c))
  ) {
    const ch = cr === r && cc === c ? char : board[cr][cc];
    let val: number;
    if (cr === r && cc === c) {
      val = isBlank ? 0 : (LETTER_VALUES[ch] ?? 0);
      const [adjVal, wm] = applyMult(val, BOARD_MULT[r][c]);
      val = adjVal;
      wmult *= wm;
    } else {
      val = LETTER_VALUES[ch] ?? 0;
    }
    score += val;
    word += ch;
    cr += dr;
    cc += dc;
  }

  if (word.length <= 1) return 0;
  return trie.contains(word) ? score * wmult : -1;
}

// ── Core ──────────────────────────────────────────────────────

function findAnchors(board: string[][]): {
  anchors: Set<string>;
  hasTiles: boolean;
} {
  const anchors = new Set<string>();
  let hasTiles = false;

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c] !== " ") {
        hasTiles = true;
        for (const [dr, dc] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nr = r + dr,
            nc = c + dc;
          if (
            nr >= 0 &&
            nr < 15 &&
            nc >= 0 &&
            nc < 15 &&
            board[nr][nc] === " "
          ) {
            anchors.add(`${nr},${nc}`);
          }
        }
      }
    }
  }

  if (anchors.size === 0) anchors.add("7,7");
  return { anchors, hasTiles };
}

function tryPlace(
  board: string[][],
  word: string,
  startR: number,
  startC: number,
  d: Direction,
  rack: string[],
  hasTiles: boolean,
  trie: Trie,
): number | null {
  const tiles = [...rack];
  let score = 0;
  let wmult = 1;
  let tilesPlaced = 0;
  let xscore = 0;
  let connects = false;

  for (let i = 0; i < word.length; i++) {
    const [r, c] = rc(startR, startC, i, d);
    const ch = word[i];

    if (board[r][c] !== " ") {
      if (board[r][c] !== ch) return null;
      connects = true;
      score += LETTER_VALUES[ch] ?? 0;
    } else {
      tilesPlaced++;
      let isBlank = false;
      let val: number;

      const tileIdx = tiles.indexOf(ch);
      if (tileIdx !== -1) {
        tiles.splice(tileIdx, 1);
        val = LETTER_VALUES[ch] ?? 0;
      } else {
        const blankIdx = tiles.indexOf(" ");
        if (blankIdx !== -1) {
          tiles.splice(blankIdx, 1);
          val = 0;
          isBlank = true;
        } else {
          return null;
        }
      }

      const [adjVal, wm] = applyMult(val, BOARD_MULT[r][c]);
      wmult *= wm;
      score += adjVal;

      const xs = crossWordScore(board, r, c, ch, d, isBlank, trie);
      if (xs === -1) return null;
      xscore += xs;
    }
  }

  if (tilesPlaced === 0) return null;
  if (hasTiles && !connects && xscore === 0) return null;

  // Check no adjacent letter before word start
  const [br, bc] = rc(startR, startC, -1, d);
  if (br >= 0 && br < 15 && bc >= 0 && bc < 15 && board[br][bc] !== " ")
    return null;

  // Check no adjacent letter after word end
  const [ar, ac] = rc(startR, startC, word.length, d);
  if (ar >= 0 && ar < 15 && ac >= 0 && ac < 15 && board[ar][ac] !== " ")
    return null;

  const bingo = tilesPlaced === 7 ? 40 : 0;
  return score * wmult + xscore + bingo;
}

// ── Public API ────────────────────────────────────────────────

export function bruteForceSolve(
  board: string[][],
  rackStr: string,
  dictionary: Set<string>,
  trie: Trie,
): Move[] {
  const rack = rackStr.toUpperCase().replace(/\?/g, " ").split("");
  const { anchors, hasTiles } = findAnchors(board);

  // Pre-filter: collect available letters (rack + board)
  const boardLetters = new Set<string>();
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c] !== " ") boardLetters.add(board[r][c]);
    }
  }
  const rackLetters = new Set(rack.filter((ch) => ch !== " "));
  const available = new Set([...boardLetters, ...rackLetters]);
  const numBlanks = rack.filter((ch) => ch === " ").length;

  // Filter dictionary like the Python version
  let candidates: string[];
  if (numBlanks === 0) {
    candidates = [...dictionary].filter((w) =>
      [...new Set(w)].every((ch) => available.has(ch)),
    );
  } else if (numBlanks === 1) {
    candidates = [...dictionary].filter((w) => {
      let missing = 0;
      for (const ch of new Set(w)) {
        if (!available.has(ch)) missing++;
      }
      return missing <= 1;
    });
  } else {
    candidates = [...dictionary];
  }

  const resultsMap = new Map<string, Move>();

  for (const word of candidates) {
    if (word.length > 15) continue;

    for (const anchorKey of anchors) {
      const [ra, ca] = anchorKey.split(",").map(Number);

      for (const d of ["H", "V"] as Direction[]) {
        for (let offset = 0; offset < word.length; offset++) {
          const [sr, sc] = rc(ra, ca, -offset, d);
          const [er, ec] = rc(sr, sc, word.length - 1, d);
          if (sr < 0 || sc < 0 || er > 14 || ec > 14) continue;

          const key = `${word}-${sr}-${sc}-${d}`;
          if (resultsMap.has(key)) continue;

          const s = tryPlace(board, word, sr, sc, d, rack, hasTiles, trie);
          if (s !== null) {
            resultsMap.set(key, {
              word,
              row: sr,
              col: sc,
              direction: d,
              score: s,
            });
          }
        }
      }
    }
  }

  return [...resultsMap.values()].sort((a, b) => b.score - a.score);
}
