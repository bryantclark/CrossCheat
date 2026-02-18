import { Trie } from "../trie";
import type { Move } from "../scorer";
import type { GameConfig } from "../games";

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

  return { dictionary, trie };
}

// ── Tile bag ─────────────────────────────────────────────────

// Default distribution (Scrabble-like)
const DEFAULT_TILE_DISTRIBUTION: [string, number][] = [
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

export function makeBag(
  distribution: [string, number][] = DEFAULT_TILE_DISTRIBUTION,
): string[] {
  const bag: string[] = [];
  for (const [letter, count] of distribution) {
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

export function emptyBoard(config: GameConfig): string[][] {
  return Array.from({ length: config.boardHeight }, () =>
    Array(config.boardWidth).fill(" "),
  );
}

export function placeWord(
  board: string[][],
  word: string,
  r: number,
  c: number,
  d: "H" | "V",
  config: GameConfig,
): boolean {
  const endR = d === "V" ? r + word.length - 1 : r;
  const endC = d === "H" ? c + word.length - 1 : c;
  if (endR >= config.boardHeight || endC >= config.boardWidth) return false;

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
export function validateAllWords(
  board: string[][],
  trieRef: Trie,
  config: GameConfig,
): boolean {
  const { boardWidth, boardHeight } = config;
  for (let r = 0; r < boardHeight; r++) {
    let c = 0;
    while (c < boardWidth) {
      if (board[r][c] !== " ") {
        let word = "";
        while (c < boardWidth && board[r][c] !== " ") {
          word += board[r][c];
          c++;
        }
        if (word.length > 1 && !trieRef.contains(word)) return false;
      } else {
        c++;
      }
    }
  }
  for (let c = 0; c < boardWidth; c++) {
    let r = 0;
    while (r < boardHeight) {
      if (board[r][c] !== " ") {
        let word = "";
        while (r < boardHeight && board[r][c] !== " ") {
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
 * The first word always crosses center. Subsequent words are placed
 * so they intersect existing tiles (sharing at least one letter).
 */
export function generateBoard(
  numWords: number,
  dictionary: Set<string>,
  trie: Trie,
  config: GameConfig,
): string[][] {
  const { boardWidth, boardHeight, centerSquare } = config;
  for (let attempt = 0; attempt < 50; attempt++) {
    const board = emptyBoard(config);
    const words = pickRandomWords(numWords * 3, dictionary);
    let placed = 0;
    let wordIdx = 0;

    while (wordIdx < words.length && placed === 0) {
      const word = words[wordIdx++];
      const d: "H" | "V" = Math.random() < 0.5 ? "H" : "V";
      const offset = Math.floor(Math.random() * word.length);
      const r = d === "V" ? centerSquare[0] - offset : centerSquare[0];
      const c = d === "H" ? centerSquare[1] - offset : centerSquare[1];
      if (r >= 0 && c >= 0 && placeWord(board, word, r, c, d, config)) {
        placed++;
      }
    }

    if (placed === 0) continue;

    while (placed < numWords && wordIdx < words.length) {
      const word = words[wordIdx++];
      const occupied: [number, number][] = [];
      for (let r = 0; r < boardHeight; r++) {
        for (let c = 0; c < boardWidth; c++) {
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
            if (placeWord(test, word, sr, sc, d, config)) {
              if (validateAllWords(test, trie, config)) {
                placeWord(board, word, sr, sc, d, config);
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

  const board = emptyBoard(config);
  const word =
    [...dictionary].find((w) => w.length >= 3 && w.length <= 5) || "CAT";
  placeWord(board, word, centerSquare[0], centerSquare[1], "H", config);
  return board;
}

function pickRandomWords(n: number, dict: Set<string>): string[] {
  const shortWords = [...dict].filter((w) => w.length >= 2 && w.length <= 7);
  shuffle(shortWords);
  return shortWords.slice(0, n);
}

// ── Display utilities ────────────────────────────────────────

export function boardToString(board: string[][], config: GameConfig): string {
  const { boardWidth, boardHeight } = config;
  const header =
    "    " +
    Array.from({ length: boardWidth }, (_, i) => String(i).padStart(3)).join(
      "",
    );
  const divider = "   +" + "-".repeat(boardWidth * 3);
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
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] !== " ") {
        const idx = bag.indexOf(board[r][c]);
        if (idx !== -1) bag.splice(idx, 1);
      }
    }
  }
}
