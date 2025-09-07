<script lang="ts">
  import {signTransaction} from "@stellar/freighter-api";
  import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
  

  import Welcome from './components/Welcome.svelte';
  import LoginModal from './components/LoginModal.svelte';
  import CreateCircleModal from './components/CreateCircleModal.svelte'
  import { Client, networks } from "../packages/circleoftrust/src/index"
  import UserCircle from "./components/UserCircle.svelte";
  import Gallery from "./components/Gallery.svelte";
  import Leaderboard from "./components/Leaderboard.svelte";
  import Earnings from "./components/Earnings.svelte";

  // Svelte 5 State Management using Runes
  let showLoginModal = $state(false);
  let showCreateCircleModal = $state(false);
  let isLoggedIn = $state(false);// Simulate if the user is new



  let contract = $state(new Client({
      ...networks.testnet, // for example; check which networks this library exports
      rpcUrl: "https://soroban-testnet.stellar.org", // use your own, or find one for testing at https://soroban.stellar.org/docs/reference/rpc#public-rpc-providers
      publicKey: "GCSO5OTB667ZFL5WXJRAFV5QJWIVEAR2AX5EFY453U5LYIDZNV4AGA6J",
      signTransaction: async (tx) => {
        console.log("HELLOOOOO")
        console.log(tx)
        return await signTransaction(tx, {networkPassphrase: networks.testnet.networkPassphrase});
      }
  }))

  console.log(contract)

  let userCircle = $state({
    name: "My Sanctuary",
    members: 1,
    password: "initial-password-123",
    address: "",
    id: 0
  });
  
  let galleryPasswords = $state({});

  // Derived state to calculate the background based on member count
  const backgroundClass = $derived(() => {
    const members = userCircle.members;
    if (members <= 2) return 'from-gray-800 via-gray-900 to-black';
    if (members <= 5) return 'from-blue-900 via-indigo-900 to-black';
    if (members <= 10) return 'from-purple-900 via-violet-900 to-black';
    return 'from-rose-900 via-pink-900 to-black';
  });

  // --- Functions ---

  function handleLoginClick() {
    showLoginModal = true;
  }
  
  function handleLogout() {
      isLoggedIn = false;
  }

  // --- Circle Component Logic ---
  function getAtoms(memberCount: number) {
    const atoms = [];
    const radius = 80; // Radius of the circle on which atoms are placed
    const angleStep = (2 * Math.PI) / memberCount;

    for (let i = 0; i < memberCount; i++) {
        const angle = angleStep * i - Math.PI / 2; // Start from top
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        atoms.push({ x, y });
    }
    return atoms;
  }
</script>

<div class={`min-h-screen w-full bg-gradient-to-br text-white font-sans transition-colors duration-1000 ${backgroundClass}`}>
  <!-- Header -->
  <header class="p-4 sm:p-6 flex justify-between items-center bg-black/20 backdrop-blur-sm sticky top-0 z-20">
    <h1 class="text-xl sm:text-2xl font-bold tracking-wider text-cyan-300">
      Not Circle of Trust
    </h1>
    {#if !isLoggedIn}
      <button onclick={handleLoginClick} class="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105">
        Login / Sign Up
      </button>
    {:else}
      <button onclick={handleLogout} class="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105">
        Logout
      </button>
    {/if}
  </header>

  <main class="p-4 sm:p-8">
    {#if isLoggedIn}
      <!-- Logged-in Dashboard View -->
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- User's Circle -->
        <UserCircle
          userCircle={userCircle}
          contract={contract}
          getAtoms={getAtoms}
        ></UserCircle>
        <Gallery
          contract={contract}
          userCircle={userCircle}
          getAtoms={getAtoms}
        ></Gallery>
        <Leaderboard contract={contract}></Leaderboard>
      </div>
      <Earnings contract={contract} userAddress={userCircle.address}/>
    {:else}
     <Welcome></Welcome>
    {/if}
  </main>

  <!-- Login Modal -->
  {#if showLoginModal}
    <LoginModal 
    bind:contract={contract}
    bind:isLoggedIn={isLoggedIn} 
    bind:userCircle={userCircle} 
    bind:showCreateCircleModal={showCreateCircleModal}
    bind:showLoginModal={showLoginModal}
    ></LoginModal>
  {/if}

  <!-- Create Circle Modal -->
  {#if showCreateCircleModal}
    <CreateCircleModal
    bind:contract={contract}
    bind:isLoggedIn={isLoggedIn}
    bind:showCreateCircleModal={showCreateCircleModal}
    bind:userCircle={userCircle}
    ></CreateCircleModal>
  {/if}
</div>
