import { Trie, type TrieNode } from "./trie";
import { scoreMove, type Move, type Direction } from "./scorer";
import type { GameConfig } from "./games";

export function computeCrossSets(
  board: string[][],
  trie: Trie,
  direction: Direction,
  config: GameConfig,
): Set<string>[][] {
  const { boardWidth, boardHeight } = config;
  const result: Set<string>[][] = Array(boardHeight)
    .fill(null)
    .map(() =>
      Array(boardWidth)
        .fill(null)
        .map(() => new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ")),
    );

  const deltaRow = direction === "H" ? 1 : 0;
  const deltaCol = direction === "V" ? 1 : 0;

  for (let r = 0; r < boardHeight; r++) {
    for (let c = 0; c < boardWidth; c++) {
      if (board[r][c] !== " ") continue;

      const n1r = r - deltaRow;
      const n1c = c - deltaCol;
      const n2r = r + deltaRow;
      const n2c = c + deltaCol;

      const hasNeighbor =
        (n1r >= 0 &&
          n1r < boardHeight &&
          n1c >= 0 &&
          n1c < boardWidth &&
          board[n1r][n1c] !== " ") ||
        (n2r >= 0 &&
          n2r < boardHeight &&
          n2c >= 0 &&
          n2c < boardWidth &&
          board[n2r][n2c] !== " ");

      if (hasNeighbor) {
        let currentPrefixRow = r - deltaRow;
        let currentPrefixCol = c - deltaCol;
        let prefix = "";
        while (
          currentPrefixRow >= 0 &&
          currentPrefixCol >= 0 &&
          board[currentPrefixRow][currentPrefixCol] !== " "
        ) {
          prefix = board[currentPrefixRow][currentPrefixCol] + prefix;
          currentPrefixRow -= deltaRow;
          currentPrefixCol -= deltaCol;
        }

        let currentSuffixRow = r + deltaRow;
        let currentSuffixCol = c + deltaCol;
        let suffix = "";
        while (
          currentSuffixRow < boardHeight &&
          currentSuffixCol < boardWidth &&
          board[currentSuffixRow][currentSuffixCol] !== " "
        ) {
          suffix += board[currentSuffixRow][currentSuffixCol];
          currentSuffixRow += deltaRow;
          currentSuffixCol += deltaCol;
        }

        const validChars = new Set<string>();
        for (const char of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
          if (trie.contains(prefix + char + suffix)) {
            validChars.add(char);
          }
        }
        result[r][c] = validChars;
      }
    }
  }
  return result;
}

export function solve(
  board: string[][],
  rackStr: string,
  trie: Trie,
  config: GameConfig,
): Move[] {
  const rack = rackStr.toUpperCase().replace(/\?/g, " ").split("");
  const hasTiles = board.some((row) => row.some((cell) => cell !== " "));

  const { boardWidth, boardHeight, centerSquare } = config;

  const hOk = computeCrossSets(board, trie, "H", config);
  const vOk = computeCrossSets(board, trie, "V", config);

  const results: Move[] = [];
  const seen = new Set<string>();

  const scan = (direction: Direction) => {
    const crossSets = direction === "H" ? hOk : vOk;
    const lineLength = direction === "H" ? boardWidth : boardHeight;
    const numLines = direction === "H" ? boardHeight : boardWidth;

    for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
      const lineCells =
        direction === "H" ? board[lineIdx] : board.map((row) => row[lineIdx]);

      const anchorPoints = new Set<number>();
      for (let i = 0; i < lineLength; i++) {
        const r = direction === "H" ? lineIdx : i;
        const c = direction === "H" ? i : lineIdx;
        if (board[r][c] !== " ") {
          anchorPoints.add(i);
          if (i > 0 && lineCells[i - 1] === " ") anchorPoints.add(i - 1);
          if (i < lineLength - 1 && lineCells[i + 1] === " ")
            anchorPoints.add(i + 1);
        } else {
          const perpDirR = direction === "H" ? 1 : 0;
          const perpDirC = direction === "H" ? 0 : 1;
          if (
            (r - perpDirR >= 0 &&
              r - perpDirR < boardHeight &&
              c - perpDirC >= 0 &&
              c - perpDirC < boardWidth &&
              board[r - perpDirR][c - perpDirC] !== " ") ||
            (r + perpDirR >= 0 &&
              r + perpDirR < boardHeight &&
              c + perpDirC >= 0 &&
              c + perpDirC < boardWidth &&
              board[r + perpDirR][c + perpDirC] !== " ")
          ) {
            anchorPoints.add(i);
          }
        }
      }
      if (!hasTiles) {
        const lineIsCenter =
          direction === "H"
            ? lineIdx === centerSquare[0]
            : lineIdx === centerSquare[1];
        if (lineIsCenter) {
          anchorPoints.add(
            direction === "H" ? centerSquare[1] : centerSquare[0],
          );
        }
      }
      if (anchorPoints.size === 0) continue;

      const minAnchor = Math.min(...anchorPoints);
      const maxAnchor = Math.max(...anchorPoints);

      const walk = (
        pos: number,
        node: TrieNode,
        currentWord: string[],
        remainingTiles: string[],
        tilesPlaced: number,
      ) => {
        if (node.isTerminal && tilesPlaced > 0 && currentWord.length >= 2) {
          if (pos >= lineLength || lineCells[pos] === " ") {
            const startPos = pos - currentWord.length;
            const row = direction === "H" ? lineIdx : startPos;
            const col = direction === "H" ? startPos : lineIdx;
            const wordStr = currentWord.join("");
            const key = `${wordStr}-${row}-${col}-${direction}`;
            if (!seen.has(key)) {
              seen.add(key);
              const score = scoreMove(
                board,
                wordStr,
                row,
                col,
                direction,
                rack,
                trie,
                config,
                !hasTiles,
              );
              if (score !== null) {
                results.push({
                  word: wordStr,
                  row,
                  col,
                  direction,
                  score,
                });
              }
            }
          }
        }

        if (pos >= lineLength) return;

        if (lineCells[pos] !== " ") {
          const char = lineCells[pos];
          if (node.children[char]) {
            currentWord.push(char);
            walk(
              pos + 1,
              node.children[char],
              currentWord,
              remainingTiles,
              tilesPlaced,
            );
            currentWord.pop();
          }
        } else {
          if (tilesPlaced === 0 && pos > maxAnchor + remainingTiles.length)
            return;

          const r = direction === "H" ? lineIdx : pos;
          const c = direction === "H" ? pos : lineIdx;
          const allowedChars = crossSets[r][c];
          const triedInThisPos = new Set<string>();

          for (let i = 0; i < remainingTiles.length; i++) {
            const tile = remainingTiles[i];
            if (tile === " ") continue;
            if (triedInThisPos.has(tile)) continue;
            triedInThisPos.add(tile);
            if (node.children[tile] && allowedChars.has(tile)) {
              const nextTiles = [
                ...remainingTiles.slice(0, i),
                ...remainingTiles.slice(i + 1),
              ];
              currentWord.push(tile);
              walk(
                pos + 1,
                node.children[tile],
                currentWord,
                nextTiles,
                tilesPlaced + 1,
              );
              currentWord.pop();
            }
          }

          for (let i = 0; i < remainingTiles.length; i++) {
            if (remainingTiles[i] !== " ") continue;
            const nextTiles = [
              ...remainingTiles.slice(0, i),
              ...remainingTiles.slice(i + 1),
            ];
            for (const char in node.children) {
              if (allowedChars.has(char) && !triedInThisPos.has(char)) {
                currentWord.push(char);
                walk(
                  pos + 1,
                  node.children[char],
                  currentWord,
                  nextTiles,
                  tilesPlaced + 1,
                );
                currentWord.pop();
              }
            }
            break;
          }
        }
      };

      const earliestStart = Math.max(0, minAnchor - rack.length);
      for (
        let start = earliestStart;
        start <= Math.min(maxAnchor, lineLength - 1);
        start++
      ) {
        if (start > 0 && lineCells[start - 1] !== " ") continue;
        walk(start, trie.root, [], rack, 0);
      }
    }
  };

  scan("H");
  scan("V");

  return results.sort((a, b) => b.score - a.score);
}
