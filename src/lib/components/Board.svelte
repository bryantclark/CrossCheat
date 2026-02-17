<script lang="ts">
	import { BOARD_MULT, LETTER_VALUES } from '$lib/solver/constants';

	let { board = $bindable(Array(15).fill(null).map(() => Array(15).fill(' '))), previewBoard = undefined as string[][] | undefined } = $props();

	let displayBoard = $derived(previewBoard ?? board);

	let focusedCell = $state({ r: 7, c: 7 });
	let boardContainer: HTMLElement;

	function handleKeyDown(e: KeyboardEvent) {
		const { r, c } = focusedCell;

		if (e.key === 'ArrowUp') {
			focusedCell = { r: Math.max(0, r - 1), c };
			e.preventDefault();
		} else if (e.key === 'ArrowDown') {
			focusedCell = { r: Math.min(14, r + 1), c };
			e.preventDefault();
		} else if (e.key === 'ArrowLeft') {
			focusedCell = { r, c: Math.max(0, c - 1) };
			e.preventDefault();
		} else if (e.key === 'ArrowRight') {
			focusedCell = { r, c: Math.min(14, c + 1) };
			e.preventDefault();
		} else if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Delete') {
			board[r][c] = ' ';
			e.preventDefault();
		} else if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
			board[r][c] = e.key.toUpperCase();
		}
	}

	function cellClass(r: number, c: number): string {
		const mult = BOARD_MULT[r][c];
		const isFocused = focusedCell.r === r && focusedCell.c === c;

		const base =
			'w-8 h-8 md:w-9 md:h-9 border flex items-center justify-center text-[10px] font-black transition-all cursor-pointer relative rounded-sm';

		let colors = 'bg-white border-slate-100 text-slate-300';
		if (mult === '3W') colors = 'bg-purple-50 border-purple-100 text-purple-400';
		else if (mult === '2W') colors = 'bg-blue-50 border-blue-100 text-blue-400';
		else if (mult === '3L') colors = 'bg-emerald-50 border-emerald-100 text-emerald-400';
		else if (mult === '2L') colors = 'bg-amber-50 border-amber-100 text-amber-500';
		else if (mult === 'ST') colors = 'bg-white border-slate-200 text-slate-400';

		const focus = isFocused ? 'z-20 border-orange-500 ring-2 ring-orange-500/20' : '';

		return `${base} ${colors} ${focus}`;
	}

	function isPreview(char: string): boolean {
		return char === char.toLowerCase() && char !== ' ';
	}

	function multLabel(r: number, c: number): string {
		const mult = BOARD_MULT[r][c];
		if (mult === 'ST') return 'SP';
		if (mult === '  ') return '';
		return mult;
	}
</script>

<div
	bind:this={boardContainer}
	class="grid grid-cols-15 gap-0 border-2 border-slate-300 shadow-xl rounded-lg overflow-hidden select-none outline-none transition-shadow"
	tabindex="0"
	role="grid"
	onkeydown={handleKeyDown}
>
	{#each displayBoard as row, r}
		{#each row as cell, c}
			<div
				class={cellClass(r, c)}
				onclick={() => (focusedCell = { r, c })}
				onkeydown={(e) => e.key === 'Enter' && (focusedCell = { r, c })}
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

				{#if cell !== ' '}
					<div
						class="w-full h-full flex items-center justify-center rounded-sm shadow-sm border transition-all relative {isPreview(
							cell
						)
							? 'bg-white/40 backdrop-blur-sm text-blue-600 border-blue-400/50 font-black scale-[0.85] shadow-none'
							: 'bg-orange-100 text-orange-900 border-orange-200'}"
					>
						<span class="text-xs uppercase">{cell.toUpperCase()}</span>
						<span
							class="absolute bottom-0 right-0.5 text-[6px] font-bold opacity-70 leading-none pb-0.5"
						>
							{LETTER_VALUES[cell.toUpperCase()] || 0}
						</span>
					</div>
				{:else}
					<span class="opacity-30 text-[10px]">{multLabel(r, c)}</span>
				{/if}
			</div>
		{/each}
	{/each}
</div>

<style>
	.grid-cols-15 {
		grid-template-columns: repeat(15, minmax(0, 1fr));
	}
</style>
