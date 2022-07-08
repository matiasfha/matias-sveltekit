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
	import '../app.css';
	import Footer from '$components/Footer.svelte';
	import NavBar from '$components/NavBar.svelte';

</script>

<!-- Navbar -->
<NavBar />
<main class="mx-auto max-w-7xl px-4 md:px-8">
	<slot />
	
</main>

<Footer />
