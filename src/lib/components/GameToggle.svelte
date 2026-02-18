<script lang="ts">
    import { GAMES } from "$lib/solver/games";

    let { selectedGameKey = $bindable() }: { selectedGameKey: string } =
        $props();

    const games = Object.keys(GAMES);
</script>

<div
    class="flex items-center justify-center p-1 bg-slate-200/50 backdrop-blur-sm rounded-2xl border border-slate-200 w-fit mx-auto shadow-inner relative overflow-hidden"
>
    <!-- Sliding Highlight -->
    <div
        class="absolute top-1 bottom-1 left-1 bg-white rounded-xl shadow-md transition-all duration-300 ease-out z-0"
        style="width: calc((100% - 8px) / {games.length}); transform: translateX(calc({games.indexOf(
            selectedGameKey,
        )} * 100%));"
    ></div>

    {#each games as game}
        <button
            onclick={() => (selectedGameKey = game)}
            data-testid="game-toggle-{game}"
            class="relative z-10 px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 {selectedGameKey ===
            game
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-700'}"
        >
            {game}
        </button>
    {/each}
</div>

<style>
    /* Optional: Add a subtle glow to the highlight */
    div > div {
        box-shadow:
            0 4px 6px -1px rgb(0 0 0 / 0.1),
            0 2px 4px -2px rgb(0 0 0 / 0.1),
            0 0 20px -5px rgb(0 0 0 / 0.05);
    }
</style>
