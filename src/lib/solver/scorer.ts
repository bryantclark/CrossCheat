import type { Trie } from "./trie";
import type { GameConfig } from "./games";

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
  startRow: number,
  startCol: number,
  direction: Direction,
  rack: string[],
  trie: Trie,
  config: GameConfig,
  isFirstMove: boolean = false,
): number | null {
  const {
    letterValues,
    boardMultipliers,
    bingoBonus,
    boardWidth,
    boardHeight,
    centerSquare,
    rackSize,
  } = config;

  const rackTiles = [...rack];
  let mainScore = 0;
  let mainWordMultiplier = 1;
  let tilesPlacedCount = 0;
  let totalCrossScore = 0;
  let connectsToExistingTile = false;

  for (let i = 0; i < word.length; i++) {
    const row = direction === "V" ? startRow + i : startRow;
    const col = direction === "H" ? startCol + i : startCol;

    if (row < 0 || row >= boardHeight || col < 0 || col >= boardWidth)
      return null;

    if (board[row][col] !== " ") {
      if (board[row][col] !== word[i]) return null;
      connectsToExistingTile = true;
      mainScore += letterValues[word[i]] || 0;
    } else {
      tilesPlacedCount++;
      let baseTileValue = 0;
      const char = word[i];

      const tileIdx = rackTiles.indexOf(char);
      const blankIdx = rackTiles.indexOf(" ");
      const questionIdx = rackTiles.indexOf("?");

      if (tileIdx !== -1) {
        rackTiles.splice(tileIdx, 1);
        baseTileValue = letterValues[char] || 0;
      } else if (blankIdx !== -1) {
        rackTiles.splice(blankIdx, 1);
        baseTileValue = 0;
      } else if (questionIdx !== -1) {
        rackTiles.splice(questionIdx, 1);
        baseTileValue = 0;
      } else {
        return null; // Not enough tiles
      }

      const { val: adjustedTileValue, wm: tileWordMultiplier } =
        applyMultiplier(baseTileValue, boardMultipliers[row][col]);
      mainWordMultiplier *= tileWordMultiplier;
      mainScore += adjustedTileValue;

      // Check for perpendicular (cross) words
      const crossDirection: Direction = direction === "H" ? "V" : "H";
      const crossDeltaRow = crossDirection === "V" ? 1 : 0;
      const crossDeltaCol = crossDirection === "H" ? 1 : 0;

      const hasNeighbor =
        (isWithinBoard(row - crossDeltaRow, col - crossDeltaCol, config) &&
          board[row - crossDeltaRow][col - crossDeltaCol] !== " ") ||
        (isWithinBoard(row + crossDeltaRow, col + crossDeltaCol, config) &&
          board[row + crossDeltaRow][col + crossDeltaCol] !== " ");

      if (hasNeighbor) {
        let headRow = row;
        let headCol = col;
        while (
          isWithinBoard(
            headRow - crossDeltaRow,
            headCol - crossDeltaCol,
            config,
          ) &&
          board[headRow - crossDeltaRow][headCol - crossDeltaCol] !== " "
        ) {
          headRow -= crossDeltaRow;
          headCol -= crossDeltaCol;
        }

        let currentRow = headRow;
        let currentCol = headCol;
        let crossWordStr = "";
        let crossWordScore = 0;
        let crossWordMultiplier = 1;

        while (
          isWithinBoard(currentRow, currentCol, config) &&
          (board[currentRow][currentCol] !== " " ||
            (currentRow === row && currentCol === col))
        ) {
          const charInCell =
            currentRow === row && currentCol === col
              ? word[i]
              : board[currentRow][currentCol];

          let tileValue = letterValues[charInCell] || 0;
          if (currentRow === row && currentCol === col && baseTileValue === 0) {
            tileValue = 0; // Blank tile
          }

          if (currentRow === row && currentCol === col) {
            const { val: adj, wm } = applyMultiplier(
              tileValue,
              boardMultipliers[row][col],
            );
            tileValue = adj;
            crossWordMultiplier *= wm;
          }

          crossWordScore += tileValue;
          crossWordStr += charInCell;
          currentRow += crossDeltaRow;
          currentCol += crossDeltaCol;
        }

        if (crossWordStr.length > 1) {
          if (!trie.contains(crossWordStr)) return null;
          totalCrossScore += crossWordScore * crossWordMultiplier;
          connectsToExistingTile = true;
        }
      }
    }
  }

  if (tilesPlacedCount === 0) return null;
  if (!isFirstMove && !connectsToExistingTile) return null;

  if (isFirstMove) {
    let touchesCenter = false;
    for (let i = 0; i < word.length; i++) {
      const row = direction === "V" ? startRow + i : startRow;
      const col = direction === "H" ? startCol + i : startCol;
      if (row === centerSquare[0] && col === centerSquare[1])
        touchesCenter = true;
    }
    if (!touchesCenter) return null;
  }

  // Check for extensions (existing tiles immediate before/after the word)
  if (
    isImmediateNeighborOccupied(
      startRow,
      startCol,
      direction,
      -1,
      board,
      config,
    )
  )
    return null;
  if (
    isImmediateNeighborOccupied(
      startRow,
      startCol,
      direction,
      word.length,
      board,
      config,
    )
  )
    return null;

  const bingoScore = tilesPlacedCount === rackSize ? bingoBonus : 0;
  return mainScore * mainWordMultiplier + totalCrossScore + bingoScore;
}

function isWithinBoard(row: number, col: number, config: GameConfig): boolean {
  return (
    row >= 0 && row < config.boardHeight && col >= 0 && col < config.boardWidth
  );
}

function isImmediateNeighborOccupied(
  startRow: number,
  startCol: number,
  direction: Direction,
  offset: number,
  board: string[][],
  config: GameConfig,
): boolean {
  const r = direction === "V" ? startRow + offset : startRow;
  const c = direction === "H" ? startCol + offset : startCol;
  return isWithinBoard(r, c, config) && board[r][c] !== " ";
}
