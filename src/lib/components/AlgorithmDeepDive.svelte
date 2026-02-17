<script lang="ts">
	// No props needed for this static educational component
</script>

<div class="w-full max-w-5xl mx-auto mt-16 mb-32 px-4 sm:px-6">
	<!-- Article Header -->
	<header class="text-center space-y-6 mb-20">
		<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest">
			<span class="w-2 h-2 rounded-full bg-orange-500"></span>
			Algorithm Deep Dive
		</div>
		<h1 class="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
			Solving Scrabble<sup class="text-lg md:text-2xl text-slate-400 align-top top-0">®</sup> in <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Milliseconds</span>
		</h1>
		<p class="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
			How we use Tries, Bitmasks, and Recursive Backtracking to prune a search space of trillions down to a few hundred checks.
		</p>
	</header>

	<!-- Article Body -->
	<article class="space-y-24">
		
		<!-- Section 1: The Problem (Abstract) -->
		<section class="grid md:grid-cols-2 gap-12 items-center">
			<div class="space-y-6">
				<h2 class="text-3xl font-black text-slate-800">The Combinatorial Explosion</h2>
				<p class="text-slate-600 text-lg leading-relaxed">
					Imagine you have 7 tiles on your rack and a board with dozens of open squares. 
					To find the "best" move, a naive computer might try placing every combination of letters in every possible spot.
				</p>
				<p class="text-slate-600 text-lg leading-relaxed">
					The math gets scary fast. With just 7 tiles, there are over <strong>5,000 permutations</strong>. 
					Multiply that by 225 squares on the board, and account for 2 directions... you're looking at millions of checks per turn. 
					And that's before checking if the words are valid!
				</p>
			</div>
			<div class="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 relative overflow-hidden">
				<div class="absolute top-0 right-0 p-8 opacity-10 font-mono text-8xl font-black text-slate-900 pointer-events-none select-none">
					O(n!)
				</div>
				<div class="relative z-10 space-y-4">
					<h3 class="font-bold text-slate-900 flex items-center gap-2">
						<svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
						Why brute force fails
					</h3>
					<ul class="space-y-3 text-slate-600 font-medium">
						<li class="flex items-start gap-3">
							<span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
							<span>Checking 280,000 words against every spot takes minutes.</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
							<span>Most placements are garbage (e.g., "QXJ" is rarely valid).</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
							<span>Users expect instant feedback.</span>
						</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- Section 2: The Librarian (Analogy) -->
		<section class="bg-orange-50 rounded-[2.5rem] p-8 md:p-16 text-center space-y-8">
			<div class="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
				📚
			</div>
			<div class="max-w-2xl mx-auto space-y-4">
				<h2 class="text-3xl font-black text-slate-900">The Librarian Strategy</h2>
				<p class="text-slate-700 text-lg leading-relaxed">
					Think of the dictionary not as a list, but as a path. 
					A librarian doesn't read every book title to find "Apple". They walk down the "A" aisle, then the "P" shelf, then the "P" section.
				</p>
				<p class="text-slate-700 text-lg leading-relaxed">
					If the "A" aisle is blocked, they don't even bother looking for "B" or "C". They stop immediately.
					This is the core of our optimization: <strong>Pruning</strong>.
				</p>
			</div>
		</section>

		<!-- Section 3: The Trie (Technical) -->
		<section class="grid lg:grid-cols-2 gap-16 items-center">
			<div class="order-2 lg:order-1 relative group">
				<div class="absolute -inset-4 bg-gradient-to-tr from-slate-200 to-slate-50 rounded-[2rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
				<img src="/trie_diagram.png" alt="Trie Data Structure Diagram" class="relative rounded-2xl shadow-2xl border border-slate-200 w-full" />
			</div>
			<div class="space-y-8 order-1 lg:order-2">
				<div class="space-y-4">
					<div class="text-orange-600 font-bold tracking-widest text-xs uppercase">Step 1: The Structure</div>
					<h2 class="text-3xl font-black text-slate-900">The Trie (Prefix Tree)</h2>
					<p class="text-slate-600 text-lg leading-relaxed">
						Instead of storing an array of strings like <code>['CAT', 'CAR', 'DOG']</code>, we store a tree of nodes.
						Each node represents a letter.
					</p>
				</div>
				<div class="space-y-4">
					<h4 class="font-bold text-slate-900">Why it's faster</h4>
					<p class="text-slate-600 leading-relaxed">
						When the solver tries to place the letter <strong>'Z'</strong>, if the current node doesn't have a 'Z' child, 
						we know <em>instantly</em> that no word in the entire dictionary starts with what we've built so far.
						We stop searching that path immediately, saving thousands of wasted checks.
					</p>
				</div>
				<div class="bg-slate-900 text-slate-400 rounded-xl p-6 font-mono text-sm shadow-xl overflow-hidden">
					<div class="flex gap-2 mb-4 border-b border-slate-800 pb-2">
						<span class="w-3 h-3 rounded-full bg-red-500"></span>
						<span class="w-3 h-3 rounded-full bg-yellow-500"></span>
						<span class="w-3 h-3 rounded-full bg-green-500"></span>
					</div>
					<pre>class TrieNode &#123;
  children: Record&lt;string, TrieNode&gt;;
  isTerminal: boolean; // Is this end of a word?
