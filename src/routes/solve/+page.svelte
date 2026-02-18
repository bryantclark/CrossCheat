<script lang="ts">
	import { onMount, tick } from "svelte";
	import { fade } from "svelte/transition";
	import { Trie } from "$lib/solver/trie";
	import { solve } from "$lib/solver";
	import type { Move } from "$lib/solver/scorer";
	import { GAMES } from "$lib/solver/games";
	import Board from "$lib/components/Board.svelte";
	import Rack from "$lib/components/Rack.svelte";
	import BestMoves from "$lib/components/BestMoves.svelte";
	import GameToggle from "$lib/components/GameToggle.svelte";

	// State
	let selectedGameKey = $state("CrossPlay");
	let config = $derived(GAMES[selectedGameKey] || GAMES["CrossPlay"]);

	let board = $state(
		Array(15)
			.fill(null)
			.map(() => Array(15).fill(" ")),
	);
	let rack = $state("");
	let results = $state<Move[]>([]);
	let trie = $state<Trie | null>(null);
	let isSolving = $state(false);
	let previewMove = $state<Move | undefined>(undefined);

	// Persistence & Initialization
	onMount(async () => {
		// Load dictionary
		try {
			const resp = await fetch(
				"https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt",
			);
			const text = await resp.text();
			const words = text
				.split("\n")
				.map((w) => w.trim().toUpperCase())
				.filter(Boolean);
			const t = new Trie();
			words.forEach((w) => t.insert(w));
			trie = t;
		} catch (e) {
			console.error("Failed to load dictionary", e);
		}

		// Load saved state
		const savedGame = localStorage.getItem("selectedGame");
		if (savedGame && GAMES[savedGame]) {
			selectedGameKey = savedGame;
		}

		const savedBoard = localStorage.getItem(`board_${selectedGameKey}`);
		if (savedBoard) {
			try {
				const parsed = JSON.parse(savedBoard);
				if (
					Array.isArray(parsed) &&
					parsed.length === config.boardHeight &&
					parsed[0].length === config.boardWidth
				) {
					board = parsed;
				}
			} catch (e) {
				console.error("Failed to parse saved board", e);
			}
		}

		const savedRack = localStorage.getItem(`rack_${selectedGameKey}`);
		if (savedRack) rack = savedRack;
	});

	$effect(() => {
		if (selectedGameKey) {
			localStorage.setItem("selectedGame", selectedGameKey);
			// Reset board if dimensions change
			if (
				board.length !== config.boardHeight ||
				board[0].length !== config.boardWidth
			) {
				board = Array(config.boardHeight)
					.fill(null)
					.map(() => Array(config.boardWidth).fill(" "));
			}
		}
	});

	$effect(() => {
		localStorage.setItem(`board_${selectedGameKey}`, JSON.stringify(board));
	});

	$effect(() => {
		localStorage.setItem(`rack_${selectedGameKey}`, rack);
	});

	// Actions
	async function doSolve() {
		if (!trie || !rack) {
			results = [];
			return;
		}
		isSolving = true;
		await tick();
		try {
			const allResults = solve(board, rack, trie, config);
			results = allResults.slice(0, 10);
		} catch (e) {
			console.error("Solve failed", e);
		} finally {
			isSolving = false;
		}
	}

	// Auto-solve with debounce
	let solveTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		// These variables are accessed to ensure the effect re-runs when they change
		const _boardSnapshot = JSON.stringify(board);
		const _rackSnapshot = rack;
		const _gameSnapshot = selectedGameKey;
		if (trie) {
			clearTimeout(solveTimer);
			solveTimer = setTimeout(doSolve, 300);
		}
	});

	function applyMove(move: Move) {
		const newBoard = board.map((row) => [...row]);
		for (let i = 0; i < move.word.length; i++) {
			const r = move.direction === "V" ? move.row + i : move.row;
			const c = move.direction === "H" ? move.col + i : move.col;
			newBoard[r][c] = move.word[i];
		}
		board = newBoard;
		previewMove = undefined;

		// In a real app we'd auto-deduct from rack here, but keeping it simple for now
		doSolve();
	}

	function handleReset() {
		board = Array(config.boardHeight)
			.fill(null)
			.map(() => Array(config.boardWidth).fill(" "));
		results = [];
		previewMove = undefined;
		rack = "";
	}

	let previewBoard = $derived.by(() => {
		if (!previewMove) return undefined;
		const nb = board.map((row) => [...row]);
		for (let i = 0; i < previewMove.word.length; i++) {
			const r =
				previewMove.direction === "V"
					? previewMove.row + i
					: previewMove.row;
			const c =
				previewMove.direction === "H"
					? previewMove.col + i
					: previewMove.col;
			if (nb[r][c] === " ") nb[r][c] = previewMove.word[i].toLowerCase();
		}
		return nb;
	});
</script>

<svelte:head>
	<title>Solve {selectedGameKey} Puzzles - CrossCheat</title>
	<meta
		name="description"
		content="Use our high-performance solver to find the best moves for {selectedGameKey}. High-speed move generation using a trie-based algorithm."
	/>
</svelte:head>

<div
	class="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden"
>
	<!-- Top Bar -->
	<header
		class="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/80"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-2">
					<a
						href="/"
						data-testid="header-logo"
						class="text-2xl font-black text-orange-600 tracking-tighter hover:scale-105 transition-transform"
						>CROSSCHEAT</a
					>
				</div>

				<div class="flex items-center gap-6">
					{#if isSolving}
						<div
							data-testid="solving-indicator"
							class="flex items-center gap-2 text-slate-400"
							in:fade
						>
							<div
								class="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
							></div>
							<span
								class="text-[10px] font-black uppercase tracking-widest"
								>Solving</span
							>
						</div>
					{/if}
					{#if trie}
						<div data-testid="trie-loaded" class="hidden"></div>
					{/if}
					<button
						onclick={handleReset}
						class="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-red-100 hover:bg-red-50"
					>
						CLEAR BOARD
					</button>
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
		<!-- Cool Interactive Toggle Area -->
		<div class="mb-6 flex flex-col items-center gap-4">
			<div
				class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400"
			>
				Select Game Multiplier Rules
			</div>
			<GameToggle bind:selectedGameKey />
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
			<!-- Left: Board and Rack (lg:col-span-8) -->
			<div class="lg:col-span-8 space-y-4" in:fade={{ delay: 200 }}>
				<div
					class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center"
				>
					<Board bind:board {previewBoard} {config} />
					<div
						class="mt-4 flex justify-between w-full max-w-lg text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2"
					>
						<span>Use arrow keys to navigate</span>
						<span>Type letters to place</span>
					</div>
				</div>

				<Rack bind:rack {config} />
			</div>

			<!-- Right: Best Moves (lg:col-span-4) -->
			<div
				class="lg:col-span-4 lg:sticky lg:top-24 h-full"
				in:fade={{ delay: 400 }}
			>
				<BestMoves
					{results}
					onSelect={applyMove}
					onHover={(m: Move | null) => (previewMove = m ?? undefined)}
				/>
			</div>
		</div>
	</main>

	<footer
		class="py-12 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] border-t border-slate-100 mt-20"
	>
		© 2026 crosscheat • powered by enable1 dictionary
	</footer>
</div>

<style>
	:global(body) {
		background-color: #f8fafc;
	}
</style>
