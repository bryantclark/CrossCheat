<script lang="ts">
	import Board from "$lib/components/Board.svelte";
	import Rack from "$lib/components/Rack.svelte";
	import Results from "$lib/components/Results.svelte";
	import { solve } from "$lib/solver";
	import { loadDictionary } from "$lib/solver/dictionary";
	import type { Move } from "$lib/solver/scorer";
	import type { Trie } from "$lib/solver/trie";
	import { onMount } from "svelte";
	import { fade, fly } from "svelte/transition";

	let board: string[][] = $state(
		Array(15)
			.fill(null)
			.map(() => Array(15).fill(" ")),
	);
	let rack = $state("");
	let trie: Trie | null = $state(null);
	let results: Move[] = $state([]);
	let loading = $state(true);
	let solving = $state(false);
	let previewMove: Move | null = $state(null);
	let leftColHeight = $state(0);
	let initialized = $state(false);

	// Derived state
	let isPreviewing = $derived(!!previewMove);
	let previewBoard = $derived(
		isPreviewing ? computePreview(board, previewMove!) : board,
	);

	// Load dictionary + restore localStorage
	onMount(async () => {
		try {
			const savedBoard = localStorage.getItem("crosscheat_board");
			const savedRack = localStorage.getItem("crosscheat_rack");
			if (savedBoard) board = JSON.parse(savedBoard);
			if (savedRack) rack = savedRack;
		} catch (_) {}
		initialized = true;

		trie = await loadDictionary();
		loading = false;
	});

	// Persist to localStorage
	$effect(() => {
		if (!initialized) return;
		localStorage.setItem("crosscheat_board", JSON.stringify(board));
		localStorage.setItem("crosscheat_rack", rack);
	});

	// Auto-solve with debounce — reacts to board AND rack changes
	let solveTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		// Read both board and rack so Svelte tracks them as dependencies
		const _boardSnapshot = JSON.stringify(board);
		const _rackSnapshot = rack;
		if (trie) {
			clearTimeout(solveTimer);
			solveTimer = setTimeout(handleSolve, 300);
		}
	});

	function handleSolve() {
		if (!trie) return;
		if (!rack) {
			results = [];
			return;
		}
		solving = true;
		results = solve(board, rack, trie).slice(0, 10);
		solving = false;
	}

	function handlePreview(move: Move | null) {
		previewMove = move;
	}

	function handleSelect(move: Move) {
		const { word, row, col, direction } = move;
		for (let i = 0; i < word.length; i++) {
			const r = direction === "V" ? row + i : row;
			const c = direction === "H" ? col + i : col;
			board[r][c] = word[i];
		}
		board = [...board];
		results = [];
		previewMove = null;
		rack = "";
	}

	function computePreview(baseBoard: string[][], move: Move): string[][] {
		const temp = baseBoard.map((row) => [...row]);
		const { word, row, col, direction } = move;
		for (let i = 0; i < word.length; i++) {
			const r = direction === "V" ? row + i : row;
			const c = direction === "H" ? col + i : col;
			if (temp[r][c] === " ") {
				temp[r][c] = word[i].toLowerCase();
			}
		}
		return temp;
	}

	function clearBoard() {
		for (let r = 0; r < 15; r++) {
			for (let c = 0; c < 15; c++) {
				board[r][c] = " ";
			}
		}
		rack = "";
		results = [];
		previewMove = null;
	}
</script>

<svelte:head>
	<title>CrossCheat Solver</title>
</svelte:head>

<main
	class="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 lg:p-6 flex flex-col items-center"
	in:fade={{ duration: 600 }}
>
	<header
		class="w-full max-w-7xl mb-6 flex items-center justify-between"
		in:fly={{ y: -20, duration: 800 }}
	>
		<div class="flex items-center gap-3">
			<a
				href="/"
				class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg hover:scale-105 transition-transform"
			>
				CC
			</a>
			<h1 class="text-3xl font-black tracking-tight text-slate-900">
				Cross<span class="text-orange-600">Cheat</span>
			</h1>
		</div>
		<div class="flex gap-4">
			{#if loading}
				<div class="flex items-center gap-2 text-slate-500">
					<div
						class="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
					></div>
					<span class="text-xs font-bold uppercase tracking-widest"
						>Loading…</span
					>
				</div>
			{:else}
				<div
					class="px-4 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 shadow-sm"
				>
					<div
						class="w-2 h-2 rounded-full {solving
							? 'bg-amber-400 animate-pulse'
							: 'bg-emerald-400'}"
					></div>
					{solving ? "Solving" : "Ready"}
				</div>
			{/if}
		</div>
	</header>

	<div
		class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-32 lg:pb-0"
	>
		<div class="lg:col-span-8 flex flex-col gap-4" in:fade={{ delay: 200 }}>
			<div
				class="bg-white p-2 md:p-5 rounded-3xl shadow-xl border border-slate-100 relative group overflow-hidden"
			>
				<div
					class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none hidden md:block"
				>
					<svg
						class="w-32 h-32"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div
					class="flex items-center justify-between mb-2 px-2 md:px-0"
				>
					<h3
						class="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2"
					>
						<span class="w-1.5 h-5 bg-orange-500 rounded-full"
						></span>
						Game Board
					</h3>
					<button
						onclick={clearBoard}
						class="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest border border-slate-200 px-2 py-1 rounded relative z-10 bg-white"
					>
						Clear
					</button>
				</div>

				<div class="justify-center flex overflow-hidden">
					<Board
						bind:board
						previewBoard={isPreviewing ? previewBoard : undefined}
					/>
				</div>

				<div
					class="mt-4 flex justify-between items-center text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 md:px-0"
				>
					<span class="hidden md:inline"
						>Use arrow keys to navigate</span
					>
					<span class="md:hidden">Tap cell to focus</span>
					<span>Type letters to place</span>
				</div>
			</div>

			<div class="hidden lg:block">
				<Rack bind:rack />
			</div>
		</div>

		<div class="lg:col-span-4 lg:sticky lg:top-6" in:fade={{ delay: 400 }}>
			<Results
				{results}
				onHover={handlePreview}
				onSelect={handleSelect}
			/>
		</div>
	</div>

	<!-- Mobile Sticky Rack -->
	<div
		class="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-50/80 backdrop-blur-xl border-t border-slate-200 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]"
	>
		<Rack bind:rack />
	</div>

	<footer
		class="mt-12 text-slate-400 text-xs font-medium uppercase tracking-[0.2em] pb-8"
	>
		© 2026 crosscheat • naspa nwl23 dictionary
	</footer>
</main>
