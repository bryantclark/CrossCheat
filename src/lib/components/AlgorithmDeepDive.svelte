<script lang="ts">
  import { fade, fly } from "svelte/transition";

  // Internal state for the deep dive comparison
  let selectedGame = $state("CrossPlay");
</script>

<div class="w-full max-w-5xl mx-auto mt-16 mb-32 px-4 sm:px-6">
  <!-- Article Header -->
  <header class="text-left space-y-6 mb-20">
    <div
      class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest"
    >
      <span class="w-2 h-2 rounded-full bg-orange-500"></span>
      Algorithm Deep Dive
    </div>
    <h1 class="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
      Solving {selectedGame}<sup
        class="text-lg md:text-2xl text-slate-400 align-top top-0">®</sup
      >
      in
      <span
        class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500"
        >Milliseconds</span
      >
    </h1>
    <p
      class="max-w-2xl text-lg md:text-xl text-slate-500 font-medium leading-relaxed"
    >
      How we use Tries, Bitmasks, and Recursive Backtracking to prune a search
      space of millions down to a few hundred checks.
    </p>
  </header>

  <!-- Article Body -->
  <article class="space-y-24">
    <!-- Section 1: The Problem (Abstract) -->
    <section class="grid md:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <h2 class="text-3xl font-black text-slate-800">The Problem</h2>
        <p class="text-slate-600 text-lg leading-relaxed">
          Have you ever stared at your rack of tiles and felt completely stuck?
          You know there's a word there, but your brain just can't see it.
        </p>
        <p class="text-slate-600 text-lg leading-relaxed">
          For a computer, the problem is exact opposite. It sees <em
            >too many</em
          >
          options. With 7 tiles and a 15x15 board, the number of possible moves is
          astronomical.
        </p>
        <p class="text-slate-600 text-lg leading-relaxed">
          With that size optimization is imparitive. We were able to optimize
          worst case scenarios from over ten minutes to <strong
            >milliseconds</strong
          >.
        </p>
      </div>

      <!-- Redesigned 'Why Brute Force Fails' Card -->
      <div
        class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-1 shadow-2xl"
      >
        <div
          class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-500/20 blur-3xl"
        ></div>
        <div
          class="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl"
        ></div>

        <div
          class="relative h-full rounded-[2.3rem] bg-slate-900/50 p-8 md:p-10 backdrop-blur-xl"
        >
          <div class="mb-8 flex items-center justify-between">
            <h3 class="flex items-center gap-3 text-xl font-bold text-white">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  /></svg
                >
              </div>
              Why Brute Force Fails
            </h3>
            <span class="font-mono text-2xl font-black text-red-500 opacity-50"
              >O(n!)</span
            >
          </div>

          <div class="space-y-6">
            <div class="group flex gap-4">
              <div
                class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/50 group-hover:bg-red-500 transition-colors"
              ></div>
              <div>
                <div class="font-bold text-white text-lg">
                  225 Squares × 173,000 Words
                </div>
                <div class="text-slate-400 leading-relaxed">
                  That is <span class="text-red-400 font-bold">38,925,000</span>
                  checks for every single turn.
                </div>
              </div>
            </div>
            <div class="group flex gap-4">
              <div
                class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/50 group-hover:bg-red-500 transition-colors"
              ></div>
              <div>
                <div class="font-bold text-white text-lg">
                  Expensive Validation
                </div>
                <div class="text-slate-400 leading-relaxed">
                  Every attempt requires checking cross-words against the
                  dictionary.
                </div>
              </div>
            </div>
            <div class="group flex gap-4">
              <div
                class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/50 group-hover:bg-red-500 transition-colors"
              ></div>
              <div>
                <div class="font-bold text-white text-lg">
                  The "Blank" Problem
                </div>
                <div class="text-slate-400 leading-relaxed">
                  A single blank tile multiplies the search space by 26x. Two
                  blanks? 676x.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: The Librarian (Analogy) -->
    <section
      class="bg-orange-50 rounded-[2.5rem] p-8 md:p-16 text-left space-y-8"
    >
      <div
        class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm"
      >
        <svg
          class="w-8 h-8 text-orange-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          /></svg
        >
      </div>
      <div class="max-w-2xl space-y-4">
        <h2 class="text-3xl font-black text-slate-900">
          The "Librarian" Strategy
        </h2>
        <p class="text-slate-700 text-lg leading-relaxed">
          Imagine a librarian looking for a specific book. They don't walk down
          every single aisle reading every single title.
        </p>
        <p class="text-slate-700 text-lg leading-relaxed">
          They walk to the 'A' section. If the 'A' section is closed for
          repairs, they stop. They don't bother checking for 'Apple' or
          'Artichoke'. They've just saved themselves thousands of checks with
          one glance.
        </p>
        <p class="text-slate-700 text-lg leading-relaxed font-bold">
          This is called <a
            href="https://en.wikipedia.org/wiki/Pruning_(decision_trees)"
            target="_blank"
            class="text-orange-600 underline decoration-orange-300 hover:text-orange-700 transition-colors"
            >Pruning</a
          >. And it's how we solve the game in milliseconds.
        </p>
      </div>
    </section>

    <!-- Section 3: The Trie (Technical) -->
    <section class="grid lg:grid-cols-2 gap-16 items-center">
      <div class="order-2 lg:order-1 relative group">
        <div
          class="absolute -inset-4 bg-gradient-to-tr from-slate-200 to-slate-50 rounded-[2rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500"
        ></div>
        <img
          src="/trie_diagram.png"
          alt="Trie Data Structure Diagram"
          class="relative rounded-2xl shadow-2xl border border-slate-200 w-full"
        />
      </div>
      <div class="space-y-8 order-1 lg:order-2">
        <div class="space-y-4">
          <div
            class="text-orange-600 font-bold tracking-widest text-xs uppercase"
          >
            Step 1: The Structure
          </div>
          <h2 class="text-3xl font-black text-slate-900">
            The Trie (Prefix Tree)
          </h2>
          <p class="text-slate-600 text-lg leading-relaxed">
            We don't store the dictionary as a list of words. We store it as a
            giant tree of letters, known as a <a
              href="https://en.wikipedia.org/wiki/Trie"
              target="_blank"
              class="text-slate-900 font-bold underline decoration-slate-300 hover:decoration-orange-500 transition-all"
              >Trie</a
            >. Following a path down the tree spells out a word.
          </p>
        </div>
        <div class="space-y-4">
          <h4 class="font-bold text-slate-900">Code Breaker</h4>
          <p class="text-slate-600 leading-relaxed">
            If we have the tiles <strong>C, A, T</strong>, we start at the root
            and look for 'C'. Then, from the 'C' node, we look for 'A'. If the
            'C' node doesn't have an 'A' child, we stop immediately. We don't
            need to check "CAB" or "CAN" because we know "CA-" is already a dead
            end for our specific rack.
          </p>
          <p class="text-slate-600 leading-relaxed">
            This data structure allows us to discard massive chunks of the
            dictionary instantly.
          </p>
        </div>
      </div>
    </section>

    <!-- Section 4: Cross Sets (Technical) -->
    <section class="grid lg:grid-cols-2 gap-16 items-center">
      <div class="space-y-8">
        <div class="space-y-4">
          <div
            class="text-orange-600 font-bold tracking-widest text-xs uppercase"
          >
            Step 2: The Constraint
          </div>
          <h2 class="text-3xl font-black text-slate-900">Cross-Sets</h2>
          <p class="text-slate-600 text-lg leading-relaxed">
            Here's the tricky part: You can't just place a word horizontally.
            You have to make sure every single letter also works vertically with
            the tiles already on the board.
          </p>
        </div>
        <div class="space-y-4">
          <h4 class="font-bold text-slate-900">Pre-Calculation</h4>
          <p class="text-slate-600 leading-relaxed">
            Before we even look at your rack, we scan the whole board. For every
            empty square, we ask: "What letters are <em>allowed</em> here vertically?"
          </p>
          <p class="text-slate-600 leading-relaxed">
            If a square has 'D' above it and 'G' below it, the only valid letter
            is 'O' (making "DOG"). We save this information. When our solver
            tries to place a word there, if it's not an 'O', it moves on
            instantly.
          </p>
        </div>
      </div>
      <div class="relative group">
        <div
          class="absolute -inset-4 bg-gradient-to-bl from-orange-100 to-slate-50 rounded-[2rem] rotate-2 group-hover:rotate-0 transition-transform duration-500"
        ></div>
        <img
          src="/cross_set_diagram.png"
          alt="Cross Set Visualization"
          class="relative rounded-2xl shadow-2xl border border-slate-200 w-full"
        />
      </div>
    </section>

    <!-- Section 5: Scoring (Redesigned & Interactive) -->
    <section
      class="space-y-12 bg-slate-50/50 rounded-[3rem] p-8 md:p-16 border border-slate-100"
    >
      <div class="max-w-3xl text-left space-y-8">
        <div class="space-y-3">
          <div
            class="text-orange-600 font-bold tracking-widest text-xs uppercase"
          >
            Step 3: Evaluation
          </div>
          <h2 class="text-4xl font-black text-slate-900">
            How We Pick the Winner
          </h2>
        </div>

        <!-- Minimalist Switcher -->
        <div
          class="inline-flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200 backdrop-blur-sm"
        >
          {#each ["CrossPlay", "Scrabble", "Words With Friends"] as game}
            <button
              onclick={() => (selectedGame = game)}
              class="px-4 py-2 text-xs md:text-sm font-black rounded-xl transition-all {selectedGame ===
              game
                ? 'bg-white text-orange-600 shadow-md transform scale-105'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}"
            >
              {game.toUpperCase()}
            </button>
          {/each}
        </div>

        <p class="text-slate-600 text-lg leading-relaxed max-w-xl">
          Finding valid words is only half the battle. Our engine dynamically
          adapts to the scoring rules of
          <a
            href={selectedGame === "CrossPlay"
              ? "https://help.nytimes.com/360011158491-New-York-Times-Games/crossplay-app"
              : selectedGame === "Scrabble"
                ? "https://www.scrabblepages.com/scrabble/rules/"
                : "https://zyngasupport.helpshift.com/hc/en/63-words-with-friends-2/faq/10552-words-with-friends-rule-book/"}
            target="_blank"
            rel="noopener noreferrer"
            class="font-bold text-slate-900 underline decoration-orange-500/30 hover:decoration-orange-500 transition-all"
          >
            {selectedGame === "CrossPlay"
              ? "NYT Crossplay"
              : selectedGame === "Scrabble"
                ? "Official Scrabble"
                : "Words With Friends"}
          </a>.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        {#key selectedGame}
          <!-- Card 1: Premium Squares -->
          <div
            in:fly={{ y: 20, duration: 400, delay: 0 }}
            class="group relative rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 border border-slate-100 overflow-hidden"
          >
            <div
              class="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"
            ></div>
            <div class="relative">
              <h4 class="mb-3 text-2xl font-black text-slate-900">
                Premium Squares
              </h4>
              <p class="text-slate-600 leading-relaxed font-medium">
                {#if selectedGame === "CrossPlay"}
                  We prioritize <strong>Triple Word</strong> and
                  <strong>Double Word</strong> bonuses. A short word on a triple
                  score often beats a long word on an empty board.
                {:else if selectedGame === "Scrabble"}
                  Scrabble uses higher board multipliers. We focus on hitting
                  <strong>Triple Word (TW)</strong> and
                  <strong>Triple Letter (TL)</strong>
                  spots for maximum impact.
                {:else}
                  WWF features a high density of <strong
                    >Double Multipliers</strong
                  >. The decentralized layout means you can often chain multiple
                  bonus squares in a single move.
                {/if}
              </p>
            </div>
          </div>

          <!-- Card 2: The Bingo -->
          <div
            in:fly={{ y: 20, duration: 400, delay: 100 }}
            class="group relative rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 border border-slate-100 overflow-hidden"
          >
            <div
              class="absolute -top-12 -right-12 w-32 h-32 bg-orange-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"
            ></div>
            <div class="relative">
              <h4 class="mb-3 text-2xl font-black text-slate-900">
                The Bingo Bonus
              </h4>
              <p class="text-slate-600 leading-relaxed font-medium">
                {#if selectedGame === "CrossPlay"}
                  Using all 7 tiles triggers a massive <strong
                    >40-point bonus</strong
                  >. This is the "Golden Snitch" of the game—it almost always
                  guarantees a top ranking.
                {:else if selectedGame === "Scrabble"}
                  In Scrabble, using all 7 tiles awards a massive <strong
                    >50-point bonus</strong
                  >. It's harder to achieve but more rewarding than in
                  CrossPlay.
                {:else}
                  WWF rewards all-tile plays with a <strong
                    >35-point bonus</strong
                  >. While smaller, the more generous board layout makes these
                  long words easier to find.
                {/if}
              </p>
            </div>
          </div>

          <!-- Card 3: Synergy vs Strategy -->
          <div
            in:fly={{ y: 20, duration: 400, delay: 200 }}
            class="group relative rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-300 border border-slate-100 overflow-hidden"
          >
            <div
              class="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"
            ></div>
            <div class="relative">
              <h4 class="mb-3 text-2xl font-black text-slate-900">
                {#if selectedGame === "CrossPlay"}
                  Parallel Play
                {:else if selectedGame === "Scrabble"}
                  Tile Strategy
                {:else}
                  Letter Efficiency
                {/if}
              </h4>
              <p class="text-slate-600 leading-relaxed font-medium">
                {#if selectedGame === "CrossPlay"}
                  We sum points for every word formed. Placing an 'S' to
                  pluralize a word while creating a new one counts for both.
                {:else if selectedGame === "Scrabble"}
                  Scrabble has a pool of <strong>100 tiles</strong>. We
                  prioritize preserving high-value letters unless the board
                  position is too good to pass up.
                {:else}
                  With different letter values (like <strong>J=10</strong>), the
                  goal in WWF is often to land high-value tiles on multiplier
                  spots before your opponent can.
                {/if}
              </p>
            </div>
          </div>
        {/key}
      </div>
    </section>

    <!-- Section 6: The Algorithm (Code) -->
    <section class="space-y-12">
      <div class="max-w-3xl text-left space-y-6">
        <div
          class="text-orange-600 font-bold tracking-widest text-xs uppercase"
        >
          Step 4: The Recursion
        </div>
        <h2 class="text-3xl font-black text-slate-900">
          Recursive Backtracking
        </h2>
        <p class="text-slate-600 text-lg leading-relaxed">
          We combine everything into a recursive function that "walks" the board
          and the Trie simultaneously using <a
            href="https://en.wikipedia.org/wiki/Backtracking"
            target="_blank"
            class="text-slate-900 font-bold underline decoration-slate-300 hover:decoration-orange-500 transition-all"
            >Backtracking</a
          >. It's a depth-first search that is aggressively pruned by our
          cross-sets.
        </p>
      </div>

      <div
        class="bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl border border-slate-800 overflow-hidden relative"
      >
        <div class="grid lg:grid-cols-3 gap-12">
          <div
            class="lg:col-span-2 font-mono text-sm text-slate-300 leading-relaxed overflow-x-auto"
          >
            <pre class="whitespace-pre-wrap">
				<span class="text-purple-400">function</span> <span class="text-blue-400"
                >solve</span
              >(position, trieNode, rack):

				<span class="text-slate-500">// 1. Base Case: Did we form a word?</span>
				<span class="text-purple-400">if</span> trieNode.isTerminal:
					saveWord()

				<span class="text-slate-500">// 2. Recursive Step: Try next square</span>
				<span class="text-purple-400">for</span> <span class="text-orange-400"
                >letter</span
              > <span class="text-purple-400">in</span> rack:
				
					<span class="text-slate-500">// OPTIMIZATION 1: Does the prefix exist?</span>
					<span class="text-purple-400">if</span> !trieNode.hasChild(<span
                class="text-orange-400">letter</span
              >): <span class="text-purple-400">continue</span>
					
					<span class="text-slate-500">// OPTIMIZATION 2: Is it valid vertically?</span>
					<span class="text-purple-400">if</span> !crossSets[position].has(<span
                class="text-orange-400">letter</span
              >): <span class="text-purple-400">continue</span>

					<span class="text-slate-500">// If valid, go deeper</span>
					solve(position + 1, trieNode.getChild(<span class="text-orange-400">letter</span
              >), rack - <span class="text-orange-400">letter</span>)
			</pre>
          </div>
          <div class="space-y-8">
            <div>
              <h5 class="text-white font-bold mb-2">Greedy Depth-First</h5>
              <p class="text-slate-400 text-sm">
                The algorithm dives deep into a valid prefix (e.g., S-T-R-A-...)
                as far as possible before backing up to try S-T-R-E-...
              </p>
            </div>
            <div>
              <h5 class="text-white font-bold mb-2">Early Exit</h5>
              <p class="text-slate-400 text-sm">
                The <code>if</code> checks prevent us from exploring invalid paths.
                This turns an exponential problem into a linear one.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer CTA -->
    <footer class="text-left">
      <p class="text-slate-500 mb-8 font-medium">
        Want to see the actual code?
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-start">
        <a
          href="https://github.com/bryantclark/CrossCheat"
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
