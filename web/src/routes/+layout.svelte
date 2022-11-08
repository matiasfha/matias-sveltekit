<script>
	import '../app.css';
	import Footer from '$components/Footer.svelte';
	import NavBar from '$components/NavBar.svelte';
</script>

<NavBar />

<main class="mx-auto max-w-7xl px-4 md:px-8">
	<slot />
</main>

<Footer />
