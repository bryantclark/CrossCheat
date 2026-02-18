<script lang="ts">
	import { fade, fly } from "svelte/transition";
	import AlgorithmDeepDive from "./AlgorithmDeepDive.svelte";

	function scrollToDeepDive() {
		document
			.getElementById("deep-dive")
			?.scrollIntoView({ behavior: "smooth" });
	}
</script>

<div
	class="min-h-screen bg-slate-100 flex flex-col items-center text-left"
	in:fade={{ duration: 800 }}
>
	<div
		class="max-w-6xl w-full flex flex-col items-start flex-grow justify-center space-y-12 py-20 px-4 md:px-12"
	>
		<!-- Hero Section -->
		<div
			class="space-y-6 max-w-4xl"
			in:fly={{ x: -20, duration: 800, delay: 200 }}
		>
			<h1
				class="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-none"
			>
				Cross<span class="text-orange-600">Cheat</span>
			</h1>
			<p
				class="text-2xl md:text-3xl text-slate-500 font-medium leading-tight"
			>
				Crosswords solver for <span class="text-slate-900 font-bold"
					>Crossplay</span
				>, <span class="text-slate-900 font-bold">Scrabble</span>, or
				<span class="text-slate-900 font-bold">Words With Friends</span
				>. Stop guessing, start
				<span
					class="text-slate-900 font-bold underline decoration-orange-500/30"
					>winning</span
				>.
			</p>
		</div>

		<!-- Actions -->
		<div
			class="flex flex-row items-center justify-start gap-4 pt-4"
			in:fly={{ x: -20, duration: 800, delay: 400 }}
		>
			<a
				href="/solve"
				class="group relative px-10 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl hover:shadow-orange-500/20 transition-all active:scale-95 overflow-hidden w-full sm:w-auto text-xl"
			>
				<div
					class="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
				></div>
				<span class="relative whitespace-nowrap">Start Solving</span>
			</a>
			<button
				onclick={scrollToDeepDive}
				class="px-10 py-5 bg-white text-slate-900 font-black rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all active:scale-95 w-full sm:w-auto text-xl"
			>
				How it works
			</button>
		</div>

		<!-- Video Preview (Left Aligned but prominent) -->
		<div
			class="relative group w-full max-w-6xl"
			in:fly={{ y: 20, duration: 800, delay: 600 }}
		>
			<div
				class="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-[2.5rem] blur opacity-10"
			></div>
			<div
				class="relative bg-slate-50 rounded-[2.5rem] overflow-hidden aspect-video shadow-2xl border border-slate-200"
			>
				<video
					src="/lobby.mp4"
					autoplay
					loop
					muted
					playsinline
					class="w-full h-full object-fit"
				>
				</video>
			</div>
		</div>
	</div>

	<div id="deep-dive" class="w-full bg-white border-t border-slate-200">
		<AlgorithmDeepDive />
	</div>

	<!-- Footer -->
	<footer
		class="w-full text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] py-12 px-12 border-t border-slate-100"
		in:fade={{ delay: 1000 }}
	>
		Built out of curiosity • Powered by ENABLE Dictionary
	</footer>
</div>
