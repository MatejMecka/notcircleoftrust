<script lang="ts">
  // No props needed for now
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] py-8">
  <div class="max-w-2xl w-full text-center mb-8">
    <h2 class="text-3xl font-bold text-cyan-300 mb-4">Welcome to Not Circle of Trust</h2>
    <p class="text-lg text-gray-200 mb-2">
      A Stellar blockchain game where trust, strategy, and Kale are everything.
    </p>
    <p class="text-base text-gray-400">
      Create your own circle, invite others, and mine Kale together. But beware: betrayal means one takes all!
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
    <!-- Card 1: Create Your Circle -->
    <div class="bg-black/40 rounded-xl shadow-lg p-6 flex flex-col items-center">
      <!-- Icon: User Group -->
      <svg class="w-10 h-10 text-cyan-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0zm6 13v-2a4 4 0 00-3-3.87M4 20v-2a4 4 0 013-3.87" />
      </svg>
      <h3 class="text-xl font-semibold text-cyan-200 mb-2">Create Your Circle</h3>
      <p class="text-gray-300 text-center">
        Start by creating your own circle and set a secret password. Invite trusted friends to join and grow your circle together.
      </p>
    </div>

    <!-- Card 2: Mine Kale Together -->
    <div class="bg-black/40 rounded-xl shadow-lg p-6 flex flex-col items-center">
      <!-- Icon: Leaf (Kale) -->
      <svg class="w-10 h-10 text-green-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 2C7 7 2 12 12 22c10-10 5-15 0-20z" />
      </svg>
      <h3 class="text-xl font-semibold text-green-300 mb-2">Mine Kale Together</h3>
      <p class="text-gray-300 text-center">
        Every member who joins your circle mines Kale for everyone. The bigger your circle, the more Kale you all earn!
      </p>
    </div>

    <!-- Card 3: Trust & Strategy -->
    <div class="bg-black/40 rounded-xl shadow-lg p-6 flex flex-col items-center">
      <!-- Icon: Shield Check -->
      <svg class="w-10 h-10 text-indigo-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 4v16m8-8H4" />
      </svg>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Trust & Strategy</h3>
      <p class="text-gray-300 text-center">
        Circles thrive on trust. Choose wisely who you invite—everyone’s actions affect the whole circle’s Kale earnings.
      </p>
    </div>

    <!-- Card 4: Betrayal -->
    <div class="bg-black/40 rounded-xl shadow-lg p-6 flex flex-col items-center">
      <!-- Icon: Exclamation -->
      <svg class="w-10 h-10 text-rose-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
      </svg>
      <h3 class="text-xl font-semibold text-rose-300 mb-2">Betrayal</h3>
      <p class="text-gray-300 text-center">
        If someone betrays the circle, they take all the Kale for themselves. Will you risk it for greater rewards?
      </p>
    </div>
  </div>
</div>