&#125;</pre>
				</div>
			</div>
		</section>

		<!-- Section 4: Cross Sets (Technical) -->
		<section class="grid lg:grid-cols-2 gap-16 items-center">
			<div class="space-y-8">
				<div class="space-y-4">
					<div class="text-orange-600 font-bold tracking-widest text-xs uppercase">Step 2: The Constraint</div>
					<h2 class="text-3xl font-black text-slate-900">Cross-Sets</h2>
					<p class="text-slate-600 text-lg leading-relaxed">
						Placing a word horizontally often creates vertical words too. 
						If you place 'H' to satisfy a horizontal word "THE", you need to make sure 'H' 
						also works vertically with whatever is above or below it.
					</p>
				</div>
				<div class="space-y-4">
					<h4 class="font-bold text-slate-900">Pre-calculation Magic</h4>
					<p class="text-slate-600 leading-relaxed">
						Before we start searching for words, we scan every empty square on the board. 
						We ask: "If I put a letter here, does it form a valid vertical word?"
					</p>
					<p class="text-slate-600 leading-relaxed">
						We save the answer as a <strong>Set</strong> of allowed letters. 
						If a square allows <code>&#123;'A', 'E', 'I'&#125;</code>, our solver <em>only</em> tries those letters.
					</p>
				</div>
			</div>
			<div class="relative group">
				<div class="absolute -inset-4 bg-gradient-to-bl from-orange-100 to-slate-50 rounded-[2rem] rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
				<img src="/cross_set_diagram.png" alt="Cross Set Visualization" class="relative rounded-2xl shadow-2xl border border-slate-200 w-full" />
			</div>
		</section>

		<!-- Section 5: The Algorithm (Code) -->
		<section class="space-y-12">
			<div class="max-w-3xl mx-auto text-center space-y-6">
				<div class="text-orange-600 font-bold tracking-widest text-xs uppercase">Step 3: The Search</div>
				<h2 class="text-3xl font-black text-slate-900">Recursive Backtracking</h2>
				<p class="text-slate-600 text-lg leading-relaxed">
					We combine everything into a recursive function that "walks" the board and the Trie simultaneously.
				</p>
			</div>

			<div class="bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl border border-slate-800 overflow-hidden relative">
				<!-- Code overlay gradient -->
				<div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-900 to-transparent opacity-50 pointer-events-none"></div>

				<div class="grid lg:grid-cols-3 gap-12">
					<div class="lg:col-span-2 font-mono text-sm text-slate-300 leading-relaxed overflow-x-auto">
<pre class="whitespace-pre-wrap">
<span class="text-purple-400">function</span> <span class="text-blue-400">solve</span>(position, trieNode, rack):

  <span class="text-slate-500">// 1. Base Case: Did we form a word?</span>
  <span class="text-purple-400">if</span> trieNode.isTerminal:
    saveWord()

  <span class="text-slate-500">// 2. Recursive Step: Try next square</span>
  <span class="text-purple-400">for</span> <span class="text-orange-400">letter</span> <span class="text-purple-400">in</span> rack:
  
    <span class="text-slate-500">// OPTIMIZATION 1: Does the prefix exist?</span>
    <span class="text-purple-400">if</span> !trieNode.hasChild(<span class="text-orange-400">letter</span>): <span class="text-purple-400">continue</span>
    
    <span class="text-slate-500">// OPTIMIZATION 2: Is it valid vertically?</span>
    <span class="text-purple-400">if</span> !crossSets[position].has(<span class="text-orange-400">letter</span>): <span class="text-purple-400">continue</span>

    <span class="text-slate-500">// If valid, go deeper</span>
    solve(position + 1, trieNode.getChild(<span class="text-orange-400">letter</span>), rack - <span class="text-orange-400">letter</span>)
</pre>
					</div>
					<div class="space-y-8">
						<div>
							<h5 class="text-white font-bold mb-2">Greedy Depth-First</h5>
							<p class="text-slate-400 text-sm">
								The algorithm dives deep into a valid prefix (e.g., S-T-R-A-...) as far as possible before backing up to try S-T-R-E-...
							</p>
						</div>
						<div>
							<h5 class="text-white font-bold mb-2">Early Exit</h5>
							<p class="text-slate-400 text-sm">
								The <code>if</code> checks prevent us from exploring invalid paths. This turns an exponential problem into a linear one.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Section 6: Conclusion -->
		<section class="bg-slate-50 rounded-3xl p-8 md:p-12 text-center space-y-6 border border-slate-200">
			<h2 class="text-2xl font-black text-slate-900">Trade-offs & Result</h2>
			<div class="grid md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto pt-4">
				<div class="space-y-2">
					<div class="font-bold text-slate-900">Speed</div>
					<p class="text-slate-600 text-sm">
						Extremely fast (~0.4ms) because we check invalid conditions before placing tiles.
					</p>
				</div>
				<div class="space-y-2">
					<div class="font-bold text-slate-900">Memory</div>
					<p class="text-slate-600 text-sm">
						The Trie takes up more RAM (~10MB) than a simple list, but allows for instant lookups.
					</p>
				</div>
				<div class="space-y-2">
					<div class="font-bold text-slate-900">Complexity</div>
					<p class="text-slate-600 text-sm">
						Harder to write and debug than a bruteforce loop, but necessary for real-time performance.
					</p>
				</div>
			</div>
		</section>

		<!-- Footer CTA -->
		<footer class="text-center pt-12 pb-20">
			<p class="text-slate-500 mb-8 font-medium">Want to see the actual code?</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a 
					href="https://github.com/files-community/CrossPlay/tree/main/src/lib/solver"
					target="_blank"
					class="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200/50"
				>
					View Source on GitHub
				</a>
				<a 
					href="/solve"
					class="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200/50"
				>
					Run the Solver
				</a>
			</div>
		</footer>

	</article>
</div>
