/**
 * Performance tests to ensure the solver completes in reasonable time
 * with edge-case rack compositions (multiple blanks).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { solve } from "../index";
import { loadTestDictionary, emptyBoard, placeWord } from "./solverTestHelpers";
import { GAMES } from "../games";
import type { TestDictionary } from "./solverTestHelpers";

const CROSSPLAY_CONFIG = GAMES["CrossPlay"];

let td: TestDictionary;

beforeAll(async () => {
  td = await loadTestDictionary();
}, 60_000);

describe("solver performance with blanks", () => {
  it("solves with 2 blanks in under 5 seconds", () => {
    const board = emptyBoard(CROSSPLAY_CONFIG);
    placeWord(board, "CATS", 7, 5, "H", CROSSPLAY_CONFIG);
    placeWord(board, "BAKE", 5, 7, "V", CROSSPLAY_CONFIG);

    const start = performance.now();
    const results = solve(board, "??RSTLN", td.trie, CROSSPLAY_CONFIG);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5_000);
    expect(results.length).toBeGreaterThan(0);
  });

  it("solves with all blanks in under 5 seconds", () => {
    const board = emptyBoard(CROSSPLAY_CONFIG);
    placeWord(board, "CATS", 7, 5, "H", CROSSPLAY_CONFIG);
    placeWord(board, "BAKE", 5, 7, "V", CROSSPLAY_CONFIG);

    const start = performance.now();
    const results = solve(board, "???????", td.trie, CROSSPLAY_CONFIG);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5_000);
    expect(results.length).toBeGreaterThan(0);
  });

  it("solves on empty board with blanks in under 5 seconds", () => {
    const board = emptyBoard(CROSSPLAY_CONFIG);

    const start = performance.now();
    const results = solve(board, "??ABCDE", td.trie, CROSSPLAY_CONFIG);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5_000);
    expect(results.length).toBeGreaterThan(0);
  });

  it("solves on dense board with blanks in under 5 seconds", () => {
    const board = emptyBoard(CROSSPLAY_CONFIG);
    placeWord(board, "WATER", 7, 5, "H", CROSSPLAY_CONFIG);
    placeWord(board, "TOWER", 5, 7, "V", CROSSPLAY_CONFIG);
    placeWord(board, "STONE", 9, 6, "H", CROSSPLAY_CONFIG);
    placeWord(board, "GRAIN", 4, 9, "V", CROSSPLAY_CONFIG);
    placeWord(board, "PLANE", 3, 5, "H", CROSSPLAY_CONFIG);

    const start = performance.now();
    const results = solve(board, "??AEIOU", td.trie, CROSSPLAY_CONFIG);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5_000);
    expect(results.length).toBeGreaterThan(0);
  });
});
