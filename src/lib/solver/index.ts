import { Trie, type TrieNode } from './trie';
import { scoreMove, type Move, type Direction } from './scorer';

export function computeCrossSets(board: string[][], trie: Trie, direction: Direction): Set<string>[][] {
    const result: Set<string>[][] = Array(15).fill(null).map(() =>
        Array(15).fill(null).map(() => new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ'))
    );

    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            if (board[r][c] !== ' ') continue;

            const perp: Direction = direction === 'H' ? 'V' : 'H';
            const dr = perp === 'V' ? 1 : 0;
            const dc = perp === 'H' ? 1 : 0;

            const n1r = r - dr;
            const n1c = c - dc;
            const n2r = r + dr;
            const n2c = c + dc;

            const hasNeighbor =
                (n1r >= 0 && n1r < 15 && n1c >= 0 && n1c < 15 && board[n1r][n1c] !== ' ') ||
                (n2r >= 0 && n2r < 15 && n2c >= 0 && n2c < 15 && board[n2r][n2c] !== ' ');

            if (hasNeighbor) {
                let tr = r;
                let tc = c;
                while (tr - dr >= 0 && tc - dc >= 0 && board[tr - dr][tc - dc] !== ' ') {
                    tr -= dr;
                    tc -= dc;
                }

                let prefix = '';
                let cr = tr;
                let cc = tc;
                while (cr >= 0 && cr < 15 && cc >= 0 && cc < 15 && board[cr][cc] !== ' ' && (cr !== r || cc !== c)) {
                    prefix += board[cr][cc];
                    cr += dr;
                    cc += dc;
                }
                cr = r + dr;
                cc = c + dc;
                let suffix = '';
                while (cr >= 0 && cr < 15 && cc >= 0 && cc < 15 && board[cr][cc] !== ' ') {
                    suffix += board[cr][cc];
                    cr += dr;
                    cc += dc;
                }

                const valid = new Set<string>();
                for (const char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
                    if (trie.contains(prefix + char + suffix)) {
                        valid.add(char);
                    }
                }
                result[r][c] = valid;
            }
        }
    }
    return result;
}

export function solve(board: string[][], rackStr: string, trie: Trie): Move[] {
    const rack = rackStr.toUpperCase().replace(/\?/g, ' ').split('');
    const hasTiles = board.some(row => row.some(cell => cell !== ' '));

    const hOk = computeCrossSets(board, trie, 'H');
    const vOk = computeCrossSets(board, trie, 'V');

    const results: Move[] = [];
    const seen = new Set<string>();

    const scan = (d: Direction) => {
        const cross = d === 'H' ? hOk : vOk;

        for (let line = 0; line < 15; line++) {
            const cells = d === 'H' ? board[line] : board.map(row => row[line]);

            const touches = new Set<number>();
            for (let i = 0; i < 15; i++) {
                const r = d === 'H' ? line : i;
                const c = d === 'H' ? i : line;
                if (board[r][c] !== ' ') {
                    touches.add(i);
                    if (i > 0 && cells[i - 1] === ' ') touches.add(i - 1);
                    if (i < 14 && cells[i + 1] === ' ') touches.add(i + 1);
                } else {
                    const pr2 = d === 'H' ? 1 : 0;
                    const pc2 = d === 'H' ? 0 : 1;
                    if ((r - pr2 >= 0 && r - pr2 < 15 && c - pc2 >= 0 && c - pc2 < 15 && board[r - pr2][c - pc2] !== ' ') ||
                        (r + pr2 >= 0 && r + pr2 < 15 && c + pc2 >= 0 && c + pc2 < 15 && board[r + pr2][c + pc2] !== ' ')) {
                        touches.add(i);
                    }
                }
            }
            if (!hasTiles) touches.add(7);
            if (touches.size === 0) continue;

            const minT = Math.min(...touches);
            const maxT = Math.max(...touches);

            const walk = (pos: number, node: TrieNode, word: string[], tiles: string[], placed: number) => {
                if (node.isTerminal && placed > 0 && word.length >= 2) {
                    if (pos > 14 || cells[pos] === ' ') {
                        const start = pos - word.length;
                        const r = d === 'H' ? line : start;
                        const c = d === 'H' ? start : line;
                        const wordStr = word.join('');
                        const key = `${wordStr}-${r}-${c}-${d}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            const score = scoreMove(board, wordStr, r, c, d, rack, trie, !hasTiles);
                            if (score !== null) {
                                results.push({ word: wordStr, row: r, col: c, direction: d, score });
                            }
                        }
                    }
                }

                if (pos > 14) return;

                if (cells[pos] !== ' ') {
                    const char = cells[pos];
                    if (node.children[char]) {
                        word.push(char);
                        walk(pos + 1, node.children[char], word, tiles, placed);
                        word.pop();
                    }
                } else {
                    if (placed === 0 && pos > maxT + tiles.length) return;

                    const r = d === 'H' ? line : pos;
                    const c = d === 'H' ? pos : line;
                    const allowed = cross[r][c];
                    const tried = new Set<string>();

                    // Pass 1: regular tiles — using a real tile is always
                    // preferable because it keeps blanks free for later.
                    for (let i = 0; i < tiles.length; i++) {
                        const t = tiles[i];
                        if (t === ' ') continue;
                        if (tried.has(t)) continue;
                        tried.add(t);
                        if (node.children[t] && allowed.has(t)) {
                            const rest = [...tiles.slice(0, i), ...tiles.slice(i + 1)];
                            word.push(t);
                            walk(pos + 1, node.children[t], word, rest, placed + 1);
                            word.pop();
                        }
                    }

                    // Pass 2: one blank — try only letters not already
                    // covered by a regular tile (those paths already
                    // explored above with the blank still in rest).
                    // Only one blank needs processing per position:
                    // duplicate blanks produce identical rest arrays.
                    for (let i = 0; i < tiles.length; i++) {
                        if (tiles[i] !== ' ') continue;
                        const rest = [...tiles.slice(0, i), ...tiles.slice(i + 1)];
                        for (const char in node.children) {
                            if (allowed.has(char) && !tried.has(char)) {
                                word.push(char);
                                walk(pos + 1, node.children[char], word, rest, placed + 1);
                                word.pop();
                            }
                        }
                        break; // all blanks are interchangeable at this position
                    }
                }
            };

            const earliest = Math.max(0, minT - rack.length);
            for (let start = earliest; start <= Math.min(maxT, 14); start++) {
                if (start > 0 && cells[start - 1] !== ' ') continue;
                walk(start, trie.root, [], rack, 0);
            }
        }
    };

    scan('H');
    scan('V');

    return results.sort((a, b) => b.score - a.score);
}
