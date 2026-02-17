/**
 * Shared test utilities for solver tests.
 *
 * Provides dictionary loading, board generation, tile bag management,
 * and comparison helpers.
 */

import { Trie } from "../trie";
import type { Move } from "../scorer";

// ── Dictionary loading ───────────────────────────────────────

const DICTIONARY_URL =
  "https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt";

export interface TestDictionary {
  dictionary: Set<string>;
  trie: Trie;
}

export async function loadTestDictionary(): Promise<TestDictionary> {
  const response = await fetch(DICTIONARY_URL);
  const text = await response.text();
  const words = text
    .split("\n")
    .map((w) => w.trim().toUpperCase())
    .filter(Boolean);

  const dictionary = new Set(words);
  const trie = new Trie();
  for (const word of words) {
    trie.insert(word);
  }
  console.log(`Test setup: loaded ${dictionary.size} words`);
  return { dictionary, trie };
}

// ── Tile bag ─────────────────────────────────────────────────

const TILE_DISTRIBUTION: [string, number][] = [
  ["A", 9],
  ["B", 2],
  ["C", 2],
  ["D", 4],
  ["E", 12],
  ["F", 2],
  ["G", 3],
  ["H", 2],
  ["I", 9],
  ["J", 1],
  ["K", 1],
  ["L", 4],
  ["M", 2],
  ["N", 6],
  ["O", 8],
  ["P", 2],
  ["Q", 1],
  ["R", 6],
  ["S", 4],
  ["T", 6],
  ["U", 4],
  ["V", 2],
  ["W", 2],
  ["X", 1],
  ["Y", 2],
  ["Z", 1],
  ["?", 2],
];

export function makeBag(): string[] {
  const bag: string[] = [];
  for (const [letter, count] of TILE_DISTRIBUTION) {
    for (let i = 0; i < count; i++) bag.push(letter);
  }
  return bag;
}

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function drawRack(bag: string[], count: number = 7): string {
  shuffle(bag);
  return bag.splice(0, Math.min(count, bag.length)).join("");
}

// ── Board utilities ──────────────────────────────────────────

export function emptyBoard(): string[][] {
  return Array.from({ length: 15 }, () => Array(15).fill(" "));
}

export function placeWord(
  board: string[][],
  word: string,
  r: number,
  c: number,
  d: "H" | "V",
): boolean {
  const endR = d === "V" ? r + word.length - 1 : r;
  const endC = d === "H" ? c + word.length - 1 : c;
  if (endR > 14 || endC > 14) return false;

  for (let i = 0; i < word.length; i++) {
    const pr = d === "V" ? r + i : r;
    const pc = d === "H" ? c + i : c;
    if (board[pr][pc] !== " " && board[pr][pc] !== word[i]) return false;
  }

  for (let i = 0; i < word.length; i++) {
    const pr = d === "V" ? r + i : r;
    const pc = d === "H" ? c + i : c;
    board[pr][pc] = word[i];
  }
  return true;
}

/**
 * Validate that every horizontal and vertical word on the board is in the dictionary.
 */
export function validateAllWords(board: string[][], trieRef: Trie): boolean {
  for (let r = 0; r < 15; r++) {
    let c = 0;
    while (c < 15) {
      if (board[r][c] !== " ") {
        let word = "";
        while (c < 15 && board[r][c] !== " ") {
          word += board[r][c];
          c++;
        }
        if (word.length > 1 && !trieRef.contains(word)) return false;
      } else {
        c++;
      }
    }
  }
  for (let c = 0; c < 15; c++) {
    let r = 0;
    while (r < 15) {
      if (board[r][c] !== " ") {
        let word = "";
        while (r < 15 && board[r][c] !== " ") {
          word += board[r][c];
          r++;
        }
        if (word.length > 1 && !trieRef.contains(word)) return false;
      } else {
        r++;
      }
    }
  }
  return true;
}

/**
 * Generate a board with `numWords` valid dictionary words placed on it.
 * The first word always crosses center (7,7). Subsequent words are placed
 * so they intersect existing tiles (sharing at least one letter).
 */
export function generateBoard(
  numWords: number,
  dictionary: Set<string>,
  trie: Trie,
): string[][] {
  for (let attempt = 0; attempt < 50; attempt++) {
    const board = emptyBoard();
    const words = pickRandomWords(numWords * 3, dictionary);
    let placed = 0;
    let wordIdx = 0;

    while (wordIdx < words.length && placed === 0) {
      const word = words[wordIdx++];
      const d: "H" | "V" = Math.random() < 0.5 ? "H" : "V";
      const offset = Math.floor(Math.random() * word.length);
      const r = d === "V" ? 7 - offset : 7;
      const c = d === "H" ? 7 - offset : 7;
      if (r >= 0 && c >= 0 && placeWord(board, word, r, c, d)) {
        placed++;
      }
    }

    if (placed === 0) continue;

    while (placed < numWords && wordIdx < words.length) {
      const word = words[wordIdx++];
      const occupied: [number, number][] = [];
      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
          if (board[r][c] !== " ") occupied.push([r, c]);
        }
      }
      shuffle(occupied);

      let didPlace = false;
      for (const [or, oc] of occupied) {
        const existingChar = board[or][oc];
        for (let wi = 0; wi < word.length; wi++) {
          if (word[wi] !== existingChar) continue;

          for (const d of ["H", "V"] as const) {
            const sr = d === "V" ? or - wi : or;
            const sc = d === "H" ? oc - wi : oc;
            if (sr < 0 || sc < 0) continue;

            const test = board.map((row) => [...row]);
            if (placeWord(test, word, sr, sc, d)) {
              if (validateAllWords(test, trie)) {
                placeWord(board, word, sr, sc, d);
                didPlace = true;
                break;
              }
            }
          }
          if (didPlace) break;
        }
        if (didPlace) break;
      }

      if (didPlace) placed++;
    }

    if (placed >= numWords) {
      return board;
    }
  }

  const board = emptyBoard();
  const word =
    [...dictionary].find((w) => w.length >= 3 && w.length <= 5) || "CAT";
  placeWord(board, word, 7, 7, "H");
  return board;
}

function pickRandomWords(n: number, dict: Set<string>): string[] {
  const shortWords = [...dict].filter((w) => w.length >= 2 && w.length <= 7);
  shuffle(shortWords);
  return shortWords.slice(0, n);
}

// ── Display utilities ────────────────────────────────────────

export function boardToString(board: string[][]): string {
  const header =
    "    " +
    Array.from({ length: 15 }, (_, i) => String(i).padStart(3)).join("");
  const divider = "   +" + "-".repeat(45);
  const rows = board.map((row, i) => {
    const cells = row.map((c) => (c === " " ? " . " : ` ${c} `)).join("");
    return `${String(i).padStart(2)} |${cells}`;
  });
  return [header, divider, ...rows].join("\n");
}

// ── Comparison helpers ───────────────────────────────────────

export function moveKey(m: Move): string {
  return `${m.word}-${m.row}-${m.col}-${m.direction}-${m.score}`;
}

/**
 * Remove tiles already on the board from the tile bag.
 */
export function removeBoardTilesFromBag(
  board: string[][],
  bag: string[],
): void {
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c] !== " ") {
        const idx = bag.indexOf(board[r][c]);
        if (idx !== -1) bag.splice(idx, 1);
      }
    }
  }
}
