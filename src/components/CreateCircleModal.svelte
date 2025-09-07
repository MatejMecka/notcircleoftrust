<script lang="ts">
    import {
        isConnected,
        requestAccess,
        signTransaction
    } from "@stellar/freighter-api";
    import { xdr } from '@stellar/stellar-sdk';
    import { Api } from "@stellar/stellar-sdk/rpc";

    import { getSHA256Hash } from "boring-webcrypto-sha256";

    let newCircleName = $state("");
    let newCirclePassword = $state("");
    let {contract = $bindable(), isLoggedIn = $bindable(), showCreateCircleModal = $bindable(), userCircle = $bindable()} = $props();

    async function handleCreateCircle() {
    if (!newCircleName.trim() || !newCirclePassword.trim()) {
        alert("Please provide a name and password for your circle.");
        return;
    }

    try {
        // Fetch Name and Password
        userCircle.name = newCircleName;
        userCircle.password = newCirclePassword;
        userCircle.members = 1;

        // Initialize Freighter Connection
        const isAppConnected = await isConnected();
        if (!("isConnected" in isAppConnected) || !isAppConnected.isConnected) {
            alert("Please install Freighter!");
            return;
        }
        
        console.log("Freighter is connected");

        // Request Access to Wallet Key
        const accessObj = await requestAccess();
        if (accessObj.error) {
            console.error("Access request failed:", accessObj.error);
            alert("Failed to access wallet: " + accessObj.error);
            return;
        }

        console.log("Wallet access granted:", accessObj.address);

        // Set Address
        userCircle.address = accessObj.address;
        contract['options']['publicKey'] = userCircle.address

        // Generate password hash
        const passwordHash = Buffer.from(await getSHA256Hash(newCirclePassword), "hex");
        console.log("Password hash generated");

       try {
            const tx = await contract.create_circle({
                creator: accessObj.address,
                name: newCircleName,
                password_hash: passwordHash
            })

            // catch if simulation is missing, or if it's an error
            if (!tx.simulation || Api.isSimulationError(tx.simulation)) {
                throw tx.simulation?.error || 'shrug'
            }

            // successful simulation means we can sign and send it.
            let { result } = await tx.signAndSend()
            // spit out the result, which is the circle index
            console.log(result.unwrap())
        } catch (err) {
            console.error('Something has gone terribly wrong!')
            console.error(err)
        }

        // Update UI state
        isLoggedIn = true;
        showCreateCircleModal = false;
        newCircleName = "";
        newCirclePassword = "";

        alert("Circle created successfully!");

    } catch (error) {
        console.error("Error creating circle:", error);
        
        // More specific error handling
        if (error.message?.includes("User declined access")) {
            alert("Transaction was cancelled by user.");
        } else if (error.message?.includes("insufficient")) {
            alert("Insufficient funds to create circle.");
        } else {
            alert("Failed to create circle: " + (error.message || "Unknown error"));
        }
    }
}
   
</script>
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" on:click={() => showCreateCircleModal = false}>
    <div class="bg-gray-800 border border-violet-500/50 rounded-2xl shadow-2xl p-8 max-w-md w-full m-4" on:click|stopPropagation>
    <h2 class="text-3xl font-bold mb-6 text-center text-violet-300">Create Your Circle</h2>
    <form on:submit|preventDefault={handleCreateCircle} class="space-y-4">
        <div>
        <label for="circleName" class="block text-sm font-medium text-gray-300 mb-1">Name of Your Circle</label>
        <input id="circleName" type="text" bind:value={newCircleName} placeholder="e.g., The Inner Sanctum" class="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-400">
        </div>
        <div>
        <label for="circlePassword" class="block text-sm font-medium text-gray-300 mb-1">Circle Password</label>
        <input id="circlePassword" type="password" bind:value={newCirclePassword} placeholder="Choose a strong password" class="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-400">
        </div>
        <button type="submit" class="w-full mt-6 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg shadow-lg transition">
        Forge Circle
        </button>
    </form>
    </div>
</div>