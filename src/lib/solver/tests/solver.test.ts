/**
 * Comparison tests: brute-force solver vs optimized solver.
 *
 * Generates boards with 2–12 words and random 7-tile racks, then verifies
 * that both solvers agree on the best score and the set of top-scoring moves.
 *
 * These tests are SLOW by design. Mark as .skip for normal CI runs.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { solve } from "../index";
import { bruteForceSolve } from "./bruteForceAlgorithm";
import { GAMES } from "../games";
import type { TestDictionary } from "./solverTestHelpers";
import {
  loadTestDictionary,
  makeBag,
  drawRack,
  generateBoard,
  boardToString,
  moveKey,
  removeBoardTilesFromBag,
} from "./solverTestHelpers";

// ── Shared state loaded once ─────────────────────────────────

let td: TestDictionary;

beforeAll(async () => {
  td = await loadTestDictionary();
}, 60_000);

// ── Tests ────────────────────────────────────────────────────
describe("solver correctness: brute force vs optimized", () => {
  for (const gameName in GAMES) {
    const config = GAMES[gameName];

    describe(`Game: ${gameName}`, () => {
      for (let numWords = 2; numWords <= 12; numWords++) {
        it(
          `board with ${numWords} words`,
          async () => {
            const board = generateBoard(
              numWords,
              td.dictionary,
              td.trie,
              config,
            );
            const bag = makeBag();
            removeBoardTilesFromBag(board, bag);

            const rack = drawRack(bag);

            // Run both solvers
            const optimizedResults = solve(board, rack, td.trie, config);
            const bruteResults = bruteForceSolve(
              board,
              rack,
              td.dictionary,
              td.trie,
              config,
            );

            // The best score must match
            const bestBrute =
              bruteResults.length > 0 ? bruteResults[0]!.score : 0;
            const bestOptimized =
              optimizedResults.length > 0 ? optimizedResults[0]!.score : 0;

            if (bestBrute !== bestOptimized) {
              console.log("MISMATCH! Top brute force moves:");
              for (const m of bruteResults.slice(0, 10)) {
                console.log(
                  `  ${m.word} (${m.row},${m.col}) ${m.direction} = ${m.score}`,
                );
              }
              console.log("Top optimized moves:");
              for (const m of optimizedResults.slice(0, 10)) {
                console.log(
                  `  ${m.word} (${m.row},${m.col}) ${m.direction} = ${m.score}`,
                );
              }
            }

            expect(bestOptimized).toBe(bestBrute);

            // All moves at the best score should match between both solvers
            const bruteTopMoves = new Set(
              bruteResults.filter((m) => m.score === bestBrute).map(moveKey),
            );
            const optimizedTopMoves = new Set(
              optimizedResults
                .filter((m) => m.score === bestOptimized)
                .map(moveKey),
            );

            for (const key of bruteTopMoves) {
              if (!optimizedTopMoves.has(key)) {
                console.log(
                  `Brute force top move missing from optimized: ${key}`,
                );
              }
            }
            for (const key of optimizedTopMoves) {
              if (!bruteTopMoves.has(key)) {
                console.log(
                  `Optimized top move missing from brute force: ${key}`,
                );
              }
            }

            expect(optimizedTopMoves).toEqual(bruteTopMoves);
          },
          30 * 60 * 1000,
        ); // 30 minute timeout
      }
    });
  }
});
