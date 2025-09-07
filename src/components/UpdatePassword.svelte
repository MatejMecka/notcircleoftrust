<script lang="ts">
  import { KeyRound } from "@lucide/svelte";
  import { scValToNative } from "@stellar/stellar-sdk";
  import { getSHA256Hash } from "boring-webcrypto-sha256";
  import { Client, networks } from "../../packages/circleoftrust/src";
  import { signTransaction } from "@stellar/freighter-api";
  import { Api } from "@stellar/stellar-sdk/rpc";
  
  let { contract, caller, circle_id } = $props();
  let showPasswordModal = $state(false);
  let newCirclePassword = $state("");
  
  console.log(contract)

  async function handleUpdatePassword(event: Event) {
    event.preventDefault();
    if (!newCirclePassword.trim()) return;
    
    console.log("setting Password")

     try {

        console.log(caller)
        console.log(circle_id)

        const tx = await contract.set_password({
            caller: caller,
            circle_id: circle_id,
            password_hash: Buffer.from(await getSHA256Hash(newCirclePassword), "hex")
        })

        console.log(tx)

        // catch if simulation is missing, or if it's an error
        if (!tx.simulation || Api.isSimulationError(tx.simulation)) {
            throw tx.simulation?.error || 'shrug'
        }

        let { result } = await tx.signAndSend()
        // spit out the result, which is the circle index
        console.log(result.unwrap())

        //console.log(thing2)

        //let result2 = scValToNative(thing2.simulation?.result.retval)
        //console.log(result2)
    } catch (err) {
        console.error('Something has gone terribly wrong!')
        console.error(err)
    }
    
    // Close modal after successful update
    showPasswordModal = false;
    newCirclePassword = "";
  }
  
  function handleBackdropClick(event: MouseEvent) {
    // Only close if clicking the backdrop itself, not the modal content
    if (event.target === event.currentTarget) {
      showPasswordModal = false;
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      showPasswordModal = false;
    }
  }
  
  function closeModal() {
    showPasswordModal = false;
  }
</script>

<!-- Main button to open modal -->
<button 
  onclick={() => showPasswordModal = true} 
  class="mt-8 w-full px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
  type="button"
  aria-haspopup="dialog"
>
  <KeyRound aria-hidden="true" />
  Update Password
</button>

<!-- Modal Dialog -->
{#if showPasswordModal}
  <div 
    class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" 
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    onkeydown={handleKeydown}
    onclick={handleBackdropClick}
  >
    <div 
      class="bg-gray-800 border border-violet-500/50 rounded-2xl shadow-2xl p-8 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto" 
      role="document"
    >
      <h2 id="modal-title" class="text-3xl font-bold mb-6 text-center text-violet-300">
        Create Your Circle
      </h2>
      
      <form onsubmit={handleUpdatePassword} class="space-y-4">
        <div>
          <label for="circlePassword" class="block text-sm font-medium text-gray-300 mb-1">
            Circle Password
          </label>
          <input 
            id="circlePassword" 
            type="password" 
            bind:value={newCirclePassword} 
            placeholder="Choose a strong password" 
            class="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
            minlength="8"
            aria-describedby="password-help"
          />
          <div id="password-help" class="text-xs text-gray-400 mt-1">
            Password must be at least 8 characters long
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button 
            type="button" 
            onclick={closeModal}
            class="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg shadow-lg transition"
            disabled={!newCirclePassword.trim()}
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}