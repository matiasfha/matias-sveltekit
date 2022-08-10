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
	import { onMount } from 'svelte'
	import { partytownSnippet } from '@builder.io/partytown/integration'

	// Add the Partytown script to the DOM head
	let scriptEl
	onMount(
		() =>
		scriptEl &&
		(scriptEl.textContent = partytownSnippet())
	)

</script>

<svelte:head>
  <!-- Config options -->
  <script>
    // Config options
    partytown = {
      forward: ['dataLayer.push'],
      resolveUrl: (url) => {
        const siteUrl = 'https://matiashernandez.dev/proxytown'

        if (url.hostname === 'www.google-analytics.com') {
          const proxyUrl = new URL(`${siteUrl}/ga`)
          return proxyUrl
        }else if(url.hostname === 'pagead2.googlesyndication.com') {
		  const proxyUrl = new URL(`${siteUrl}/pagead`)
		  return proxyUrl
		}else if(url.hostname === 'resources.infolinks.com') {
		  const proxyUrl = new URL(`${siteUrl}/infolinks`)
		  return proxyUrl
		}
        return url
      }
    }
    
  </script>

  <!-- `partytownSnippet` is inserted here -->
  <script bind:this={scriptEl}></script>

  <!-- Infolinks ads  -->
	<script type="text/partytown">
		var infolinks_pid = 3369090;
		var infolinks_wsid = 0;
	</script>
	<script type="text/partytown"  src="https://resources.infolinks.com/js/infolinks_main.js"></script>
	<script type="text/partytown" defer data-domain="matiashernandez.dev" src="https://matiashernandez.dev/svelte-stats/js/script.js" data-api="/svelte-stats/api/event"></script>		
	<script type="text/partytown"  async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8352667732450998"
     crossorigin="anonymous"></script>

</svelte:head>
<!-- Navbar -->
<NavBar />
<main class="mx-auto max-w-7xl px-4 md:px-8">
	<slot />
	
</main>

<Footer />
