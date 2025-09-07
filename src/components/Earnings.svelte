<script lang="ts">
    import { onMount } from "svelte";

    // Props to make the component reusable
    let {contract, userAddress} = $props();
    const currency = "Kale";
    let amount = 0

    onMount(async () => {
        console.log("Earnings component mounted");
        // You can fetch and display earnings data here if needed
        console.log(userAddress)
        let {result} =  await contract.get_player_earnings({player: userAddress})
        console.log(result)

        if (result == undefined){
            amount = 0;
        } else {
            amount = result["total_kale_earned"];
        }
    });
  
</script>

<div class="mt-4 rounded-lg border border-white/10 bg-black/20 p-4 shadow-lg backdrop-blur-md">
  <div class="flex items-center justify-between">
    <span class="font-medium text-white/70">Earned {currency}:</span>
    
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      
      <span class="font-bold text-xl text-green-300">{amount}</span>
    </div>
  </div>
</div>