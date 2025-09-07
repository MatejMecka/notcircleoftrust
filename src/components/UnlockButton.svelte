<script lang="ts">

    let {contract, userCircle, circle = $bindable(), circles = $bindable()} = $props();
    let password = $state("");

    // Updated logic to check password and unlock the circle's options
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