<script lang="ts">
	import type { Move } from "$lib/solver/scorer";

	let {
		results = [],
		onHover,
		onSelect,
	}: {
		results: Move[];
		onHover: (move: Move | null) => void;
		onSelect: (move: Move) => void;
	} = $props();

	function formatPosition(move: Move): string {
		return `(${move.row}, ${move.col}) ${move.direction === "H" ? "Across" : "Down"}`;
	}
</script>

<div
	class="flex flex-col gap-4 p-4 md:p-5 bg-slate-900 text-white rounded-3xl lg:rounded-2xl border border-slate-700/80 shadow-2xl h-[400px] lg:h-full overflow-hidden"
>
	<div
		class="flex items-center justify-between border-b border-white/10 lg:border-slate-700/50 pb-3"
	>
		<h2
			class="text-base md:text-lg font-black tracking-tight flex items-center gap-2"
		>
			<span
				class="w-2 h-2 bg-orange-500 rounded-full animate-pulse lg:hidden"
			></span>
			<span class="lg:hidden">Best moves</span>
			<span class="hidden lg:inline">Best Moves</span>
		</h2>
		<span
			class="bg-white/10 lg:bg-gradient-to-r lg:from-orange-500 lg:to-orange-600 text-white text-[10px] font-black lg:font-bold px-2.5 py-1 rounded-full uppercase lg:normal-case tracking-widest lg:tracking-normal border border-white/5 lg:border-none shadow-none lg:shadow-sm"
		>
			{results.length} found
		</span>
	</div>

	{#if results.length === 0}
		<div
			class="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 gap-3"
		>
			<div
				class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center lg:bg-transparent lg:w-10 lg:h-10"
			>
				<svg
					class="w-6 h-6 lg:w-10 lg:h-10 opacity-50 lg:opacity-30"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
					style="lg:stroke-width: 1.5;"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
					/>
				</svg>
			</div>
			<div class="text-center">
				<p
					class="text-sm font-bold lg:font-medium text-slate-400 lg:text-slate-500"
				>
					<span class="lg:hidden">No moves yet</span>
					<span class="hidden lg:inline">No moves found yet</span>
				</p>
				<p
					class="text-[10px] lg:text-xs text-slate-600 uppercase lg:normal-case tracking-widest lg:tracking-normal mt-1"
				>
					<span class="lg:hidden">Enter your tiles to solve</span>
					<span class="hidden lg:inline"
						>Place tiles on the board and enter your rack</span
					>
				</p>
			</div>
		</div>
	{:else}
		<div class="flex-1 overflow-y-auto pr-1 custom-scrollbar">
			<div class="flex flex-col gap-2.5 pb-2">
				{#each results as move, i}
					<button
						class="group flex items-center justify-between p-3 md:p-4 lg:p-3.5 bg-white/[0.03] lg:bg-slate-800/80 hover:bg-white/[0.08] lg:hover:bg-slate-700/80 active:bg-orange-500/20 rounded-2xl lg:rounded-xl border border-white/5 lg:border-slate-700/50 hover:border-orange-500/40 transition-all text-left lg:hover:scale-[1.01] lg:active:scale-[0.99]"
						onmouseenter={() => onHover(move)}
						onmouseleave={() => onHover(null)}
						onclick={() => onSelect(move)}
					>
						<div class="flex flex-col gap-0.5">
							<span
								class="text-orange-500 lg:text-orange-400 text-[10px] font-black lg:font-bold uppercase tracking-[0.2em] lg:tracking-widest opacity-80 lg:opacity-100"
							>
								#{i + 1}
							</span>
							<span
								class="text-lg md:text-xl font-black text-white group-hover:text-orange-300 transition-colors uppercase tracking-tight lg:tracking-wide"
							>
								{move.word}
							</span>
							<span
								class="text-slate-500 text-[10px] font-bold lg:font-medium uppercase lg:normal-case tracking-wider lg:tracking-normal"
								>{formatPosition(move)}</span
							>
						</div>
						<div
							class="bg-gradient-to-br from-orange-500 to-orange-700 px-3 md:px-4 lg:px-3.5 py-1.5 md:py-2 lg:py-1.5 rounded-xl lg:rounded-lg font-black text-lg shadow-lg group-hover:scale-105 lg:group-hover:scale-110 transition-transform min-w-[3.5rem] lg:min-w-[3rem] text-center"
						>
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
