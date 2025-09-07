<script lang="ts">
  import { onMount } from "svelte";

  let { contract } = $props();

  type Player = {
    rank: number;
    wallet: string;
    avatarUrl: string;
    circlesJoined: number;
    betrayals: number;
  };

   let players = $state<Player[]>([]);

  /*
  const players: Player[] = [
    { rank: 1, wallet: "GDW6I3B22W2G4Y77732T377G5P2R5D7F6J6W6K5L4M3N2K1R", avatarUrl: `https://placehold.co/64x64/313244/FFF?text=1`, circlesJoined: 152, betrayals: 3 },
    { rank: 2, wallet: "GAX463673B254Q56N74H577T2W6Y3Z5V6U5M2P4X3C2A1P0L", avatarUrl: `https://placehold.co/64x64/313244/FFF?text=2`, circlesJoined: 145, betrayals: 1 },
    { rank: 3, wallet: "GC7Q2E2F3E4G5H6J7K8L9M1N2P3Q4R5S6T7U8V9W1X2Y3Z", avatarUrl: `https://placehold.co/64x64/313244/FFF?text=3`, circlesJoined: 130, betrayals: 0 },
    { rank: 4, wallet: "GAN5P6K7L8M9N1P2Q3R4S5T6U7V8W9X1Y2Z3A4B5C6D7E8F", avatarUrl: `https://placehold.co/64x64/313244/FFF?text=4`, circlesJoined: 112, betrayals: 5 },
    { rank: 5, wallet: "GBA3B4C5D6E7F8G9H1J2K3L4M5N6P7Q8R9S1T2U3V4W5X6Y", avatarUrl: `https://placehold.co/64x64/313244/FFF?text=5`, circlesJoined: 98, betrayals: 2 },
  ];*/

  onMount(async () => {
    console.log("Fetching leaderboard...");
    let { result } = await contract.get_scoreboard();
    console.log(result);

    players = result.map((p, i) => ({
      rank: i + 1,
      wallet: p["address"],
      avatarUrl: "https://robohash.org/" + p["address"] + "?size=64x64&set=set4",
      circlesJoined: p["circles_joined"],
      betrayals: p["circles_betrayed"],
    }));

    console.log("Leaderboard players:", players);

  });

  function shortenWallet(address: string, chars = 6): string {
    if (!address || address.length < chars * 2 + 3) return address;
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
  }

  async function copyToClipboard(text: string, rank: number) {
    try {
      await navigator.clipboard.writeText(text);
      const el = document.getElementById(`copy-feedback-${rank}`);
      if (el) {
        el.innerText = "Copied!";
        el.classList.remove("opacity-0");
        setTimeout(() => el.classList.add("opacity-0"), 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  const rankStyles: Record<number, string> = {
    1: "bg-amber-400/10 border-amber-400/50 shadow-amber-400/20",
    2: "bg-gray-400/10 border-gray-400/50 shadow-gray-400/20",
    3: "bg-orange-400/10 border-orange-400/50 shadow-orange-400/20",
  };
</script>

<!-- Leaderboard -->
<div class="max-w-3xl mx-auto mt-8">
  <h2 class="text-xl font-bold mb-4 text-center">🏆 Leaderboard</h2>
  <div class="space-y-3">
    {#each players as player}
      <div
        class={`flex items-center justify-between p-4 rounded-2xl border shadow-sm transition ${rankStyles[player.rank] ?? "bg-slate-800/40 border-slate-700"}`}
      >
        <!-- Left: Rank + Avatar + Wallet -->
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold w-6 text-center">{player.rank}</span>
          <img src={player.avatarUrl || "https://placehold.co/64x64"} alt="avatar" class="w-10 h-10 rounded-full" />
          <div class="flex items-center gap-2">
            <span class="font-mono">{shortenWallet(player.wallet)}</span>
            <button
              on:click={() => copyToClipboard(player.wallet, player.rank)}
              class="text-xs px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600"
            >
              Copy
            </button>
            <span id={`copy-feedback-${player.rank}`} class="text-xs text-green-400 opacity-0 transition">
              Copied!
            </span>
          </div>
        </div>

        <!-- Right: Stats -->
        <div class="flex items-center gap-4 text-sm">
          <div class="flex flex-col items-center">
            <span class="font-bold">{player.circlesJoined}</span>
            <span class="text-slate-400">Joined</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="font-bold text-red-400">{player.betrayals}</span>
            <span class="text-slate-400">Betrayals</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
