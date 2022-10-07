<script>
	import '../app.css';
	import Footer from '$components/Footer.svelte';
	import NavBar from '$components/NavBar.svelte';
	import { fly } from 'svelte/transition';

	export let data;
	
</script>

<!-- Navbar -->
<NavBar />
<main class="mx-auto max-w-7xl px-4 md:px-8">
	{#key data.url.pathname}
		<div in:fly={{ x: -5, duration: 1000, delay: 800 }} out:fly={{ x: 5, duration: 1000 }}>
			<slot />
		</div>
	{/key}
	
</main>

<Footer />
