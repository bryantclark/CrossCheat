import { LETTER_VALUES, BOARD_MULT } from "./constants";
import type { Trie } from "./trie";

export type Direction = "H" | "V";

export interface Move {
  word: string;
  row: number;
  col: number;
  direction: Direction;
  score: number;
}

export function applyMultiplier(
  value: number,
  code: string,
): { val: number; wm: number } {
  const m = code.trim();
  if (m === "2L" || m === "DL") return { val: value * 2, wm: 1 };
  if (m === "3L" || m === "TL") return { val: value * 3, wm: 1 };
  if (m === "2W" || m === "DW") return { val: value, wm: 2 };
  if (m === "3W" || m === "TW") return { val: value, wm: 3 };
  return { val: value, wm: 1 };
}

export function scoreMove(
  board: string[][],
  word: string,
  sr: number,
  sc: number,
  d: Direction,
  rack: string[],
  trie: Trie,
  isFirstMove: boolean = false,
): number | null {
  const tiles = [...rack];
  let score = 0;
  let wmult = 1;
  let placed = 0;
  let xscore = 0;
  let connects = false;

  for (let i = 0; i < word.length; i++) {
    const r = d === "V" ? sr + i : sr;
    const c = d === "H" ? sc + i : sc;

    if (r < 0 || r >= 15 || c < 0 || c >= 15) return null;

    if (board[r][c] !== " ") {
      if (board[r][c] !== word[i]) return null;
      connects = true;
      score += LETTER_VALUES[word[i]] || 0;
    } else {
      placed++;
      let val = 0;
      const char = word[i];
      const tileIndex = tiles.indexOf(char);
      const blankIndex = tiles.indexOf(" ");
      const questionIndex = tiles.indexOf("?");

      if (tileIndex !== -1) {
        tiles.splice(tileIndex, 1);
        val = LETTER_VALUES[char] || 0;
      } else if (blankIndex !== -1) {
        tiles.splice(blankIndex, 1);
        val = 0;
      } else if (questionIndex !== -1) {
        tiles.splice(questionIndex, 1);
        val = 0;
      } else {
        return null;
      }

      const { val: adjVal, wm } = applyMultiplier(val, BOARD_MULT[r][c]);
      wmult *= wm;
      score += adjVal;

      // Cross-word score
      const perp: Direction = d === "H" ? "V" : "H";
      const dr2 = perp === "V" ? 1 : 0;
      const dc2 = perp === "H" ? 1 : 0;

      const n1r = r - dr2;
      const n1c = c - dc2;
      const n2r = r + dr2;
      const n2c = c + dc2;

      const hasNeighbor =
        (n1r >= 0 &&
          n1r < 15 &&
          n1c >= 0 &&
          n1c < 15 &&
          board[n1r][n1c] !== " ") ||
        (n2r >= 0 &&
          n2r < 15 &&
          n2c >= 0 &&
          n2c < 15 &&
          board[n2r][n2c] !== " ");

      if (hasNeighbor) {
        let tr = r;
        let tc = c;
        while (
          tr - dr2 >= 0 &&
          tc - dc2 >= 0 &&
          board[tr - dr2][tc - dc2] !== " "
        ) {
          tr -= dr2;
          tc -= dc2;
        }

        let cw = "";
        let cs = 0;
        let cm = 1;
        let cr2 = tr;
        let cc2 = tc;

        while (
          cr2 >= 0 &&
          cr2 < 15 &&
          cc2 >= 0 &&
          cc2 < 15 &&
          (board[cr2][cc2] !== " " || (cr2 === r && cc2 === c))
        ) {
          const x = cr2 === r && cc2 === c ? word[i] : board[cr2][cc2];
          let v2 =
            cr2 === r && cc2 === c && val === 0 ? 0 : LETTER_VALUES[x] || 0;
          if (cr2 === r && cc2 === c) {
            const { val: axVal, wm: axm } = applyMultiplier(
              v2,
              BOARD_MULT[r][c],
            );
            v2 = axVal;
            cm *= axm;
          }
          cs += v2;
          cw += x;
          cr2 += dr2;
          cc2 += dc2;
        }

        if (cw.length > 1) {
          if (!trie.contains(cw)) return null;
          xscore += cs * cm;
          connects = true;
        }
      }
    }
  }

  if (placed === 0) return null;
  if (!isFirstMove && !connects && xscore === 0) return null;
  if (isFirstMove) {
    // Verify it touches the center (7,7)
    let touchesCenter = false;
    for (let i = 0; i < word.length; i++) {
      const r = d === "V" ? sr + i : sr;
      const c = d === "H" ? sc + i : sc;
      if (r === 7 && c === 7) touchesCenter = true;
    }
    if (!touchesCenter) return null;
  }

  // Extension checks
  const br = d === "V" ? sr - 1 : sr;
  const bc = d === "H" ? sc - 1 : sc;
  if (br >= 0 && br < 15 && bc >= 0 && bc < 15 && board[br][bc] !== " ")
    return null;
  const ar = d === "V" ? sr + word.length : sr;
  const ac = d === "H" ? sc + word.length : sc;
  if (ar >= 0 && ar < 15 && ac >= 0 && ac < 15 && board[ar][ac] !== " ")
    return null;

  const bingo = placed === 7 ? 40 : 0;
  return score * wmult + xscore + bingo;
}
