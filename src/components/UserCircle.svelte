<script lang="ts">
    import { Leaf, Users } from "@lucide/svelte";
    import UpdatePassword from "./UpdatePassword.svelte";
    import { onMount } from "svelte";

    let {userCircle, contract, getAtoms} = $props()
    console.log(userCircle)

    onMount(async () => {
  
        console.log("Fetching circle earnings...");
        console.log(userCircle.id);
        /*
        let tx = await contract.get_circle_earnings({circle_id: userCircle.id});
        console.log(tx);        
        console.log(tx.result.unwrap());
        */

        // No idea why this does not work



        console.log("User Circle:", userCircle);
    });

</script>
<div class="lg:col-span-1 bg-black/30 p-6 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10 flex flex-col items-center">
    <h2 class="text-3xl font-bold text-center mb-2">{userCircle.name}</h2>
    <div class="flex items-center gap-2 text-cyan-300 mb-6">
    <!-- Users Icon -->
    <Users />
    <span class="font-semibold text-lg">{userCircle.members} {userCircle.members === 1 ? 'Member' : 'Members'}</span>
    </div>
    <div class="flex items-center gap-2 text-green-300 mb-6">
        <Leaf></Leaf>
        <span class="font-semibold text-lg">{userCircle.members} Kale</span>
    </div>
    
    <!-- Circle Visualization -->
    <div class="relative w-52 h-52 flex items-center justify-center my-4">
    <!-- Central Core -->
    <div class="absolute w-16 h-16 bg-cyan-400/20 rounded-full animate-pulse border-2 border-cyan-300"></div>
    <div class="absolute w-8 h-8 bg-cyan-300 rounded-full shadow-cyan-300/50 shadow-[0_0_15px]"></div>
    
    <!-- Orbiting Atoms Container -->
    <div class="absolute w-full h-full animate-[spin_40s_linear_infinite]">
        {#each getAtoms(userCircle.members) as atom, i}
        <div 
            class="absolute w-5 h-5 bg-violet-400 rounded-full border-2 border-violet-200 shadow-violet-400/50 shadow-[0_0_10px] top-1/2 left-1/2 -ml-[10px] -mt-[10px]"
            style="transform: translate({atom.x}px, {atom.y}px);"
        ></div>
        {/each}
    </div>
    </div>
    <UpdatePassword contract={contract} caller={userCircle.address} circle_id={userCircle.id}></UpdatePassword>
</div>