<script lang="ts">
    // Simulate login process
    let isNewUser = $state(false); 
    let {contract = $bindable(), userCircle = $bindable(), isLoggedIn = $bindable(), showCreateCircleModal = $bindable(), showLoginModal = $bindable()} = $props();

    import {
        isConnected,
        requestAccess
    } from "@stellar/freighter-api";

    import {
        scValToNative
    } from "@stellar/stellar-sdk"

    // No idea why it does not like Svelte
    /*
    import {
        StellarWalletsKit,
        WalletNetwork,
        allowAllModules,
        XBULL_ID
    } from '@creit.tech/stellar-wallets-kit';

    const kit: StellarWalletsKit = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: XBULL_ID,
        modules: allowAllModules(),
    });
    console.log(kit)
    */

    async function simulateLogin(newUser = false) {
        showLoginModal = false;
        isNewUser = newUser;

        const isAppConnected = await isConnected();

        if ("isConnected" in isAppConnected && isAppConnected.isConnected) {
            console.log("User has Freighter!");
        }

        if (isNewUser) {
            showCreateCircleModal = true;
        } else {
            const accessObj = await requestAccess();

            if (accessObj.error) {
                return accessObj.error;
            } else {

                contract['options']['publicKey'] = userCircle.address
                console.log("HELLO")

                // Again I have no idea why this does not work.
                /*
                const {result} = await contract.get_owner_circle({
                    wallet: accessObj.address
                });
                */

                const thing = await contract.get_owner_circle({
                    wallet: accessObj.address
                })
                let result = scValToNative(thing.simulation?.result.retval)
                console.log(result)


            if(result == undefined){
                console.log("Redirecting to circle creation!")
                showCreateCircleModal = true
            } else {
                console.log("LOGIN RESULT")
                console.log(result)
                isLoggedIn = true;
                userCircle = {
                    ...userCircle,
                    address: result[2],
                    name: result[0],
                    members: result[3],
                    id: result[4],
                    password: "hello"
                }
                contract.options.publicKey = result[2]
            }

            }
        }
    }
</script>
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" on:click={() => showLoginModal = false}>
      <div class="bg-gray-800 border border-cyan-500/50 rounded-2xl shadow-2xl p-8 max-w-md w-full m-4 text-center" on:click|stopPropagation>
        <h2 class="text-3xl font-bold mb-4 text-cyan-300">Welcome to Not Circle of Trust</h2>
        <ul class="space-y-4 text-left my-8 text-gray-300">
          <li class="flex items-start gap-3">
            <!-- Users Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div>
              <h3 class="font-semibold text-white">Each user has one circle.</h3>
              <p class="text-sm">Your circle is your sanctuary. Grow it wisely with trusted members.</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <!-- Alert Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
             <div>
              <h3 class="font-semibold text-white">Be alert with your password.</h3>
              <p class="text-sm">If your circle's password is betrayed, the circle is gone forever. Share only with those you trust completely.</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <!-- Lock Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-rose-400 flex-shrink-0 mt-1"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
             <div>
              <h3 class="font-semibold text-white">All activity is public.</h3>
              <p class="text-sm">Remember that all actions on the blockchain are transparent. Change your password after a new member joins.</p>
            </div>
          </li>
        </ul>
        <div class="flex flex-col sm:flex-row gap-4 mt-8">
          <button on:click={() => simulateLogin(false)} class="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg shadow-lg transition">
            Login as Existing User
          </button>
          <button on:click={() => simulateLogin(true)} class="w-full px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg shadow-lg transition">
            Create a New Circle
          </button>
        </div>
      </div>
    </div>