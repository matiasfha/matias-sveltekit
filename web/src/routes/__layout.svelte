<script context="module" lang="ts">
	import { locale, loadTranslations } from '$lib/translations';
	/** @type {import('@sveltejs/kit').Load} */
	export const load = async ({ url }) => {
		const { pathname } = url;

		const defaultLocale = 'en'; // get from cookie, user session, ...

		const initLocale = locale.get() || defaultLocale; // set default if no locale already set

		const ts = await loadTranslations(initLocale, pathname); // keep this just before the `return`

		return {
			props: {
				url
			}
		};
	};
</script>

<script>
	import '../app.postcss';
	import Footer from '$components/Footer.svelte';
	import NavBar from '$components/NavBar.svelte';
	import { fade } from "svelte/transition";
	import  {
		prefetchRoutes
	} from '$app/navigation';
	import { onMount } from 'svelte';
	
	export let url = "";
	const pageTransitionDuration = 300;
	let transition = false 

	onMount(() => {
		transition = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches !== true
		prefetchRoutes();
	})


</script>

<!-- Navbar -->
<NavBar />
<main class="mx-auto max-w-7xl px-4 md:px-8">
	{#key url}
		{#if !!transition}
		<div in:fade={{  duration: pageTransitionDuration, delay: pageTransitionDuration }}
			out:fade={{duration: pageTransitionDuration }}>
			<slot />
		</div>
		{:else}
			<slot />
		{/if}
	{/key}
	
</main>

<Footer />
