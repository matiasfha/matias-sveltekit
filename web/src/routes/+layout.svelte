<script>
	import '../app.css';
	import Footer from '$components/Footer.svelte';
	import NavBar from '$components/NavBar.svelte';
	import { onMount } from 'svelte';
	import { partytownSnippet } from '@builder.io/partytown/integration';
	// Add the Partytown script to the DOM head
	let scriptEl;
	onMount(() => {
		if (scriptEl) {
			scriptEl.textContent = partytownSnippet();
		}
	});
</script>

<svelte:head>
	<!-- Config options -->
	<script>
		// Forward the necessary functions to the web worker layer
		partytown = {
			forward: ['dataLayer.push'],
			resolveUrl: function (url, location, type) {
				if (url.hostname.includes('convertkit.com')) {
					return new URL('https://matiashernandez.dev/convertkit');
				}
				return url;
			}
		};
	</script>

	<!-- `partytownSnippet` is inserted here -->
	<script bind:this={scriptEl}></script>
</svelte:head>
<NavBar />

<main class="mx-auto max-w-7xl px-4 md:px-8">
	<slot />
</main>

<Footer />
