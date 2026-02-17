import urllib.request
import time

# ── Config ─────────────────────────────────────────────────────

LETTER_VALUES = {
    'A':1,'B':4,'C':3,'D':2,'E':1,'F':4,'G':4,'H':3,'I':1,'J':10,'K':6,'L':2,'M':3,
    'N':1,'O':1,'P':3,'Q':10,'R':1,'S':1,'T':1,'U':2,'V':6,'W':5,'X':8,'Y':4,'Z':10,
    '_':0,' ':0,'?':0
}

BOARD_MULT = [
    ['3L','  ','  ','3W','  ','  ','  ','2L','  ','  ','  ','3W','  ','  ','3L'],
    ['  ','2W','  ','  ','  ','  ','3L','  ','3L','  ','  ','  ','  ','2W','  '],
    ['  ','  ','  ','  ','2L','  ','  ','  ','  ','  ','2L','  ','  ','  ','  '],
    ['3W','  ','  ','2L','  ','  ','  ','2W','  ','  ','  ','2L','  ','  ','3W'],
    ['  ','  ','2L','  ','  ','3L','  ','  ','  ','3L','  ','  ','2L','  ','  '],
    ['  ','  ','  ','  ','3L','  ','  ','2L','  ','  ','3L','  ','  ','  ','  '],
    ['  ','3L','  ','  ','  ','  ','  ','  ','  ','  ','  ','  ','  ','3L','  '],
    ['2L','  ','  ','2W','  ','2L','  ','ST','  ','2L','  ','2W','  ','  ','2L'],
    ['  ','3L','  ','  ','  ','  ','  ','  ','  ','  ','  ','  ','  ','3L','  '],
    ['  ','  ','  ','  ','3L','  ','  ','2L','  ','  ','3L','  ','  ','  ','  '],
    ['  ','  ','2L','  ','  ','3L','  ','  ','  ','3L','  ','  ','2L','  ','  '],
    ['3W','  ','  ','2L','  ','  ','  ','2W','  ','  ','  ','2L','  ','  ','3W'],
    ['  ','  ','  ','  ','2L','  ','  ','  ','  ','  ','2L','  ','  ','  ','  '],
    ['  ','2W','  ','  ','  ','  ','3L','  ','3L','  ','  ','  ','  ','2W','  '],
    ['3L','  ','  ','3W','  ','  ','  ','2L','  ','  ','  ','3W','  ','  ','3L']
]

# ── Trie + Dictionary ──────────────────────────────────────────

class TrieNode:
    __slots__ = ['ch', 'term']
    def __init__(self):
        self.ch = {}
        self.term = False

TRIE = TrieNode()
WORDS = set()

print("Downloading dictionary...")
for w in urllib.request.urlopen(
    "https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt"
).read().decode('utf-8').splitlines():
    word = w.strip().upper()
    WORDS.add(word)
    n = TRIE
    for c in word:
        if c not in n.ch:
            n.ch[c] = TrieNode()
        n = n.ch[c]
    n.term = True
print(f"Dictionary loaded ({len(WORDS)} words).")

# ── Helpers ────────────────────────────────────────────────────

def apply_mult(val, code):
    m = code.strip()
    if m in ('2L','DL'): return val * 2, 1
    if m in ('3L','TL'): return val * 3, 1
    if m in ('2W','DW'): return val, 2
    if m in ('3W','TW'): return val, 3
    return val, 1

# ── Cross-check: which letters are legal at each empty square ──

