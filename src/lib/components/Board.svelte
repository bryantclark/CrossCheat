<script lang="ts">
	import type { GameConfig } from "$lib/solver/games";
	import { CROSSPLAY_CONFIG } from "$lib/solver/games";

	let {
		board = $bindable(
			Array(15)
				.fill(null)
				.map(() => Array(15).fill(" ")),
		),
		previewBoard = undefined,
		config = CROSSPLAY_CONFIG,
	}: {
		board: string[][];
		previewBoard: string[][] | undefined;
		config: GameConfig;
	} = $props();

	let displayBoard = $derived(previewBoard ?? board);

	// Focus management
	let focusedCell = $state({ r: -1, c: -1 });

	// Reset focus when config changes (center square might change)
	$effect(() => {
		focusedCell = {
			r: config.centerSquare[0],
			c: config.centerSquare[1],
		};
	});
	let boardContainer: HTMLElement;
	let inputRef: HTMLInputElement;

	function handleKeyDown(e: KeyboardEvent) {
		const { r, c } = focusedCell;

		if (e.key === "ArrowUp") {
			focusedCell = { r: Math.max(0, r - 1), c };
			e.preventDefault();
		} else if (e.key === "ArrowDown") {
			focusedCell = { r: Math.min(config.boardHeight - 1, r + 1), c };
			e.preventDefault();
		} else if (e.key === "ArrowLeft") {
			focusedCell = { r, c: Math.max(0, c - 1) };
			e.preventDefault();
		} else if (e.key === "ArrowRight") {
			focusedCell = { r, c: Math.min(config.boardWidth - 1, c + 1) };
			e.preventDefault();
		} else if (
			e.key === " " ||
			e.key === "Backspace" ||
			e.key === "Delete"
		) {
			board[r][c] = " ";
			e.preventDefault();
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const val = target.value.slice(-1);
		if (val.match(/[a-z]/i)) {
			board[focusedCell.r][focusedCell.c] = val.toUpperCase();

			// Only auto-advance on touch devices (mobile)
			const isTouch = window.matchMedia("(pointer: coarse)").matches;
			if (isTouch) {
				advanceFocus();
			}
		}
		target.value = ""; // Reset for next char
	}

	function advanceFocus() {
		const { r, c } = focusedCell;
		if (c < config.boardWidth - 1) {
			focusedCell = { r, c: c + 1 };
		} else if (r < config.boardHeight - 1) {
			focusedCell = { r: r + 1, c: 0 };
		}
	}

	function focusCell(r: number, c: number) {
		focusedCell = { r, c };
		inputRef?.focus();
	}

	const MULTIPLIER_STYLES: Record<string, string> = {
		TWS: "bg-purple-50 border-purple-100 text-purple-400",
		DWS: "bg-blue-50 border-blue-100 text-blue-400",
		TLS: "bg-emerald-50 border-emerald-100 text-emerald-400",
		DLS: "bg-amber-50 border-amber-100 text-amber-500",
		STP: "bg-white border-slate-200 text-slate-400",
	};

	function cellClass(r: number, c: number): string {
		const mult = config.boardMultipliers[r][c];
		const isFocused = focusedCell.r === r && focusedCell.c === c;

		return [
			"cell border flex items-center justify-center text-[8px] md:text-[10px] font-black transition-all cursor-pointer relative rounded-sm",
			MULTIPLIER_STYLES[mult] ||
				"bg-white border-slate-100 text-slate-300",
			isFocused ? "z-20 border-orange-500 ring-2 ring-orange-500/20" : "",
		].join(" ");
	}

	function isPreview(char: string): boolean {
		return char === char.toLowerCase() && char !== " ";
	}

	const LABEL_MAP: Record<string, string> = {
		TWS: "3W",
		DWS: "2W",
		TLS: "3L",
		DLS: "2L",
		STP: "SP",
	};

	function multLabel(r: number, c: number): string {
		const mult = config.boardMultipliers[r][c];
		return LABEL_MAP[mult] || "";
	}
</script>

<div class="relative w-full max-w-[min(90vw,540px)] aspect-square mx-auto">
	<!-- Hidden input for mobile keyboard -->
	<input
		bind:this={inputRef}
		type="text"
		class="absolute opacity-0 pointer-events-none"
		oninput={handleInput}
		onkeydown={handleKeyDown}
		aria-hidden="true"
	/>

	<div
		bind:this={boardContainer}
		class="grid gap-0 border-2 border-slate-300 shadow-xl rounded-lg overflow-hidden select-none outline-none transition-shadow h-full"
		tabindex="-1"
		role="grid"
		style="grid-template-columns: repeat({config.boardWidth}, 1fr); grid-template-rows: repeat({config.boardHeight}, 1fr);"
	>
		{#each displayBoard as row, r}
			{#each row as cell, c}
				<div
					class={cellClass(r, c)}
					onclick={() => focusCell(r, c)}
					onkeydown={(e) => e.key === "Enter" && focusCell(r, c)}
					role="gridcell"
					aria-selected={focusedCell.r === r && focusedCell.c === c}
					tabindex="-1"
					style="outline: none;"
				>
					{#if focusedCell.r === r && focusedCell.c === c}
						<div
							class="absolute inset-0 border-2 border-orange-500 animate-[pulse_1s_infinite] pointer-events-none z-30 rounded-sm shadow-[0_0_10px_rgba(249,115,22,0.5)]"
						></div>
					{/if}

					{#if cell !== " "}
						<div
							class="w-full h-full flex items-center justify-center rounded-sm shadow-sm border transition-all relative {isPreview(
								cell,
							)
								? 'bg-white/40 backdrop-blur-sm text-blue-600 border-blue-400/50 font-black scale-[0.85] shadow-none'
								: 'bg-orange-100 text-orange-900 border-orange-200'}"
						>
							<span class="text-[10px] md:text-xs uppercase"
								>{cell.toUpperCase()}</span
							>
							<span
								class="absolute bottom-0 right-0.5 text-[5px] md:text-[6px] font-bold opacity-70 leading-none pb-0.5"
							>
								{config.letterValues[cell.toUpperCase()] || 0}
							</span>
						</div>
					{:else if config.boardMultipliers[r][c] === "STP"}
						<span
							class="text-slate-400 text-lg md:text-xl drop-shadow-sm select-none"
							>★</span
						>
					{:else}
						<span class="opacity-30 text-[8px] md:text-[10px]"
							>{multLabel(r, c)}</span
						>
					{/if}
				</div>
			{/each}
		{/each}
	</div>
</div>

<style>
	.cell {
		width: 100%;
		height: 100%;
	}
</style>
