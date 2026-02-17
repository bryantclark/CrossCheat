<script lang="ts">
	import { LETTER_VALUES } from '$lib/solver/constants';

	let { rack = $bindable('') } = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		rack = target.value.toUpperCase().replace(/[^A-Z?]/g, '').slice(0, 7);
		target.value = rack;
	}

	let tiles = $derived(rack.padEnd(7, ' ').split(''));
</script>

<div class="flex flex-col gap-2 p-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
	<div class="flex items-center justify-between mb-1">
		<label for="rack-input" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
			Your Tiles (use ? for blanks)
		</label>
		<button
			onclick={() => (rack = '')}
			class="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
		>
			Clear
		</button>
	</div>
	<div class="flex gap-3 items-center">
		<input
			id="rack-input"
			type="text"
			value={rack}
			oninput={handleInput}
			placeholder="ABCDEFG"
			maxlength={7}
			class="flex-1 px-3 py-2 text-xl font-mono font-bold tracking-widest text-center border-2 border-slate-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all uppercase"
		/>
		<div class="flex gap-1.5">
			{#each tiles as char}
				<div
					class="w-9 h-11 bg-orange-100 border-2 border-orange-200 rounded-md flex items-center justify-center text-lg font-bold text-orange-900 shadow-sm transition-all hover:scale-110 relative"
				>
					{char === ' ' ? '' : char}
					{#if char !== ' '}
						<span class="absolute bottom-1 right-1 text-[8px] font-bold opacity-60 leading-none">
							{LETTER_VALUES[char.toUpperCase()] || 0}
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
