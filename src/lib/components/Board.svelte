<script lang="ts">
	import { BOARD_MULT, LETTER_VALUES } from "$lib/solver/constants";

	let {
		board = $bindable(
			Array(15)
				.fill(null)
				.map(() => Array(15).fill(" ")),
		),
		previewBoard = undefined as string[][] | undefined,
	} = $props();

	let displayBoard = $derived(previewBoard ?? board);

	let focusedCell = $state({ r: 7, c: 7 });
	let boardContainer: HTMLElement;
	let inputRef: HTMLInputElement;

	function handleKeyDown(e: KeyboardEvent) {
		const { r, c } = focusedCell;

		if (e.key === "ArrowUp") {
			focusedCell = { r: Math.max(0, r - 1), c };
			e.preventDefault();
		} else if (e.key === "ArrowDown") {
			focusedCell = { r: Math.min(14, r + 1), c };
			e.preventDefault();
		} else if (e.key === "ArrowLeft") {
			focusedCell = { r, c: Math.max(0, c - 1) };
			e.preventDefault();
		} else if (e.key === "ArrowRight") {
			focusedCell = { r, c: Math.min(14, c + 1) };
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
			advanceFocus();
		}
		target.value = ""; // Reset for next char
	}

	function advanceFocus() {
		const { r, c } = focusedCell;
		if (c < 14) {
			focusedCell = { r, c: c + 1 };
		} else if (r < 14) {
			focusedCell = { r: r + 1, c: 0 };
		}
	}

	function focusCell(r: number, c: number) {
		focusedCell = { r, c };
		inputRef?.focus();
	}

	function cellClass(r: number, c: number): string {
		const mult = BOARD_MULT[r][c];
		const isFocused = focusedCell.r === r && focusedCell.c === c;

		const base =
			"cell border flex items-center justify-center text-[8px] md:text-[10px] font-black transition-all cursor-pointer relative rounded-sm";

		let colors = "bg-white border-slate-100 text-slate-300";
		if (mult === "3W")
			colors = "bg-purple-50 border-purple-100 text-purple-400";
		else if (mult === "2W")
			colors = "bg-blue-50 border-blue-100 text-blue-400";
		else if (mult === "3L")
			colors = "bg-emerald-50 border-emerald-100 text-emerald-400";
		else if (mult === "2L")
			colors = "bg-amber-50 border-amber-100 text-amber-500";
		else if (mult === "ST")
			colors = "bg-white border-slate-200 text-slate-400";

		const focus = isFocused
			? "z-20 border-orange-500 ring-2 ring-orange-500/20"
			: "";

		return `${base} ${colors} ${focus}`;
	}

	function isPreview(char: string): boolean {
		return char === char.toLowerCase() && char !== " ";
	}

	function multLabel(r: number, c: number): string {
		const mult = BOARD_MULT[r][c];
		if (mult === "ST") return "SP";
		if (mult === "  ") return "";
		return mult;
	}
</script>

<div class="relative w-full max-w-[min(90vw,600px)] aspect-square mx-auto">
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
		class="grid grid-cols-15 gap-0 border-2 border-slate-300 shadow-xl rounded-lg overflow-hidden select-none outline-none transition-shadow h-full"
		tabindex="-1"
		role="grid"
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
								{LETTER_VALUES[cell.toUpperCase()] || 0}
							</span>
						</div>
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
	.grid-cols-15 {
		grid-template-columns: repeat(15, 1fr);
		grid-template-rows: repeat(15, 1fr);
	}
	.cell {
		width: 100%;
		height: 100%;
	}
</style>