def compute_cross_sets(board):
    """For direction d='H', compute which letters can go in each empty square
    based on the vertical words they'd form (and vice versa for d='V')."""
    ALL = frozenset("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    h_ok = [[ALL]*15 for _ in range(15)]  # constraints when placing horizontally
    v_ok = [[ALL]*15 for _ in range(15)]  # constraints when placing vertically

    for r in range(15):
        for c in range(15):
            if board[r][c] != ' ':
                continue

            # Vertical neighbors constrain horizontal placements
            above = r > 0 and board[r-1][c] != ' '
            below = r < 14 and board[r+1][c] != ' '
            if above or below:
                top = r
                while top > 0 and board[top-1][c] != ' ': top -= 1
                bot = r
                while bot < 14 and board[bot+1][c] != ' ': bot += 1
                prefix = ''.join(board[k][c] for k in range(top, r))
                suffix = ''.join(board[k][c] for k in range(r+1, bot+1))
                valid = set()
                for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
                    cand = prefix + ch + suffix
                    n = TRIE
                    ok = True
                    for x in cand:
                        if x not in n.ch: ok = False; break
                        n = n.ch[x]
                    if ok and n.term:
                        valid.add(ch)
                h_ok[r][c] = frozenset(valid)

            # Horizontal neighbors constrain vertical placements
            left = c > 0 and board[r][c-1] != ' '
            right = c < 14 and board[r][c+1] != ' '
            if left or right:
                lft = c
                while lft > 0 and board[r][lft-1] != ' ': lft -= 1
                rgt = c
                while rgt < 14 and board[r][rgt+1] != ' ': rgt += 1
                prefix = ''.join(board[r][k] for k in range(lft, c))
                suffix = ''.join(board[r][k] for k in range(c+1, rgt+1))
                valid = set()
                for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
                    cand = prefix + ch + suffix
                    n = TRIE
                    ok = True
                    for x in cand:
                        if x not in n.ch: ok = False; break
                        n = n.ch[x]
                    if ok and n.term:
                        valid.add(ch)
                v_ok[r][c] = frozenset(valid)

    return h_ok, v_ok

# ── Scoring (battle-tested brute-force scorer) ─────────────────

def score_move(board, word, sr, sc, d, rack, has_tiles):
    tiles = list(rack)
    score, wmult, placed, xscore, connects = 0, 1, 0, 0, False

    for i, ch in enumerate(word):
        r = sr + i if d == 'V' else sr
        c = sc + i if d == 'H' else sc
        if board[r][c] != ' ':
            if board[r][c] != ch: return None
            connects = True
            score += LETTER_VALUES.get(ch, 0)
        else:
            placed += 1
            blank = False
            if ch in tiles:
                tiles.remove(ch)
                val = LETTER_VALUES.get(ch, 0)
            elif ' ' in tiles:
                tiles.remove(' '); val = 0; blank = True
            else:
                return None
            val, wm = apply_mult(val, BOARD_MULT[r][c])
            wmult *= wm; score += val

            # Cross-word score
            perp = 'V' if d == 'H' else 'H'
            dr2, dc2 = (1, 0) if perp == 'V' else (0, 1)
            n1r, n1c = r - dr2, c - dc2
            n2r, n2c = r + dr2, c + dc2
            has_n = (0 <= n1r < 15 and 0 <= n1c < 15 and board[n1r][n1c] != ' ') or \
                    (0 <= n2r < 15 and 0 <= n2c < 15 and board[n2r][n2c] != ' ')
            if has_n:
                tr, tc = r, c
                while tr-dr2 >= 0 and tc-dc2 >= 0 and board[tr-dr2][tc-dc2] != ' ':
                    tr -= dr2; tc -= dc2
                cw, cs, cm = "", 0, 1
                cr2, cc2 = tr, tc
                while 0 <= cr2 < 15 and 0 <= cc2 < 15 and (board[cr2][cc2] != ' ' or (cr2==r and cc2==c)):
                    x = ch if (cr2==r and cc2==c) else board[cr2][cc2]
                    v2 = 0 if (cr2==r and cc2==c and blank) else LETTER_VALUES.get(x, 0)
                    if cr2==r and cc2==c:
                        v2, wm2 = apply_mult(v2, BOARD_MULT[r][c]); cm *= wm2
                    cs += v2; cw += x
                    cr2 += dr2; cc2 += dc2
                if len(cw) > 1:
                    if cw not in WORDS: return None
                    xscore += cs * cm

    if placed == 0: return None
    if has_tiles and not connects and xscore == 0: return None

    # No extending tiles before/after
    br = sr - 1 if d == 'V' else sr
    bc = sc - 1 if d == 'H' else sc
    if 0 <= br < 15 and 0 <= bc < 15 and board[br][bc] != ' ': return None
    ar = sr + len(word) if d == 'V' else sr
    ac = sc + len(word) if d == 'H' else sc
    if 0 <= ar < 15 and 0 <= ac < 15 and board[ar][ac] != ' ': return None

    return score * wmult + xscore + (40 if placed == 7 else 0)

# ── Trie Line Scanner ─────────────────────────────────────────
#
# For each of 30 lines (15 rows H + 15 cols V), we do a single
# recursive Trie walk from every valid start position. The walk
# follows existing tiles for free and places rack tiles on empties.
# Cross-checks prune bad perpendicular words instantly.

def solve(board, rack_str):
    print_board(board, "Solving... verify your board:")
    print(f"Rack: [{rack_str}]")
    t0 = time.time()

    rack = list(rack_str.upper().replace('?', ' '))
    has_tiles = any(board[r][c] != ' ' for r in range(15) for c in range(15))
    h_ok, v_ok = compute_cross_sets(board)

    results = []
    seen = set()

    def scan_line(d):
        """Scan all 15 lines in direction d."""
        cross = h_ok if d == 'H' else v_ok

        for line in range(15):
            # Extract the 15-cell line and its cross-check sets
            if d == 'H':
                cells = [board[line][i] for i in range(15)]
                csets = [cross[line][i] for i in range(15)]
            else:
                cells = [board[i][line] for i in range(15)]
                csets = [cross[i][line] for i in range(15)]

            # Find which positions along this line are "interesting"
            # (adjacent to an existing tile in ANY direction, or center on empty board)
            touches = set()
            for i in range(15):
                if d == 'H':
                    r, c = line, i
                else:
                    r, c = i, line
                if board[r][c] != ' ':
                    # Occupied square + neighbors along the line
                    touches.add(i)
                    if i > 0 and cells[i-1] == ' ': touches.add(i-1)
                    if i < 14 and cells[i+1] == ' ': touches.add(i+1)
                else:
                    # Empty square with perpendicular neighbors (cross-word anchors)
                    if d == 'H':
                        if (r > 0 and board[r-1][c] != ' ') or (r < 14 and board[r+1][c] != ' '):
                            touches.add(i)
                    else:
                        if (c > 0 and board[r][c-1] != ' ') or (c < 14 and board[r][c+1] != ' '):
                            touches.add(i)
            if not has_tiles:
                touches.add(7)

            if not touches:
                continue

            min_touch = min(touches)
            max_touch = max(touches)

            def walk(pos, node, word, tiles, placed):
                """Walk forward from pos, building a word along the Trie."""
                # Record valid words
                if node.term and placed > 0 and len(word) >= 2:
                    # Check: word must touch an existing tile or cross-word
                    # and no tile extends beyond the end
                    if pos <= 14 and cells[pos] != ' ':
                        pass  # extending tile exists — invalid end
                    else:
                        start = pos - len(word)
                        if d == 'H':
                            sr, sc = line, start
                        else:
                            sr, sc = start, line
                        key = (''.join(word), sr, sc, d)
                        if key not in seen:
                            seen.add(key)
                            s = score_move(board, ''.join(word), sr, sc, d, rack, has_tiles)
                            if s is not None:
                                results.append({'score': s, 'word': ''.join(word),
                                                'r': sr, 'c': sc, 'dir': d, '_rack': rack[:]})

                if pos > 14:
                    return

                if cells[pos] != ' ':
                    # Existing tile — follow in Trie for free
                    ch = cells[pos]
                    if ch in node.ch:
                        word.append(ch)
                        walk(pos + 1, node.ch[ch], word, tiles, placed)
                        word.pop()
                else:
                    # Empty — try placing from rack
                    # But don't keep extending into empty space beyond useful range
                    if pos > max_touch + len(tiles):
                        return

                    allowed = csets[pos]
                    tried = set()
                    for idx in range(len(tiles)):
                        t = tiles[idx]
                        rest = tiles[:idx] + tiles[idx+1:]
                        if t == ' ':
                            # Blank
                            for ch in node.ch:
                                if ch not in allowed:
                                    continue
                                word.append(ch)
                                walk(pos + 1, node.ch[ch], word, rest, placed + 1)
                                word.pop()
                            break
                        else:
                            if t in tried: continue
                            tried.add(t)
                            if t not in node.ch: continue
                            if t not in allowed: continue
                            word.append(t)
                            walk(pos + 1, node.ch[t], word, rest, placed + 1)
                            word.pop()

            # Find all valid start positions along this line
            # A word can start at any position from which it could reach a touch point
            # Start positions: anywhere from (min_touch - rack_len) to max_touch
            earliest = max(0, min_touch - len(rack))
            for start in range(earliest, min(max_touch + 1, 15)):
                # Don't start in the middle of an existing word
                if start > 0 and cells[start - 1] != ' ':
                    continue
                walk(start, TRIE, [], rack, 0)

    scan_line('H')
    scan_line('V')

    elapsed = time.time() - t0
    print(f"Found {len(results)} moves in {elapsed:.2f}s")

    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:5]

