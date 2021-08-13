<script>
	import '../../../app.postcss';
	import Footer from '$components/Footer.svelte';
	import NavBar from '$components/NavBar.svelte';
</script>

<!-- Navbar -->
<NavBar type="blog" />
<slot />

<Footer />

<style>
	button {
		border-radius: 9999px;
		outline: transparent solid 2px;
		outline-offset: 2px;
		border-width: 0px;
		width: 2.5rem;
		height: 2.5rem;
		cursor: pointer;
		padding-left: 0.7rem;
		background-color: rgb(0, 0, 0);
		color: rgba(196, 172, 147, 1);
	}
</style>
