/**
 * Performance tests to ensure the solver completes in reasonable time
 * with edge-case rack compositions (multiple blanks).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { solve } from '../index';
import { loadTestDictionary, emptyBoard, placeWord } from './solverTestHelpers';
import type { TestDictionary } from './solverTestHelpers';

let td: TestDictionary;

beforeAll(async () => {
    td = await loadTestDictionary();
}, 60_000);

describe('solver performance with blanks', () => {
    it('solves with 2 blanks in under 5 seconds', () => {
        const board = emptyBoard();
        placeWord(board, 'CATS', 7, 5, 'H');
        placeWord(board, 'BAKE', 5, 7, 'V');

        const start = performance.now();
        const results = solve(board, '??RSTLN', td.trie);
        const elapsed = performance.now() - start;

        console.log(`2 blanks: ${results.length} moves in ${elapsed.toFixed(0)}ms`);
        expect(elapsed).toBeLessThan(5_000);
        expect(results.length).toBeGreaterThan(0);
    });

    it('solves with all blanks in under 5 seconds', () => {
        const board = emptyBoard();
        placeWord(board, 'CATS', 7, 5, 'H');
        placeWord(board, 'BAKE', 5, 7, 'V');

        const start = performance.now();
        const results = solve(board, '???????', td.trie);
        const elapsed = performance.now() - start;

        console.log(`7 blanks: ${results.length} moves in ${elapsed.toFixed(0)}ms`);
        expect(elapsed).toBeLessThan(5_000);
        expect(results.length).toBeGreaterThan(0);
    });

    it('solves on empty board with blanks in under 5 seconds', () => {
        const board = emptyBoard();

        const start = performance.now();
        const results = solve(board, '??ABCDE', td.trie);
        const elapsed = performance.now() - start;

        console.log(`Empty board + 2 blanks: ${results.length} moves in ${elapsed.toFixed(0)}ms`);
        expect(elapsed).toBeLessThan(5_000);
        expect(results.length).toBeGreaterThan(0);
    });

    it('solves on dense board with blanks in under 5 seconds', () => {
        const board = emptyBoard();
        placeWord(board, 'WATER', 7, 5, 'H');
        placeWord(board, 'TOWER', 5, 7, 'V');
        placeWord(board, 'STONE', 9, 6, 'H');
        placeWord(board, 'GRAIN', 4, 9, 'V');
        placeWord(board, 'PLANE', 3, 5, 'H');

        const start = performance.now();
        const results = solve(board, '??AEIOU', td.trie);
        const elapsed = performance.now() - start;

        console.log(`Dense board + 2 blanks: ${results.length} moves in ${elapsed.toFixed(0)}ms`);
        expect(elapsed).toBeLessThan(5_000);
        expect(results.length).toBeGreaterThan(0);
    });
});
