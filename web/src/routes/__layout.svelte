<script>
	import '../app.postcss';
	import Footer from '$components/Footer.svelte';
	import NavBar from '$components/NavBar.svelte';
</script>

<!-- Navbar -->
<NavBar />
<main class="mx-auto w-screen md:max-w-screen-lg px-4 md:px-8">
	<slot />
</main>

<Footer />
