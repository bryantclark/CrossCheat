<script lang="ts">
	import { LETTER_VALUES } from "$lib/solver/constants";

	let { rack = $bindable("") } = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		rack = target.value
			.toUpperCase()
			.replace(/[^A-Z?]/g, "")
			.slice(0, 7);
		target.value = rack;
	}

	let tiles = $derived(rack.padEnd(7, " ").split(""));
</script>

<div
	class="flex flex-col gap-2 p-3 bg-white/80 lg:bg-white/50 backdrop-blur-md rounded-2xl lg:rounded-xl border border-slate-200 lg:border-white/20 shadow-xl lg:shadow-lg max-w-lg lg:max-w-none mx-auto lg:mx-0 w-full"
>
	<div class="flex items-center justify-between mb-1">
		<label
			for="rack-input"
			class="text-[10px] font-black lg:font-bold text-slate-500 uppercase tracking-[0.2em] lg:tracking-widest"
		>
			Your Tiles (use ? for blanks)
		</label>
		<button
			onclick={() => (rack = "")}
			class="text-[10px] font-black lg:font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest px-2"
		>
			Clear
		</button>
	</div>
	<div class="flex flex-col sm:flex-row gap-3 items-center">
		<input
			id="rack-input"
			type="text"
			value={rack}
			oninput={handleInput}
			placeholder="ABCDEFG"
			maxlength={7}
			class="w-full sm:flex-1 px-4 lg:px-3 py-3 lg:py-2 text-2xl lg:text-xl font-mono font-bold tracking-[0.3em] lg:tracking-widest text-center border-2 border-slate-200 rounded-xl lg:rounded-lg focus:border-orange-500 focus:ring-4 lg:ring-2 focus:ring-orange-100 outline-none transition-all uppercase bg-white shadow-inner lg:shadow-none"
		/>
		<div class="flex gap-1.5 justify-center">
			{#each tiles as char}
				<div
					class="w-9 h-11 md:w-10 md:h-12 bg-orange-100 border-2 border-orange-200 rounded-lg lg:rounded-md flex items-center justify-center text-xl lg:text-lg font-black lg:font-bold text-orange-900 shadow-sm transition-all hover:scale-105 active:scale-95 relative"
				>
					{char === " " ? "" : char}
					{#if char !== " "}
						<span
							class="absolute bottom-1 right-1 text-[7px] md:text-[8px] font-black lg:font-bold opacity-60 leading-none"
						>
							{LETTER_VALUES[char.toUpperCase()] || 0}
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
