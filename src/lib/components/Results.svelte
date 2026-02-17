<script lang="ts">
	import type { Move } from '$lib/solver/scorer';

	let { results = [], onHover, onSelect }: {
		results: Move[];
		onHover: (move: Move | null) => void;
		onSelect: (move: Move) => void;
	} = $props();

	function formatPosition(move: Move): string {
		return `(${move.row}, ${move.col}) ${move.direction === 'H' ? 'Across' : 'Down'}`;
	}
</script>

<div class="flex flex-col gap-4 p-5 bg-slate-900 text-white rounded-2xl border border-slate-700/80 shadow-2xl h-full overflow-hidden">
	<div class="flex items-center justify-between border-b border-slate-700/50 pb-3">
		<h2 class="text-lg font-black tracking-tight">Best Moves</h2>
		<span class="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
			{results.length} found
		</span>
	</div>

	{#if results.length === 0}
		<div class="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 gap-3">
			<svg class="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
			</svg>
			<p class="text-sm font-medium">No moves found yet</p>
			<p class="text-xs text-slate-600">Place tiles on the board and enter your rack</p>
		</div>
	{:else}
		<div class="flex-1 overflow-y-auto pr-1 custom-scrollbar">
			<div class="flex flex-col gap-2.5">
				{#each results as move, i}
					<button
						class="group flex items-center justify-between p-3.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700/50 hover:border-orange-500/40 transition-all text-left hover:scale-[1.01] active:scale-[0.99]"
						onmouseenter={() => onHover(move)}
						onmouseleave={() => onHover(null)}
						onclick={() => onSelect(move)}
					>
						<div class="flex flex-col gap-0.5">
							<span class="text-orange-400 text-[10px] font-bold uppercase tracking-widest">
								#{i + 1}
							</span>
							<span class="text-xl font-black text-white group-hover:text-orange-300 transition-colors uppercase tracking-wide">
								{move.word}
							</span>
							<span class="text-slate-500 text-[10px] font-medium">{formatPosition(move)}</span>
						</div>
						<div class="bg-gradient-to-br from-orange-500 to-orange-700 px-3.5 py-1.5 rounded-lg font-black text-lg shadow-lg group-hover:scale-110 transition-transform min-w-[3rem] text-center">
							{move.score}
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #334155;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #475569;
	}
</style>