# ── Board Display ──────────────────────────────────────────────

def print_board(board, title="CURRENT BOARD"):
    print(f"\n--- {title} ---")
    print("    " + "".join(f"{x:^3}" for x in range(15)))
    print("   +" + "-" * 45)
    for i, row in enumerate(board):
        cells = [f" {c} " if c != ' ' else ' . ' for c in row]
        print(f"{i:<2} |" + "".join(cells))

# ── Score Breakdown ────────────────────────────────────────────

def explain_score(board, move):
    word, r, c, d = move['word'], move['r'], move['c'], move['dir']
    main_parts, cross_parts = [], []
    main_score, wmult, tiles_placed = 0, 1, 0

    def _rc(i):
        return (r+i, c) if d == 'V' else (r, c+i)

    rack = list(move.get('_rack', []))
    blanks = set()
    for i, ch in enumerate(word):
        pr, pc = _rc(i)
        if board[pr][pc] == ' ':
            if ch in rack: rack.remove(ch)
            else: blanks.add((pr, pc))

    for i, ch in enumerate(word):
        pr, pc = _rc(i)
        if board[pr][pc] != ' ':
            val = LETTER_VALUES.get(ch, 0)
            main_parts.append(f"{ch}({val})")
            main_score += val
        else:
            tiles_placed += 1
            is_blank = (pr, pc) in blanks
            val = 0 if is_blank else LETTER_VALUES.get(ch, 0)
            adj_val, wm = apply_mult(val, BOARD_MULT[pr][pc])
            wmult *= wm
            if is_blank: label = f"{ch}(blank=0)"
            elif adj_val != val: label = f"{ch}({val}x{adj_val // val})"
            else: label = f"{ch}({val})"
            main_parts.append(label)
            main_score += adj_val

            perp = 'H' if d == 'V' else 'V'
            dr2, dc2 = (0,1) if perp == 'H' else (1,0)
            n1r, n1c = pr-dr2 if perp=='V' else pr, pc-dc2 if perp=='H' else pc
            # Simplified: just check score_move's cross logic
            xs = 0
            nd1r, nd1c = pr - (1 if perp=='V' else 0), pc - (1 if perp=='H' else 0)
            nd2r, nd2c = pr + (1 if perp=='V' else 0), pc + (1 if perp=='H' else 0)
            has_n = (0<=nd1r<15 and 0<=nd1c<15 and board[nd1r][nd1c]!=' ') or \
                    (0<=nd2r<15 and 0<=nd2c<15 and board[nd2r][nd2c]!=' ')
            if has_n:
                ddr, ddc = (1,0) if perp=='V' else (0,1)
                tr, tc = pr, pc
                while tr-ddr>=0 and tc-ddc>=0 and board[tr-ddr][tc-ddc]!=' ':
                    tr-=ddr; tc-=ddc
                cs, cm = 0, 1
                cr2, cc2 = tr, tc
                while 0<=cr2<15 and 0<=cc2<15 and (board[cr2][cc2]!=' ' or (cr2==pr and cc2==pc)):
                    x = ch if (cr2==pr and cc2==pc) else board[cr2][cc2]
                    v2 = 0 if (cr2==pr and cc2==pc and is_blank) else LETTER_VALUES.get(x,0)
                    if cr2==pr and cc2==pc:
                        v2, wm2 = apply_mult(v2, BOARD_MULT[pr][pc]); cm*=wm2
                    cs+=v2; cr2+=ddr; cc2+=ddc
                xs = cs * cm
                if xs > 0:
                    cross_parts.append(f"  + Crossword at ({pr},{pc}): {xs} pts")

    main_total = main_score * wmult
    bingo = 40 if tiles_placed == 7 else 0
    cross_total = sum(int(cp.split(': ')[1].split(' ')[0]) for cp in cross_parts)
    grand = main_total + cross_total + bingo

    mult_str = f" x {wmult}" if wmult > 1 else ""
    print(f"\n  Main '{word}': ({' + '.join(main_parts)}){mult_str} = {main_total} pts")
    for cp in cross_parts: print(cp)
    if bingo: print(f"  + BINGO BONUS: {bingo} pts")
    print(f"  {'─' * 28}\n  TOTAL: {grand} points\n  {'─' * 28}")

