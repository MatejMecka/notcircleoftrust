<script lang="ts">
  import { onMount } from "svelte";
//  import UnlockButton from "./UnlockButton.svelte";
  import { Api } from "@stellar/stellar-sdk/rpc";

  let { contract, userCircle, getAtoms } = $props();
  let circles = $state([]);
  let search = $state("");

  const bgColors = [
    "bg-slate-900/50 border-blue-400/20",
    "bg-indigo-900/50 border-indigo-400/20",
    "bg-cyan-950/50 border-cyan-400/20",
    "bg-teal-950/50 border-teal-400/20",
  ];

onMount(async () => { 
  console.log("HELLO! READ THIS"); 

  // fetch all circles
  let { result: allCircles } = await contract.get_all_circles(); 
  console.log("All circles:", allCircles); 

  // fetch wallet circles
  let { result: walletCircles } = await contract.get_wallet_circles({ wallet: userCircle.address }); 
  console.log("Wallet circles:", walletCircles);

  // assign merged array into state
  circles = allCircles.map((c, i) => ({ 
    id: c.circle_id ?? i, 
    name: c.name, 
    members: c.member_count ?? 0, 
    password: c.password ?? "", 
    isUnlocked: c.betrayed === true || walletCircles.includes(c.circle_id) || userCircle.address === c.creator, 
    betrayed: c.betrayed,
    enteredPassword: "",
    joined: walletCircles.includes(c.circle_id) || userCircle.address === c.creator,
  })); 

  console.log("Merged circles:", circles);
});


    async function handleBetray(circleId: number) {
        const circle = circles.find(c => c.id === circleId);
        if (!circle) return;

        try {
            const tx = await contract.betray_circle({
                betrayer: userCircle.address,
                circle_id: circleId,
                password: circle.enteredPassword,
            });

            // catch if simulation is missing, or if it's an error
            if (!tx.simulation || Api.isSimulationError(tx.simulation)) {
                throw tx.simulation?.error || 'shrug'
            }

            // successful simulation means we can sign and send it.
            let { result } = await tx.signAndSend()
            // spit out the result, which is the circle index
            console.log(result.unwrap())

            alert(`You have chosen to betray circle ${circleId}. The trust is broken.`);

            circle.isUnlocked = false;
            circle.betrayed = true;

        } catch (err) {
            console.error('Something has gone terribly wrong!')
            console.error(err)
        }
  }

  async function handleFinalJoin(circleId: number) {
    const circle = circles.find(c => c.id === circleId);
    if (!circle) return;

     try {
        const tx =  await contract.join_circle({
            joiner: userCircle.address,
            circle_id: circleId,
            password: circle.enteredPassword,
        });

        // catch if simulation is missing, or if it's an error
        if (!tx.simulation || Api.isSimulationError(tx.simulation)) {
            throw tx.simulation?.error || 'shrug'
        }

        // successful simulation means we can sign and send it.
        let { result } = await tx.signAndSend()
        // spit out the result, which is the circle index
        console.log(result.unwrap())

        alert(`You have successfully joined circle: ${circle.name}`)

        circle.members += 1;
        circle.isUnlocked = true;
        circle.joined = true;

    } catch (err) {
        console.error('Something has gone terribly wrong!')
        console.error(err)
    }
  }

  async function handleUnlock(circleId: number) {
    const circle = circles.find(c => c.id === circleId);
    if (!circle) return;

    console.log(userCircle.address);
    console.log(circleId);
    console.log(circle.enteredPassword);

    try {
      let {result} = await contract.join_circle({
        joiner: userCircle.address,
        circle_id: circleId,
        password: circle.enteredPassword,
      });

      console.log(result);

      if(result["value"] === true){
        circle.isUnlocked = true;
        circle.accessGranted = true;
        console.log(circles);
      } else {
        alert("Wrong Password!");
      }
    } catch (err) {
      alert(err);
    }
  }
</script>

<!-- Gallery of Other Circles -->
<div class="px-4 sm:px-8 py-8">
  <h3 class="text-3xl font-bold mb-6 text-white/90">Explore Other Circles</h3>

  <!-- Search Bar -->
  <div class="mb-6 max-w-md mx-auto">
    <input
      type="text"
      placeholder="Search Circles..."
      bind:value={search}
      class="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    />
  </div>

  <div class="grid grid-cols-1 gap-8">
    {#each circles.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) as circle, i}
      <!-- ...existing card code... -->
      <div class="relative overflow-hidden p-6 rounded-2xl shadow-xl backdrop-blur-md border flex flex-col transition-all duration-300 hover:shadow-cyan-400/20 {bgColors[i % bgColors.length]}">
        <!-- ...existing card content... -->
        {#if circle.betrayed}
          <div class="absolute top-0 left-0 -translate-x-10 translate-y-6 -rotate-45 bg-red-600/90 text-white font-bold text-sm text-center w-40 py-1 shadow-lg">
            Betrayed
          </div>
        {/if}
        {#if circle.joined}
          <div class="absolute top-0 left-0 -translate-x-10 translate-y-6 -rotate-45 bg-purple-600/90 text-white font-bold text-sm text-center w-40 py-1 shadow-lg">
            Joined
          </div>
        {/if}
        <!-- Atom Circle Visual -->
        <div class="relative w-32 h-32 flex-shrink-0 mx-auto flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-cyan-400/20 rounded-full animate-pulse"></div>
          <div class="absolute w-3 h-3 bg-cyan-300 rounded-full"></div>
          <div class="absolute w-full h-full animate-[spin_30s_linear_infinite]">
            {#each getAtoms(circle.members) as atom}
              <div 
                class="absolute w-3 h-3 bg-violet-400 rounded-full top-1/2 left-1/2 -ml-1.5 -mt-1.5"
                style="transform: translate({atom.x / 2.2}px, {atom.y / 2.2}px);"
              ></div>
            {/each}
          </div>
        </div>
        <div class="flex flex-col flex-grow text-center mt-4">
          <h4 class="text-2xl font-bold text-white/95">{circle.name}</h4>
          <p class="text-gray-400 mt-1 mb-4">This circle has {circle.members} members.</p>
          <div>
            {#if circle.isUnlocked}
              <div class="flex gap-3 justify-center">
                <button 
                  onclick={() => handleBetray(circle.id)} 
                  class="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition shadow-md hover:shadow-red-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={circle.betrayed || circle.joined}
                >
                  Betray
                </button>
                <button 
                  onclick={() => handleFinalJoin(circle.id)} 
                  class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition shadow-md hover:shadow-blue-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={circle.betrayed || circle.joined}
                >
                  Join
                </button>
              </div>
            {:else}
              <div class="flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="Enter password"
                  bind:value={circle.enteredPassword}
                  class="px-4 py-2 rounded-lg border border-gray-500 bg-gray-800 text-white"
                />
                <button 
                  onclick={() => handleUnlock(circle.id)} 
                  class="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition shadow-md"
                >
                  Unlock
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>