<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import AlgorithmDeepDive from './AlgorithmDeepDive.svelte';

	function scrollToDeepDive() {
		document.getElementById('deep-dive')?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<div class="min-h-screen bg-slate-100 flex flex-col items-center justify-between p-6 text-center" in:fade={{ duration: 800 }}>
	<div class="max-w-4xl w-full flex flex-col items-center flex-grow justify-center space-y-8 py-12">
		<!-- Hero Section -->
		<div class="space-y-3" in:fly={{ y: 20, duration: 800, delay: 200 }}>
			<h1 class="text-5xl md:text-7xl font-black tracking-tight text-slate-900">
				Cross<span class="text-orange-600">Cheat</span>
			</h1>
			<p class="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
				Crosswords solver built for NYT Crossplay. 
				Stop guessing, start <span class="text-slate-900 font-bold underline decoration-orange-500/30">winning</span>.
			</p>
		</div>

		<!-- Video Preview -->
		<div class="relative group w-full" in:fly={{ y: 20, duration: 800, delay: 400 }}>
			<div class="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-[2.5rem] blur opacity-25"></div>
			<div class="relative bg-slate-50 rounded-[2rem] overflow-hidden aspect-video flex items-center justify-center">
				<video 
					src="/demo.mp4" 
					autoplay 
					loop 
					muted 
					playsinline
					class="w-full h-full object-fit"
				></video>
				
			</div>
		</div>

		<!-- Actions -->
		<div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4" in:fly={{ y: 20, duration: 800, delay: 600 }}>
			<a 
				href="/solve"
				class="group relative px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95 overflow-hidden w-full sm:w-auto"
			>
				<div class="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<span class="relative">Start Solving</span>
			</a>
			<button 
				onclick={scrollToDeepDive}
				class="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all active:scale-95 w-full sm:w-auto"
			>
				How it works
			</button>
		</div>
	</div>

	<div id="deep-dive" class="w-full">
		<AlgorithmDeepDive />
	</div>

	<!-- Footer -->
	<footer class="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] py-8" in:fade={{ delay: 1000 }}>
		Built out of curiosity • Powered by NASPA NWL23
	</footer>
</div>