# ── Solution Display ───────────────────────────────────────────

def show_solution(board, move):
    temp = [row[:] for row in board]
    r, c, d = move['r'], move['c'], move['dir']
    for i, ch in enumerate(move['word']):
        pr = r+i if d=='V' else r
        pc = c+i if d=='H' else c
        temp[pr][pc] = f"[{ch}]" if board[pr][pc] == ' ' else f" {ch} "

    print(f"\n=== {move['word']} | Score: {move['score']} | ({r},{c}) {d} ===")
    explain_score(board, move)
    print("    " + "".join(f"{x:^3}" for x in range(15)))
    print("   +" + "-" * 45)
    for i, row in enumerate(temp):
        cells = [c if len(c) > 1 else (' . ' if c == ' ' else f" {c} ") for c in row]
        print(f"{i:<2} |" + "".join(cells))

# ── Play ───────────────────────────────────────────────────────

def play(words, rack):
    board = [[' '] * 15 for _ in range(15)]
    for word, r, c, d in words:
        for i, ch in enumerate(word.upper()):
            pr = r+i if d=='V' else r
            pc = c+i if d=='H' else c
            board[pr][pc] = ch
    for move in solve(board, rack):
        show_solution(board, move)


# Example usage
words = [
        ("FOEMEN",7, 7,"H"),
        ("SODOMIZE",3, 10,"V"),
        ("SIBYL",3, 10,"H"),
        ("TWEAKED",11, 4,"H"),
        ("QUEY",0, 13,"V"),
        ("FOOTY",4, 8,"H"),
        ("HEIRS",10, 9,"H"),
        ("HALUTZ", 9, 5, "H"),
        ("OP", 10, 5, "H"),

  ]

rack = "OAEUIGR"

play(words, rack)