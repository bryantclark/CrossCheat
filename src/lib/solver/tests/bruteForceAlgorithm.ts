import type { Direction, Move } from "../scorer";
import type { Trie } from "../trie";
import type { GameConfig } from "../games";
import { applyMultiplier as mainApplyMultiplier } from "../scorer";

// ── Helpers ───────────────────────────────────────────────────

function rc(r: number, c: number, i: number, d: Direction): [number, number] {
  return d === "V" ? [r + i, c] : [r, c + i];
}

function crossWordScore(
  board: string[][],
  r: number,
  c: number,
  char: string,
  mainDir: Direction,
  isBlank: boolean,
  trie: Trie,
  config: GameConfig,
): number {
  const { letterValues, boardMultipliers, boardWidth, boardHeight } = config;
  const dr = mainDir === "V" ? 0 : 1;
  const dc = mainDir === "V" ? 1 : 0;

  const r1 = r - dr,
    c1 = c - dc;
  const r2 = r + dr,
    c2 = c + dc;
  const hasNeighbor =
    (r1 >= 0 &&
      r1 < boardHeight &&
      c1 >= 0 &&
      c1 < boardWidth &&
      board[r1][c1] !== " ") ||
    (r2 >= 0 &&
      r2 < boardHeight &&
      c2 >= 0 &&
      c2 < boardWidth &&
      board[r2][c2] !== " ");
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
    cr < boardHeight &&
    cc >= 0 &&
    cc < boardWidth &&
    (board[cr][cc] !== " " || (cr === r && cc === c))
  ) {
    const ch = cr === r && cc === c ? char : board[cr][cc];
    let val: number;
    if (cr === r && cc === c) {
      val = isBlank ? 0 : (letterValues[ch] ?? 0);
      const { val: adjVal, wm } = mainApplyMultiplier(
        val,
        boardMultipliers[r][c],
      );
      val = adjVal;
      wmult *= wm;
    } else {
      val = letterValues[ch] ?? 0;
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

function findAnchors(
  board: string[][],
  config: GameConfig,
): {
  anchors: Set<string>;
  hasTiles: boolean;
} {
  const { boardWidth, boardHeight, centerSquare } = config;
  const anchors = new Set<string>();
  let hasTiles = false;

  for (let r = 0; r < boardHeight; r++) {
    for (let c = 0; c < boardWidth; c++) {
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
            nr < boardHeight &&
            nc >= 0 &&
            nc < boardWidth &&
            board[nr][nc] === " "
          ) {
            anchors.add(`${nr},${nc}`);
          }
        }
      }
    }
  }

  if (anchors.size === 0) anchors.add(`${centerSquare[0]},${centerSquare[1]}`);
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
  config: GameConfig,
): number | null {
  const {
    letterValues,
    boardMultipliers,
    bingoBonus,
    rackSize,
    boardWidth,
    boardHeight,
  } = config;
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
      score += letterValues[ch] ?? 0;
    } else {
      tilesPlaced++;
      let isBlank = false;
      let val: number;

      const tileIdx = tiles.indexOf(ch);
      if (tileIdx !== -1) {
        tiles.splice(tileIdx, 1);
        val = letterValues[ch] ?? 0;
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

      const { val: adjVal, wm } = mainApplyMultiplier(
        val,
        boardMultipliers[r][c],
      );
      wmult *= wm;
      score += adjVal;

      const xs = crossWordScore(board, r, c, ch, d, isBlank, trie, config);
      if (xs === -1) return null;
      xscore += xs;
    }
  }

  if (tilesPlaced === 0) return null;
  if (hasTiles && !connects && xscore === 0) return null;

  // Check no adjacent letter before word start
  const [br, bc] = rc(startR, startC, -1, d);
  if (
    br >= 0 &&
    br < boardHeight &&
    bc >= 0 &&
    bc < boardWidth &&
    board[br][bc] !== " "
  )
    return null;

  // Check no adjacent letter after word end
  const [ar, ac] = rc(startR, startC, word.length, d);
  if (
    ar >= 0 &&
    ar < boardHeight &&
    ac >= 0 &&
    ac < boardWidth &&
    board[ar][ac] !== " "
  )
    return null;

  const bingo = tilesPlaced === rackSize ? bingoBonus : 0;
  return score * wmult + xscore + bingo;
}

// ── Public API ────────────────────────────────────────────────

export function bruteForceSolve(
  board: string[][],
  rackStr: string,
  dictionary: Set<string>,
  trie: Trie,
  config: GameConfig,
): Move[] {
  const { boardWidth, boardHeight } = config;
  const rack = rackStr.toUpperCase().replace(/\?/g, " ").split("");
  const { anchors, hasTiles } = findAnchors(board, config);

  // Pre-filter: collect available letters (rack + board)
  const boardLetters = new Set<string>();
  for (let r = 0; r < boardHeight; r++) {
    for (let c = 0; c < boardWidth; c++) {
      if (board[r][c] !== " ") boardLetters.add(board[r][c]);
    }
  }
  const rackLetters = new Set(rack.filter((ch) => ch !== " "));
  const available = new Set([...boardLetters, ...rackLetters]);
  const numBlanks = rack.filter((ch) => ch === " ").length;

  // Filter dictionary
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
    if (word.length > Math.max(boardWidth, boardHeight)) continue;

    for (const anchorKey of anchors) {
      const [ra, ca] = anchorKey.split(",").map(Number);

      for (const d of ["H", "V"] as Direction[]) {
        for (let offset = 0; offset < word.length; offset++) {
          const [sr, sc] = rc(ra, ca, -offset, d);
          const [er, ec] = rc(sr, sc, word.length - 1, d);
          if (sr < 0 || sc < 0 || er >= boardHeight || ec >= boardWidth)
            continue;

          const key = `${word}-${sr}-${sc}-${d}`;
          if (resultsMap.has(key)) continue;

          const s = tryPlace(
            board,
            word,
            sr,
            sc,
            d,
            rack,
            hasTiles,
            trie,
            config,
          );
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
